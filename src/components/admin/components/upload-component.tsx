'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProgressBar } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/providers/auth/AuthProvider';
import { uploadImage } from '@/utils/supabase/file';
import { FileIcon, UploadCloud, X } from 'lucide-react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FileUpload {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  url: string | null;
  error: string | null;
  title: string;
  description: string;
  previewUrl: string | null;
}

const FileUploadItem = memo(
  ({
    fileUpload,
    onRemove,
    onInputChange,
  }: {
    fileUpload: FileUpload;
    onRemove: (id: string) => void;
    onInputChange: (id: string, field: 'title' | 'description', value: string) => void;
  }) => {
    return (
      <div key={fileUpload.id} className="space-y-2 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <Alert
            className={`bg-${fileUpload.status === 'error' ? 'red' : 'purple'}-50 border-${
              fileUpload.status === 'error' ? 'red' : 'purple'
            }-200 flex-grow`}
          >
            <FileIcon
              className={`h-4 w-4 text-${fileUpload.status === 'error' ? 'red' : 'purple'}-500`}
            />
            <AlertTitle className={`text-${fileUpload.status === 'error' ? 'red' : 'purple'}-800`}>
              {fileUpload.file.name}
            </AlertTitle>
            <AlertDescription
              className={`text-${fileUpload.status === 'error' ? 'red' : 'purple'}-600`}
            >
              {fileUpload.status}
            </AlertDescription>
          </Alert>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(fileUpload.id)}
            disabled={fileUpload.status === 'uploading'}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Input
          placeholder="Image Title"
          value={fileUpload.title}
          onChange={(e) => onInputChange(fileUpload.id, 'title', e.target.value)}
          disabled={fileUpload.status === 'uploading'}
          className="bg-gray-50"
        />
        <Textarea
          placeholder="Image Description"
          value={fileUpload.description}
          onChange={(e) => onInputChange(fileUpload.id, 'description', e.target.value)}
          disabled={fileUpload.status === 'uploading'}
          className="bg-gray-50"
        />

        {fileUpload.status === 'uploading' && (
          <ProgressBar progress={fileUpload.progress} className="w-full" />
        )}

        {fileUpload.status === 'idle' && fileUpload.previewUrl && (
          <img
            src={fileUpload.previewUrl}
            alt="Preview"
            className="w-full h-auto rounded-lg shadow-md"
          />
        )}
      </div>
    );
  },
);

const UploadComponent = () => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLLabelElement>(null);
  const uploadingRef = useRef<Set<string>>(new Set());

  const createPreviewUrl = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = useCallback(
    async (newFiles: File[]) => {
      const fileUploads = await Promise.all(
        newFiles.map(async (file) => ({
          id: `${file.name}-${Date.now()}`,
          file,
          status: 'idle' as UploadStatus,
          progress: 0,
          url: null,
          error: null,
          title: '',
          description: '',
          previewUrl: await createPreviewUrl(file),
        })),
      );
      setFiles((prevFiles) => [...prevFiles, ...fileUploads]);
    },
    [createPreviewUrl],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) {
        handleFileChange(Array.from(e.dataTransfer.files));
      }
    },
    [handleFileChange],
  );

  const handleInputChange = useCallback(
    (id: string, field: 'title' | 'description', value: string) => {
      setFiles((prevFiles) =>
        prevFiles.map((file) => (file.id === id ? { ...file, [field]: value } : file)),
      );
    },
    [],
  );

  const uploadFile = useCallback(
    async (fileUpload: FileUpload): Promise<void> => {
      if (!user || uploadingRef.current.has(fileUpload.id)) return;

      uploadingRef.current.add(fileUpload.id);

      try {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileUpload.id ? { ...f, status: 'uploading', progress: 0 } : f,
          ),
        );

        const { imageUrl, error } = await uploadImage({
          file: fileUpload.file,
          bucket: 'uploads',
          folder: 'illustrations',
          title: fileUpload.title,
          description: fileUpload.description,
          user_id: user.id,
        });

        if (error) throw new Error(error);

        // Simulate upload progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 5;
          if (progress <= 100) {
            setFiles((prevFiles) =>
              prevFiles.map((f) => (f.id === fileUpload.id ? { ...f, progress } : f)),
            );
          }
          if (progress >= 100) {
            clearInterval(progressInterval);
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.id === fileUpload.id ? { ...f, status: 'success', url: imageUrl } : f,
              ),
            );
            uploadingRef.current.delete(fileUpload.id);
          }
        }, 50);
      } catch (error) {
        console.error('Error uploading file:', error);
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileUpload.id
              ? {
                  ...f,
                  status: 'error',
                  error: error instanceof Error ? error.message : 'An unknown error occurred',
                }
              : f,
          ),
        );
        uploadingRef.current.delete(fileUpload.id);
      }
    },
    [user],
  );

  const handleUpload = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === 'idle');
    await Promise.all(pendingFiles.map(uploadFile));
  }, [files, uploadFile]);

  const removeFile = useCallback((id: string) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.id !== id));
  }, []);

  const resetUpload = useCallback(() => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    uploadingRef.current.clear();
  }, []);

  const isUploading = useMemo(() => files.some((f) => f.status === 'uploading'), [files]);

  return (
    <Card className="w-full max-w-3xl mx-auto bg-gradient-to-br from-purple-50 to-indigo-50 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-t-lg sr-only">
        <CardTitle className="text-2xl font-bold">Upload Images</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <Label
            ref={dropzoneRef}
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-white transition-all duration-200 ${
              isDragging ? 'border-purple-500 bg-purple-50' : 'hover:bg-gray-100'
            }`}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-3 text-purple-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
            </div>
            <Input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={(e) => e.target.files && handleFileChange(Array.from(e.target.files))}
              disabled={files.some((f) => f.status === 'uploading')}
              accept="image/*"
              multiple
              ref={fileInputRef}
            />
          </Label>

          {files.map((fileUpload) => (
            <FileUploadItem
              key={fileUpload.id}
              fileUpload={fileUpload}
              onRemove={removeFile}
              onInputChange={handleInputChange}
            />
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg">
        <Button
          onClick={handleUpload}
          disabled={!files.length || isUploading || !user}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105"
        >
          {isUploading
            ? 'Uploading...'
            : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
        </Button>
        {files.length > 0 && (
          <Button onClick={resetUpload} variant="outline" className="ml-2 hover:bg-gray-100">
            <X className="h-4 w-4 mr-2" /> Reset
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default memo(UploadComponent);
