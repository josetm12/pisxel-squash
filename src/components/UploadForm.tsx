'use client';

import React, { useState, useRef } from 'react';
import wretch from 'wretch';

import { ImageUploader } from '@/components/ImageUploader';
import { MAX_FILES, MAX_FILE_SIZE } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

interface FileUploadResponse {
  success: boolean;
  files: string[]; // array of IDs of files if successful
  error: {
    type: string;
    details: string;
  };
  requestsRemaining: number;
}

const api = wretch().url('/api/upload');

const MainForm: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    // You might want to do something else here, like prepare for upload
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload logic
    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('file', file);
      });
      const quality = e.target?.elements?.quality?.value || '100';
      const resizeBy = e.target?.elements?.imagesize?.value || '100';
      formData.append('quality', quality);
      formData.append('resizeBy', resizeBy);

      const result: FileUploadResponse = await api.post(formData).json();

      setUploadedFiles(result.files);
    } catch (error) {
      console.error('Upload error:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 px-2 md:px-32 flex flex-col gap-10 items-center justify-center h-full"
    >
      <ImageUploader
        onFilesChange={handleFilesChange}
        maxFiles={MAX_FILES}
        maxSize={MAX_FILE_SIZE}
      />
      <Button
        type="submit"
        className="px-4 py-2 text-md transition transform hover:scale-105 motion-reduce:transition-none motion-reduce:hover:transform-none disabled:opacity-50"
        disabled={files.length === 0 || isUploading}
      >
        {isUploading ? <LoaderCircle className="animate-spin" /> : ''}
        Upload Images
      </Button>
    </form>
  );
};

export default MainForm;
