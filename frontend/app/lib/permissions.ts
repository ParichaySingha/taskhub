import type { Project, User } from "~/types";

/**
 * Check if the current user is the owner of a project
 */
export const isProjectOwner = (project: Project, currentUser: User | null): boolean => {
  if (!currentUser || !project.createdBy) {
    return false;
  }

  // Handle both cases where createdBy is a User object or just an ID string
  const createdById = typeof project.createdBy === 'string' 
    ? project.createdBy 
    : project.createdBy._id;

  return createdById === currentUser._id;
};

/**
 * Check if the current user can edit a project (only owner)
 */
export const canEditProject = (project: Project, currentUser: User | null): boolean => {
  return isProjectOwner(project, currentUser);
};

/**
 * Check if the current user can delete a project (only owner)
 */
export const canDeleteProject = (project: Project, currentUser: User | null): boolean => {
  return isProjectOwner(project, currentUser);
};
