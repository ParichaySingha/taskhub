import { Upload, X, File, AlertCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { useUploadAttachmentMutation } from "~/hooks/use-task";

interface AttachmentUploadProps {
  taskId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed'
];

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
  }
  
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return 'File type not supported. Please upload images, documents, or archives.';
  }
  
  return null;
};

export const AttachmentUpload = ({ taskId, onClose, onSuccess }: AttachmentUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  
  const { mutate: uploadAttachment, isPending } = useUploadAttachmentMutation();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File) => {
    const fileId = `${file.name}-${file.size}`;
    setUploadingFiles(prev => new Set(prev).add(fileId));
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

    try {
      await uploadAttachment(
        { taskId, file },
        {
          onSuccess: () => {
            toast.success(`${file.name} uploaded successfully`);
            setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
            setTimeout(() => {
              setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[fileId];
                return newProgress;
              });
            }, 1000);
          },
          onError: (error) => {
            console.error('Upload error:', error);
            toast.error(`Failed to upload ${file.name}`);
          },
        }
      );
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      await uploadFile(file);
    }

    setSelectedFiles([]);
    onSuccess?.();
    onClose();
  };

  const isUploading = uploadingFiles.size > 0 || isPending;

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          accept={ALLOWED_FILE_TYPES.join(',')}
        />
        <Button asChild>
          <label htmlFor="file-upload" className="cursor-pointer">
            Choose Files
          </label>
        </Button>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => {
              const fileId = `${file.name}-${file.size}`;
              const progress = uploadProgress[fileId] || 0;
              const isUploading = uploadingFiles.has(fileId);

              return (
                <Card key={index} className="p-3">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      
                      {!isUploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {isUploading && (
                      <div className="mt-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploading... {progress}%
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      )}

      {/* File Type Info */}
      <div className="text-xs text-muted-foreground">
        <div className="flex items-center space-x-1 mb-1">
          <AlertCircle className="h-3 w-3" />
          <span className="font-medium">Supported formats:</span>
        </div>
        <p>Images: JPEG, PNG, GIF, WebP</p>
        <p>Documents: PDF, Word, Excel, PowerPoint, Text, CSV</p>
        <p>Archives: ZIP, RAR, 7Z</p>
        <p>Maximum file size: 5MB per file</p>
      </div>
    </div>
  );
};
