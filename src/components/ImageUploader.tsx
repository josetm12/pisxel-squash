import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import useWindowWidth from '@/hooks/useWindowWidth';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from './ui/button';
import { Input } from '@/components/ui/input';
import { ChevronsUpDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import SliderFilter from '@/components/SliderFilter';
import styles from './ImageUploader.module.css';

interface ImageUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

const checkFileUploadError = (rejectedFiles: FileRejection[]) => {
  console.log('Rejected files', rejectedFiles);
  let errors: string[] = [];

  rejectedFiles.forEach((rejectedFile) => {
    const message = rejectedFile.errors[0].message;
    if (errors.indexOf(message) === -1) errors.push(message);
  });

  console.log('unique errors', errors);
};

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    'Bytes',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB',
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

interface ImageData {
  name: string;
  size: number;
}
interface FilterOptionsProps {
  imageFile: File | null;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({ imageFile }) => {
  const windowWidth = useWindowWidth();
  const [isOpen, setIsOpen] = React.useState(windowWidth > 767);
  const [quality, setQuality] = useState([80]);
  console.log('file', imageFile);

  return (
    <>
      <Collapsible
        open={windowWidth > 767 || isOpen}
        onOpenChange={setIsOpen}
        className="w-full flex flex-col gap-1 "
        disabled={windowWidth > 767}
      >
        <div className="flex items-center justify-center space-x-4 px-4 bg-background">
          <h4 className="text-md font-semibold">Image Compression Options</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="px-2 bg-background p-4 flex-1 flex flex-col gap-10 items-center justify-start">
          <div className="slider w-full">
            <div className="text-md font-semibold text-center mb-2">
              Quality: {quality}%
            </div>
            <SliderFilter
              name="quality"
              className="w-full"
              value={quality}
              onValueChange={setQuality}
            />
          </div>
          <div className="w-full flex flex-row items-center justify-center gap-4">
            <Label className="text-md w-1/2 font-semibold">Resize to:</Label>
            <Input
              name="imagesize"
              type="scale"
              placeholder="Set Resize Percentage"
              defaultValue={100}
            />
          </div>
          {imageFile ? (
            <div className="image-details text-md font-semibold self-start">
              <div className="">Name: {imageFile.name}</div>
              <div>Size: {formatBytes(imageFile.size)}</div>
            </div>
          ) : (
            ''
          )}
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};

export const ImageUploader: React.FC<ImageUploadProps> = ({
  onFilesChange,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB default
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [quality, setQuality] = useState([80]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log('inside callback ondrop files.', acceptedFiles);
      if (acceptedFiles.length > maxFiles) {
        console.log(`You can only upload up to ${maxFiles} files.`);
        return;
      }

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

  const { getRootProps, getInputProps, fileRejections, isDragActive } =
    useDropzone({
      onDrop,
      accept: {
        'image/jpeg': [],
        'image/png': [],
        'image/jpg': [],
      },
      maxSize: maxSize,
      maxFiles: maxFiles,
    });

  checkFileUploadError(fileRejections);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);

    URL.revokeObjectURL(previews[index]);
    setPreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex flex-col flex-wrap gap-10">
        {previews.length > 0 ? (
          <div
            key={previews[0]}
            className={`${styles['preview-image']} flex-1 relative`}
          >
            <Image
              src={previews[0]}
              alt="Preview"
              className=" object-cover rounded-md bg-black shadow-light p-1 transition hover:opacity-80 transform motion-reduce:transition-none motion-reduce:hover:transform-none"
              objectFit={'contain'}
              fill={true}
            />
            <button
              onClick={() => removeFile(0)}
              className="absolute text-white -top-2 -right-2 bg-primary rounded-full w-8 h-8 flex items-center justify-center "
            >
              ×
            </button>
          </div>
        ) : (
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
        )}
        <FilterOptions imageFile={files[0]} />
      </div>
      {/* {previews.length > 0 && (
        <div className="mt-6 flex flex-row items-center justify-between gap-2">
          {
            <div
              key={previews[0]}
              className={`${styles['preview-image']} relative w-32 h-32`}
            >
              <Image
                src={previews[0]}
                alt="Preview"
                className=" object-cover rounded-md bg-black shadow-light p-1 transition hover:opacity-80 transform motion-reduce:transition-none motion-reduce:hover:transform-none"
                objectFit={'contain'}
                fill={true}
              />
              <button
                onClick={() => removeFile(0)}
                className="absolute text-white -top-2 -right-2 bg-primary rounded-full w-6 h-6 flex items-center justify-center "
              >
                ×
              </button>
            </div>
          }
        </div>
      )} */}
    </div>
  );
};
