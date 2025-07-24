import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, File, CheckCircle, AlertCircle } from "lucide-react";
import { gameAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUploadComplete: (fileUrl: string, fileSize: string) => void;
  onUploadError: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  gameId?: number;
}

export const FileUpload = ({ 
  onUploadComplete, 
  onUploadError, 
  accept = ".zip,.html",
  maxSize = 50,
  gameId 
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // 检查文件类型
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return `File type not supported. Allowed types: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const error = validateFile(file);
    
    if (error) {
      onUploadError(error);
      return;
    }
    
    setSelectedFile(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await gameAPI.uploadGameFile(selectedFile, gameId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        onUploadComplete(result.fileUrl, result.fileSize);
        setSelectedFile(null);
        setUploadProgress(0);
        
        toast({
          title: "Upload successful",
          description: `${selectedFile.name} has been uploaded successfully.`,
        });
      }, 500);
      
    } catch (error: any) {
      onUploadError(error.message || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              Drop your game file here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse files
            </p>
          </div>
          <Input
            type="file"
            accept={accept}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* File Info */}
      {selectedFile && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              
              {!isUploading && (
                <Button variant="ghost" size="sm" onClick={removeFile}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {isUploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
            
            {!isUploading && (
              <div className="mt-4">
                <Button onClick={uploadFile} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Guidelines */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Upload Guidelines:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Supported formats: ZIP archives or HTML files</li>
            <li>• Maximum file size: {maxSize}MB</li>
            <li>• ZIP files should contain index.html as the main entry point</li>
            <li>• Include all assets (images, sounds, scripts) in the archive</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

// 批量文件上传组件
interface BatchFileUploadProps {
  onUploadComplete: (results: Array<{ fileUrl: string; fileName: string; fileSize: string }>) => void;
  onUploadError: (error: string) => void;
  maxFiles?: number;
}

export const BatchFileUpload = ({ 
  onUploadComplete, 
  onUploadError, 
  maxFiles = 5 
}: BatchFileUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [completedUploads, setCompletedUploads] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const totalFiles = selectedFiles.length + fileArray.length;
    
    if (totalFiles > maxFiles) {
      onUploadError(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...fileArray]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const results: Array<{ fileUrl: string; fileName: string; fileSize: string }> = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileKey = `${i}-${file.name}`;
        
        // 模拟进度
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileKey]: Math.min((prev[fileKey] || 0) + 20, 90)
          }));
        }, 200);

        try {
          const result = await gameAPI.uploadGameFile(file);
          
          clearInterval(progressInterval);
          setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
          setCompletedUploads(prev => [...prev, fileKey]);
          
          results.push({
            fileUrl: result.fileUrl,
            fileName: file.name,
            fileSize: result.fileSize
          });
        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }
      }
      
      onUploadComplete(results);
      
      toast({
        title: "Batch upload successful",
        description: `${selectedFiles.length} files uploaded successfully.`,
      });
      
      // 清理状态
      setSelectedFiles([]);
      setUploadProgress({});
      setCompletedUploads([]);
      
    } catch (error: any) {
      onUploadError(error.message || 'Batch upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              Upload multiple game files
            </p>
            <p className="text-sm text-muted-foreground">
              Select up to {maxFiles} files
            </p>
          </div>
          <Input
            type="file"
            multiple
            accept=".zip,.html"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Files ({selectedFiles.length}/{maxFiles})</Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedFiles.map((file, index) => {
              const fileKey = `${index}-${file.name}`;
              const progress = uploadProgress[fileKey] || 0;
              const isCompleted = completedUploads.includes(fileKey);
              
              return (
                <Card key={fileKey} className="bg-card border-border">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <File className="h-5 w-5 text-primary" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      
                      {!isUploading && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {isUploading && (
                      <div className="mt-2">
                        <Progress value={progress} className="w-full h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {progress}% uploaded
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <Button 
            onClick={uploadFiles} 
            disabled={isUploading || selectedFiles.length === 0}
            className="w-full"
          >
            {isUploading ? "Uploading..." : `Upload ${selectedFiles.length} Files`}
          </Button>
        </div>
      )}
    </div>
  );
};