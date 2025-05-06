import React from "react";
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  FileInput,
} from "@/common/components/file-input";
import { Label } from "@radix-ui/react-label";
import { Paperclip } from "lucide-react";

const FileSvgDraw: React.FC = () => {
  return (
    <>
      <svg
        className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">Click to upload</span>
        &nbsp; or drag and drop
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        SVG, PNG, JPG or GIF
      </p>
    </>
  );
};
   
interface DocumentsProps {
  files: File[];
  setFiles: (files: File[]) => void;
}

const Documents: React.FC<DocumentsProps> = ({ files, setFiles }) => {
 
  const dropZoneConfig = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  return (
    <div className="p-6">
      <div className="flex items-start mb-6">
        <Label className="w-24 pt-2 font-medium">Forms</Label>
        <FileUploader
          value={files}
          onValueChange={(newFiles) => setFiles(newFiles || [])}
          dropzoneOptions={dropZoneConfig}
          className="relative bg-background rounded-lg p-2 flex-1"
        >
          <FileInput className="outline-dashed outline-1 outline-gray-300 rounded-md">
            <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full">
              <FileSvgDraw />
            </div>
          </FileInput>
          <FileUploaderContent>
            {files &&
              files.length > 0 &&
              files.map((file, i) => (
                <FileUploaderItem key={i} index={i} className="py-2 px-3">
                  <Paperclip className="h-4 w-4 stroke-current mr-2" />
                  <span>{file.name}</span>
                </FileUploaderItem>
              ))}
          </FileUploaderContent>
        </FileUploader>
      </div>

      <div className="flex items-start mb-6">
        <Label className="w-24 pt-2 font-medium">Invoices</Label>
        <FileUploader
          value={files}
          onValueChange={(newFiles) => setFiles(newFiles || [])}
          dropzoneOptions={dropZoneConfig}
          className="relative bg-background rounded-lg p-2 flex-1"
        >
          <FileInput className="outline-dashed outline-1 outline-gray-300 rounded-md">
            <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full">
              <FileSvgDraw />
            </div>
          </FileInput>
          <FileUploaderContent>
            {files &&
              files.length > 0 &&
              files.map((file, i) => (
                <FileUploaderItem key={i} index={i} className="py-2 px-3">
                  <Paperclip className="h-4 w-4 stroke-current mr-2" />
                  <span>{file.name}</span>
                </FileUploaderItem>
              ))}
          </FileUploaderContent>
        </FileUploader>
      </div>
      <div className="flex items-start mb-6">
        <Label className="w-24 pt-2 font-medium">Contracts</Label>
        <FileUploader
          value={files}
          onValueChange={(newFiles) => setFiles(newFiles || [])}
          dropzoneOptions={dropZoneConfig}
          className="relative bg-background rounded-lg p-2 flex-1"
        >
          <FileInput className="outline-dashed outline-1 outline-gray-300 rounded-md">
            <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full">
              <FileSvgDraw />
            </div>
          </FileInput>
          <FileUploaderContent>
            {files &&
              files.length > 0 &&
              files.map((file, i) => (
                <FileUploaderItem key={i} index={i} className="py-2 px-3">
                  <Paperclip className="h-4 w-4 stroke-current mr-2" />
                  <span>{file.name}</span>
                </FileUploaderItem>
              ))}
          </FileUploaderContent>
        </FileUploader>
      </div>
      <div className="flex items-start mb-6">
        <Label className="w-24 pt-2 font-medium">Payments</Label>
        <FileUploader
          value={files}
          onValueChange={(newFiles) => setFiles(newFiles || [])}
          dropzoneOptions={dropZoneConfig}
          className="relative bg-background rounded-lg p-2 flex-1"
        >
          <FileInput className="outline-dashed outline-1 outline-gray-300 rounded-md">
            <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full">
              <FileSvgDraw />
            </div>
          </FileInput>
          <FileUploaderContent>
            {files &&
              files.length > 0 &&
              files.map((file, i) => (
                <FileUploaderItem key={i} index={i} className="py-2 px-3">
                  <Paperclip className="h-4 w-4 stroke-current mr-2" />
                  <span>{file.name}</span>
                </FileUploaderItem>
              ))}
          </FileUploaderContent>
        </FileUploader>
      </div>
    </div>
  );
};

export default Documents;