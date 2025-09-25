import ActivityLog from "../models/activity.js";

export const recordActivity = async (userId, action, resourceType, resourceId, metadata = {}) => {
  try {
    const activity = new ActivityLog({
      user: userId,
      action,
      resourceType,
      resourceId,
      description: metadata.description || `${action} ${resourceType}`,
      metadata,
    });

    await activity.save();
    return activity;
  } catch (error) {
    console.error("Error recording activity:", error);
    throw error;
  }
};
