
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Trash2, File, Image, FileText } from "lucide-react";
import { RoomFile } from "@/hooks/useRoom";

interface FileListProps {
  files: RoomFile[];
  onDownload: (file: RoomFile) => void;
  onDelete: (file: RoomFile) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onDownload, onDelete }) => {
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (files.length === 0) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="text-center py-8">
          <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No files uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">Upload files to share with others in this room</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <File className="w-5 h-5" />
          Shared Files ({files.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getFileIcon(file.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {file.file_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.file_size)} • {formatDate(file.uploaded_at)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDownload(file)}
                  className="hover:bg-blue-50 hover:border-blue-300"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(file)}
                  className="hover:bg-red-50 hover:border-red-300 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileList;
