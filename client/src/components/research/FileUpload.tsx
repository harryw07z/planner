import { useState, useRef } from "react";
import { Upload, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/useToast";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  projectId: number;
  onUploadComplete: () => void;
}

const FileUpload = ({ projectId, onUploadComplete }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFiles = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i]);
    }
  };

  const uploadFile = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) { // 20MB
      toast({
        title: "File too large",
        description: "Maximum file size is 20MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId.toString());
      
      // Upload the file
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(100);
          toast({
            title: "Upload successful",
            description: `${file.name} has been uploaded.`,
          });
          onUploadComplete();
        } else {
          throw new Error(`Upload failed: ${xhr.statusText}`);
        }
      });
      
      xhr.addEventListener('error', () => {
        throw new Error('Network error occurred during upload');
      });
      
      xhr.open('POST', '/api/materials/upload');
      xhr.send(formData);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  return (
    <div
      className={`file-upload-zone w-full py-12 rounded-lg mb-4 flex flex-col items-center justify-center transition-all ${
        isDragging ? "border-primary" : "border-2 border-dashed border-neutral-200"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        multiple
      />
      
      {isUploading ? (
        <div className="w-full max-w-md px-4">
          <p className="text-sm font-medium text-text mb-2 text-center">Uploading...</p>
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-neutral-500 mt-2 text-center">{uploadProgress}%</p>
        </div>
      ) : (
        <>
          <Upload className="h-12 w-12 text-neutral-400 mb-3" />
          <p className="text-sm font-medium text-text mb-1">Drag and drop files here</p>
          <p className="text-xs text-neutral-400 mb-4">or</p>
          <Button onClick={handleBrowseClick}>Browse Files</Button>
        </>
      )}
    </div>
  );
};

export default FileUpload;
