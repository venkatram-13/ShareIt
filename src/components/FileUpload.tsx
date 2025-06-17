
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<boolean>;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
    // Reset input value to allow uploading same file again
    e.target.value = '';
  };

  const handleFileUpload = async (file: File) => {
    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await onFileUpload(file);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={`border-2 border-dashed transition-colors ${
      isDragging 
        ? 'border-purple-500 bg-purple-50' 
        : 'border-gray-300 hover:border-gray-400'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <CardContent 
        className="p-6 text-center"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
          accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDragging ? 'bg-purple-500' : 'bg-gray-100'
          }`}>
            <Upload className={`w-6 h-6 ${isDragging ? 'text-white' : 'text-gray-500'}`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {uploading ? 'Uploading...' : 'Drop files here or click to browse'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports images, PDFs, documents (max 50MB)
            </p>
          </div>
          
          {!disabled && !uploading && (
            <Button variant="outline" className="mt-2">
              Choose File
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
