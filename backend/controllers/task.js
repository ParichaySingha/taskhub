import { recordActivity } from "../libs/index.js";
import ActivityLog from "../models/activity.js";
import Comment from "../models/comment.js";
import Project from "../models/project.js";
import Task from "../models/task.js";
import Workspace from "../models/workspace.js";
import Verification from "../models/verification.js";
import { createAndSendNotification } from "./notification.js";

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assignees, estimatedTime } =
      req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const workspace = await Workspace.findById(project.workspace);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignees,
      estimatedTime,
      project: projectId,
      createdBy: req.user._id,
    });

    project.tasks.push(newTask._id);
    await project.save();

    // record activity
    await recordActivity(req.user._id, "created_task", "Task", newTask._id, {
      description: `created task "${title}"`,
    });

    // Send notifications to assigned users
    if (assignees && assignees.length > 0) {
      const io = req.app.get('io');
      const project = await Project.findById(projectId).populate('workspace');
      
      for (const assigneeId of assignees) {
        // Don't send notification to the creator
        if (assigneeId.toString() !== req.user._id.toString()) {
          try {
            await createAndSendNotification(io, {
              recipient: assigneeId,
              sender: req.user._id,
              type: "task_assigned",
              title: "New Task Assigned",
              message: `${req.user.name} assigned you a new task: "${title}"`,
              data: {
                taskId: newTask._id,
                projectId: projectId,
                workspaceId: project.workspace._id,
              },
              workspace: project.workspace._id,
            });
          } catch (error) {
            console.log("Error sending task assignment notification:", error);
          }
        }
      }
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate("assignees", "name profilePicture")
      .populate("watchers", "name profilePicture");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project).populate(
      "members.user",
      "name profilePicture"
    );

    res.status(200).json({ task, project });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskTitle = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldTitle = task.title;

    task.title = title;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task title from ${oldTitle} to ${title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const updateTaskDescription = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { description } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldDescription =
      task.description.substring(0, 50) +
      (task.description.length > 50 ? "..." : "");
    const newDescription =
      description.substring(0, 50) + (description.length > 50 ? "..." : "");

    task.description = description;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task description from ${oldDescription} to ${newDescription}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId).populate('project');

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldStatus = task.status;

    // Check if user is assigned to the task
    const isAssigned = task.assignees.some(
      assignee => assignee.toString() === req.user._id.toString()
    );

    // Check if user is project manager/owner
    const isManager = project.members.some(
      member => member.user.toString() === req.user._id.toString() && 
      (member.role === "manager" || member.role === "owner")
    );

    // If user is assigned but not a manager, they need verification for status changes
    if (isAssigned && !isManager && oldStatus !== status) {
      // Check if there's already a pending verification
      const existingVerification = await Verification.findOne({
        task: taskId,
        status: "pending"
      });

      if (existingVerification) {
        return res.status(400).json({
          message: "There is already a pending verification for this task. Please wait for approval.",
        });
      }

      // Create verification request
      const projectOwner = project.members.find(
        member => member.role === "manager" || member.role === "owner"
      );

      if (!projectOwner) {
        return res.status(400).json({
          message: "No project manager found to verify this request",
        });
      }

      const verification = await Verification.create({
        task: taskId,
        project: task.project,
        workspace: project.workspace,
        requestedBy: req.user._id,
        requestedFor: projectOwner.user,
        currentStatus: oldStatus,
        requestedStatus: status,
        reason: `Status change request from ${oldStatus} to ${status}`,
      });

      // Update task to require verification
      task.requiresVerification = true;
      task.pendingVerification = verification._id;
      await task.save();

      // Record activity
      await recordActivity(req.user._id, "requested_verification", "Task", taskId, {
        description: `requested verification to change status from ${oldStatus} to ${status}`,
      });

      // Send notification to project owner
      const io = req.app.get('io');
      try {
        await createAndSendNotification(io, {
          recipient: projectOwner.user,
          sender: req.user._id,
          type: "verification_requested",
          title: "Verification Request",
          message: `${req.user.name} requested verification to change task "${task.title}" status from ${oldStatus} to ${status}`,
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

      return res.status(200).json({
        message: "Status change request submitted for verification",
        requiresVerification: true,
        verificationId: verification._id,
        task: task
      });
    }

    // If user is manager/owner or status change doesn't require verification, proceed normally
    // Handle Archive status specially
    if (status === "Archive") {
      task.isArchived = true;
      // Keep the original status but mark as archived
    } else {
      task.status = status;
      // If unarchiving, set isArchived to false
      if (task.isArchived && status !== "Archive") {
        task.isArchived = false;
      }
    }
    
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: status === "Archive" 
        ? `archived task ${task.title}`
        : `updated task status from ${oldStatus} to ${status}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const updateTaskAssignees = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignees } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldAssignees = task.assignees;

    task.assignees = assignees;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task assignees from ${oldAssignees.length} to ${assignees.length}`,
    });

    // Send notifications to newly assigned users
    if (assignees && assignees.length > 0) {
      const io = req.app.get('io');
      const project = await Project.findById(task.project).populate('workspace');
      
      // Find newly assigned users
      const newAssignees = assignees.filter(
        assigneeId => !oldAssignees.some(oldAssignee => 
          oldAssignee.toString() === assigneeId.toString()
        )
      );
      
      for (const assigneeId of newAssignees) {
        // Don't send notification to the person making the change
        if (assigneeId.toString() !== req.user._id.toString()) {
          try {
            await createAndSendNotification(io, {
              recipient: assigneeId,
              sender: req.user._id,
              type: "task_assigned",
              title: "Task Assigned to You",
              message: `${req.user.name} assigned you to task: "${task.title}"`,
              data: {
                taskId: task._id,
                projectId: task.project,
                workspaceId: project.workspace._id,
              },
              workspace: project.workspace._id,
            });
          } catch (error) {
            console.log("Error sending task assignment notification:", error);
          }
        }
      }
    }

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
const updateTaskPriority = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { priority } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const oldPriority = task.priority;

    task.priority = priority;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `updated task priority from ${oldPriority} to ${priority}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addSubTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const newSubTask = {
      title,
      completed: false,
    };

    task.subtasks.push(newSubTask);
    await task.save();

    // record activity
    await recordActivity(req.user._id, "created_subtask", "Task", taskId, {
      description: `created subtask ${title}`,
    });

    res.status(201).json(task);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateSubTask = async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { completed } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const subTask = task.subtasks.find(
      (subTask) => subTask._id.toString() === subTaskId
    );

    if (!subTask) {
      return res.status(404).json({
        message: "Subtask not found",
      });
    }

    subTask.completed = completed;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_subtask", "Task", taskId, {
      description: `updated subtask ${subTask.title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getActivityByResourceId = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const activity = await ActivityLog.find({ resourceId })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(activity);
  } catch (error) {
    console.log("Activity fetch error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCommentsByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.find({ task: taskId })
      .populate("author", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const newComment = await Comment.create({
      text,
      task: taskId,
      author: req.user._id,
    });

    task.comments.push(newComment._id);
    await task.save();

    // record activity
    await recordActivity(req.user._id, "added_comment", "Task", taskId, {
      description: `added comment ${
        text.substring(0, 50) + (text.length > 50 ? "..." : "")
      }`,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const watchTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const isWatching = task.watchers.includes(req.user._id);

    if (!isWatching) {
      task.watchers.push(req.user._id);
    } else {
      task.watchers = task.watchers.filter(
        (watcher) => watcher.toString() !== req.user._id.toString()
      );
    }

    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `${
        isWatching ? "stopped watching" : "started watching"
      } task ${task.title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const achievedTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }
    const isAchieved = task.isArchived;

    task.isArchived = !isAchieved;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `${isAchieved ? "unachieved" : "achieved"} task ${
        task.title
      }`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignees: { $in: [req.user._id] } })
      .populate({
        path: "project",
        select: "title workspace _id",
        populate: {
          path: "workspace",
          select: "_id"
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getArchivedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      assignees: { $in: [req.user._id] },
      isArchived: true
    })
      .populate({
        path: "project",
        select: "title workspace _id",
        populate: {
          path: "workspace",
          select: "_id"
        }
      })
      .sort({ createdAt: -1 });

    // Filter out tasks with missing project data
    const validTasks = tasks.filter(task => task.project && task.project._id);

    res.status(200).json(validTasks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const unarchiveTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    task.isArchived = false;
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `unarchived task ${task.title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getCalendarTasks = async (req, res) => {
  try {
    // Get all tasks assigned to the user across all projects they're a member of
    const tasks = await Task.find({ 
      assignees: { $in: [req.user._id] },
      dueDate: { $exists: true, $ne: null }
    })
      .populate({
        path: "project",
        select: "title workspace _id",
        populate: {
          path: "workspace",
          select: "name _id"
        }
      })
      .populate("assignees", "name profilePicture")
      .sort({ dueDate: 1 });

    // Transform tasks to include project and workspace names
    const calendarTasks = tasks.map(task => ({
      ...task.toObject(),
      projectName: task.project?.title || 'Unknown Project',
      workspaceName: task.project?.workspace?.name || 'Unknown Workspace'
    }));

    res.status(200).json(calendarTasks);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const startTimeTracking = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    // Start time tracking
    task.timeTracking.isTracking = true;
    task.timeTracking.startTime = new Date();
    
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `started time tracking for task ${task.title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const pauseTimeTracking = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (task.timeTracking.isTracking && task.timeTracking.startTime) {
      const sessionDuration = Math.floor((new Date().getTime() - task.timeTracking.startTime.getTime()) / 1000);
      task.timeTracking.elapsedTime += sessionDuration;
      
      // Add session to history
      task.timeTracking.sessions.push({
        startTime: task.timeTracking.startTime,
        endTime: new Date(),
        duration: sessionDuration
      });
    }

    task.timeTracking.isTracking = false;
    task.timeTracking.startTime = null;
    
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `paused time tracking for task ${task.title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const stopTimeTracking = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
      message: "Project not found",
    });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (task.timeTracking.isTracking && task.timeTracking.startTime) {
      const sessionDuration = Math.floor((new Date().getTime() - task.timeTracking.startTime.getTime()) / 1000);
      task.timeTracking.elapsedTime += sessionDuration;
      
      // Add final session to history
      task.timeTracking.sessions.push({
        startTime: task.timeTracking.startTime,
        endTime: new Date(),
        duration: sessionDuration
      });
    }

    task.timeTracking.isTracking = false;
    task.timeTracking.startTime = null;
    
    await task.save();

    // record activity
    await recordActivity(req.user._id, "updated_task", "Task", taskId, {
      description: `stopped time tracking for task ${task.title}`,
    });

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateTimeTracking = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { elapsedTime } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    // Update elapsed time
    task.timeTracking.elapsedTime = elapsedTime;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    // Remove task from project's tasks array
    project.tasks = project.tasks.filter(
      (taskId) => taskId.toString() !== task._id.toString()
    );
    await project.save();

    // Delete all comments associated with this task
    await Comment.deleteMany({ task: taskId });

    // Delete all activity logs associated with this task
    await ActivityLog.deleteMany({ resourceId: taskId });

    // Delete the task
    await Task.findByIdAndDelete(taskId);

    // record activity
    await recordActivity(req.user._id, "deleted_task", "Task", taskId, {
      description: `deleted task ${task.title}`,
    });

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const attachment = {
      fileName: req.file.originalname,
      fileUrl: `/uploads/task-attachments/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
    };

    task.attachments.push(attachment);
    await task.save();

    // record activity
    await recordActivity(req.user._id, "added_attachment", "Task", taskId, {
      description: `added attachment ${req.file.originalname}`,
    });

    res.status(201).json(attachment);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const { taskId, attachmentId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const attachment = task.attachments.id(attachmentId);

    if (!attachment) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    // Check if user is the uploader or has permission
    const isUploader = attachment.uploadedBy.toString() === req.user._id.toString();
    const isProjectManager = project.members.some(
      (member) => member.user.toString() === req.user._id.toString() && 
      (member.role === "manager" || member.role === "admin")
    );

    if (!isUploader && !isProjectManager) {
      return res.status(403).json({
        message: "You don't have permission to delete this attachment",
      });
    }

    // Remove attachment from task
    task.attachments.pull(attachmentId);
    await task.save();

    // record activity
    await recordActivity(req.user._id, "removed_attachment", "Task", taskId, {
      description: `removed attachment ${attachment.fileName}`,
    });

    res.status(200).json({
      message: "Attachment deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const downloadAttachment = async (req, res) => {
  try {
    const { taskId, attachmentId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const attachment = task.attachments.id(attachmentId);

    if (!attachment) {
      return res.status(404).json({
        message: "Attachment not found",
      });
    }

    // Construct the full file path
    const filePath = `./uploads/task-attachments/${attachment.fileUrl.split('/').pop()}`;
    
    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName}"`);
    res.setHeader('Content-Type', attachment.fileType);
    res.setHeader('Content-Length', attachment.fileSize);

    // Send the file
    res.sendFile(filePath, { root: '.' }, (err) => {
      if (err) {
        console.log(err);
        return res.status(404).json({
          message: "File not found",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  createTask,
  getTaskById,
  updateTaskTitle,
  updateTaskDescription,
  updateTaskStatus,
  updateTaskAssignees,
  updateTaskPriority,
  addSubTask,
  updateSubTask,
  getActivityByResourceId,
  getCommentsByTaskId,
  addComment,
  watchTask,
  achievedTask,
  getMyTasks,
  getArchivedTasks,
  unarchiveTask,
  getCalendarTasks,
  startTimeTracking,
  pauseTimeTracking,
  stopTimeTracking,
  updateTimeTracking,
  deleteTask,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
};