import { Download, File, FileImage, FileText, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { useAuth } from "~/provider/auth-context";
import { useDeleteAttachmentMutation, useDownloadAttachment } from "~/hooks/use-task";
import type { Attachment } from "~/types";

interface TaskAttachmentsProps {
  attachments: Attachment[];
  taskId: string;
  onUpload?: () => void;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <FileImage className="h-4 w-4 text-blue-500" />;
  }
  if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) {
    return <FileText className="h-4 w-4 text-red-500" />;
  }
  return <File className="h-4 w-4 text-gray-500" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const TaskAttachments = ({ attachments, taskId, onUpload }: TaskAttachmentsProps) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const { mutate: deleteAttachment } = useDeleteAttachmentMutation();
  const { mutate: downloadAttachment } = useDownloadAttachment();

  const handleDownload = async (attachment: Attachment) => {
    try {
      downloadAttachment(
        { taskId, attachmentId: attachment._id },
        {
          onSuccess: async (response) => {
            if (response) {
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = attachment.fileName;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              toast.success("File downloaded successfully");
            }
          },
          onError: () => {
            toast.error("Failed to download file");
          },
        }
      );
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download file");
    }
  };

  const handleDelete = (attachmentId: string) => {
    setIsDeleting(attachmentId);
    deleteAttachment(
      { taskId, attachmentId },
      {
        onSuccess: () => {
          toast.success("Attachment deleted successfully");
          setIsDeleting(null);
        },
        onError: () => {
          toast.error("Failed to delete attachment");
          setIsDeleting(null);
        },
      }
    );
  };

  const canDelete = (attachment: Attachment) => {
    return attachment.uploadedBy === user?._id;
  };

  if (attachments.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Attachments
          </h3>
          {onUpload && (
            <Button variant="outline" size="sm" onClick={onUpload}>
              Upload File
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground text-center py-4">
          No attachments yet
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Attachments ({attachments.length})
        </h3>
        {onUpload && (
          <Button variant="outline" size="sm" onClick={onUpload}>
            Upload File
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <Card key={attachment._id} className="p-3">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(attachment.fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.fileName}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDate(attachment.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {canDelete(attachment) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(attachment._id)}
                      disabled={isDeleting === attachment._id}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      {isDeleting === attachment._id ? (
                        <X className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
