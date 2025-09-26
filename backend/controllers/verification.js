import Verification from "../models/verification.js";
import Task from "../models/task.js";
import Project from "../models/project.js";
import Workspace from "../models/workspace.js";
import { createAndSendNotification } from "./notification.js";
import { recordActivity } from "../libs/index.js";

// Create a verification request
const createVerificationRequest = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { requestedStatus, reason } = req.body;

    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const workspace = await Workspace.findById(project.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if user is assigned to the task
    const isAssigned = task.assignees.some(
      assignee => assignee.toString() === req.user._id.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({ 
        message: "You can only request verification for tasks assigned to you" 
      });
    }

    // Check if there's already a pending verification
    const existingVerification = await Verification.findOne({
      task: taskId,
      status: "pending"
    });

    if (existingVerification) {
      return res.status(400).json({ 
        message: "There is already a pending verification for this task" 
      });
    }

    // Find the project owner/manager who can verify
    const projectOwner = project.members.find(
      member => member.role === "manager"
    );

    if (!projectOwner) {
      return res.status(400).json({ 
        message: "No project manager found to verify this request" 
      });
    }

    const verification = await Verification.create({
      task: taskId,
      project: task.project,
      workspace: project.workspace,
      requestedBy: req.user._id,
      requestedFor: projectOwner.user,
      currentStatus: task.status,
      requestedStatus,
      reason,
    });

    // Update task to require verification
    task.requiresVerification = true;
    task.pendingVerification = verification._id;
    await task.save();

    // Record activity
    await recordActivity(req.user._id, "requested_verification", "Task", taskId, {
      description: `requested verification to change status from ${task.status} to ${requestedStatus}`,
    });

    // Send notification to project owner
    const io = req.app.get('io');
    try {
      await createAndSendNotification(io, {
        recipient: projectOwner.user,
        sender: req.user._id,
        type: "verification_requested",
        title: "Verification Request",
        message: `${req.user.name} requested verification to change task "${task.title}" status from ${task.status} to ${requestedStatus}`,
        data: {
          taskId: task._id,
          projectId: task.project,
          workspaceId: project.workspace,
          verificationId: verification._id,
        },
        workspace: project.workspace,
      });
    } catch (error) {
      console.log("Error sending verification notification:", error);
    }

    res.status(201).json(verification);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get all verification requests for a user (as owner/manager)
const getVerificationRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { requestedFor: req.user._id };
    if (status) {
      query.status = status;
    }

    const verifications = await Verification.find(query)
      .populate('task', 'title description status')
      .populate('project', 'title')
      .populate('workspace', 'name')
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(verifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get verification requests made by the current user
const getMyVerificationRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { requestedBy: req.user._id };
    if (status) {
      query.status = status;
    }

    const verifications = await Verification.find(query)
      .populate('task', 'title description status')
      .populate('project', 'title')
      .populate('workspace', 'name')
      .populate('requestedFor', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(verifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Approve or reject a verification request
const updateVerificationStatus = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { status, verificationNotes } = req.body;

    const verification = await Verification.findById(verificationId)
      .populate('task')
      .populate('project')
      .populate('workspace');

    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }

    // Check if user is authorized to verify (project manager/owner)
    const isAuthorized = verification.requestedFor.toString() === req.user._id.toString();
    if (!isAuthorized) {
      return res.status(403).json({ 
        message: "You are not authorized to verify this request" 
      });
    }

    if (verification.status !== "pending") {
      return res.status(400).json({ 
        message: "This verification request has already been processed" 
      });
    }

    // Update verification
    verification.status = status;
    verification.verifiedAt = new Date();
    verification.verifiedBy = req.user._id;
    verification.verificationNotes = verificationNotes;
    await verification.save();

    const task = verification.task;

    if (status === "approved") {
      // Update task status
      task.status = verification.requestedStatus;
      task.requiresVerification = false;
      task.pendingVerification = null;
      await task.save();

      // Record activity
      await recordActivity(req.user._id, "verified_task", "Task", task._id, {
        description: `verified and updated task status to ${verification.requestedStatus}`,
      });

      // Send notification to the requester
      const io = req.app.get('io');
      try {
        await createAndSendNotification(io, {
          recipient: verification.requestedBy,
          sender: req.user._id,
          type: "verification_approved",
          title: "Verification Approved",
          message: `Your request to change task "${task.title}" status to ${verification.requestedStatus} has been approved`,
          data: {
            taskId: task._id,
            projectId: task.project._id,
            workspaceId: task.workspace._id,
            verificationId: verification._id,
          },
          workspace: task.workspace._id,
        });
      } catch (error) {
        console.log("Error sending approval notification:", error);
      }
    } else if (status === "rejected") {
      // Reset task verification status
      task.requiresVerification = false;
      task.pendingVerification = null;
      await task.save();

      // Record activity
      await recordActivity(req.user._id, "rejected_verification", "Task", task._id, {
        description: `rejected verification request to change status to ${verification.requestedStatus}`,
      });

      // Send notification to the requester
      const io = req.app.get('io');
      try {
        await createAndSendNotification(io, {
          recipient: verification.requestedBy,
          sender: req.user._id,
          type: "verification_rejected",
          title: "Verification Rejected",
          message: `Your request to change task "${task.title}" status to ${verification.requestedStatus} has been rejected`,
          data: {
            taskId: task._id,
            projectId: task.project._id,
            workspaceId: task.workspace._id,
            verificationId: verification._id,
          },
          workspace: task.workspace._id,
        });
      } catch (error) {
        console.log("Error sending rejection notification:", error);
      }
    }

    res.status(200).json(verification);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get verification statistics
const getVerificationStats = async (req, res) => {
  try {
    const stats = await Verification.aggregate([
      {
        $match: {
          $or: [
            { requestedBy: req.user._id },
            { requestedFor: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    res.status(200).json(formattedStats);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  createVerificationRequest,
  getVerificationRequests,
  getMyVerificationRequests,
  updateVerificationStatus,
  getVerificationStats,
};
