import React, { useState, useCallback } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);


  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-xl transition-all duration-300
          ${isDragging ? 'border-indigo-400 bg-slate-800/60' : 'border-slate-600 hover:border-indigo-500 bg-slate-800/30'}`}
      >
        <div className="text-center">
          <UploadIcon className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? 'text-indigo-400' : 'text-slate-500'}`} />
          <p className="text-lg font-semibold text-slate-300">
            <label htmlFor="file-upload" className="text-indigo-400 font-semibold cursor-pointer hover:underline">
              Click to upload
            </label> or drag and drop
          </p>
          <p className="text-sm text-slate-500">Excel files (.xlsx, .xls)</p>
        </div>
        <input
          id="file-upload"
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          disabled={isProcessing}
        />
      </div>
    </div>
  );
};

export default FileUpload;
