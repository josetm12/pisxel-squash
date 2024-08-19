import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './ImageUploader.module.css';

interface ImageUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export const ImageUploader: React.FC<ImageUploadProps> = ({
  onFilesChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      setFiles(newFiles);
      onFilesChange(newFiles);

      // Generate previews
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prevPreviews) => {
        // Revoke old preview URLs to avoid memory leaks
        prevPreviews.forEach(URL.revokeObjectURL);
        return newPreviews;
      });
    },
    [files, maxFiles, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: maxSize,
    maxFiles: maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);

    URL.revokeObjectURL(previews[index]);
    setPreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex flex-row flex-wrap gap-10">
        {previews.length > 0 && <div className="lg:w-1/2">Test</div>}
        <div
          {...getRootProps()}
          className={`bg-background flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:shadow-md transition transform motion-reduce:transition-none motion-reduce:hover:transform-none ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 scale-105 transition-all'
              : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-blue-500">Drop the images here ...</p>
          ) : (
            <p>Drag & drop some images here, or click to select files</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            (Max {maxFiles} files, up to {maxSize / 1024 / 1024}MB each)
          </p>
        </div>
      </div>
      {previews.length > 0 && (
        <div className="mt-6 flex flex-row items-center justify-between gap-2">
          {previews.map((preview, index) => (
            <div
              key={preview}
              className={`${styles['preview-image']} relative w-32 h-32`}
            >
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                className=" object-cover rounded-md bg-black shadow-light p-1 transition hover:opacity-80 transform motion-reduce:transition-none motion-reduce:hover:transform-none"
                objectFit={'contain'}
                fill={true}
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute text-white -top-2 -right-2 bg-primary rounded-full w-6 h-6 flex items-center justify-center "
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
