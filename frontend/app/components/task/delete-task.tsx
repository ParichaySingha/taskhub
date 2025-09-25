import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { useDeleteTaskMutation } from '~/hooks/use-task';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, Trash2, Calendar, User, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Task } from '~/types';

interface DeleteTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onSuccess: () => void;
}

export const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({
  isOpen,
  onOpenChange,
  task,
  onSuccess,
}) => {
  const { mutate: deleteTask, isPending } = useDeleteTaskMutation();
  const [confirmText, setConfirmText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isConfirmed = confirmText.toLowerCase() === 'delete';
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const handleDelete = () => {
    if (!isConfirmed) {
      toast.error('Please type "delete" to confirm');
      return;
    }

    deleteTask(task._id, {
      onSuccess: () => {
        toast.success('Task deleted successfully', {
          description: `"${task.title}" has been permanently removed`,
          duration: 4000,
        });
        onSuccess();
        onOpenChange(false);
        setConfirmText('');
        setShowAdvanced(false);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || 'Failed to delete task';
        toast.error('Delete failed', {
          description: errorMessage,
          duration: 5000,
        });
      },
    });
  };

  const handleClose = () => {
    if (!isPending) {
      onOpenChange(false);
      setConfirmText('');
      setShowAdvanced(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Delete Task</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{task.assignees?.length || 0} assignees</span>
                  </div>
                </div>
              </div>
              <Badge 
                variant={
                  task.priority === "High" ? "destructive" : 
                  task.priority === "Medium" ? "default" : "outline"
                }
                className="ml-2"
              >
                {task.priority}
              </Badge>
            </div>
          </div>

          {/* Warning for subtasks */}
          {hasSubtasks && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                This task has {task.subtasks?.length} subtask(s) that will also be deleted.
              </AlertDescription>
            </Alert>
          )}

          {/* Advanced Options */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {showAdvanced ? 'Hide' : 'Show'} advanced options
            </Button>

            {showAdvanced && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 mb-2">
                  For security, please type <strong>"delete"</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type 'delete' to confirm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={isPending}
                />
              </div>
            )}
          </div>

          {/* Main Warning */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> This will permanently delete the task and all associated data including subtasks and time tracking.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || (showAdvanced && !isConfirmed)}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting Task...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
