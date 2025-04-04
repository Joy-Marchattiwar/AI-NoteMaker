import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import ICON from "@/app/assets/upload-pdf-10137.svg"
import { toast } from "sonner";
const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  onSubmit,
}: {
  onChange?: (files: File[]) => void;
  onSubmit?: (data: FormData) => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onChange && onChange(newFiles);
    toast.info("File added successfully!");
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      updatedFiles.splice(index, 1);
      return updatedFiles;
    });
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    
    setSubmitting(true);
    try {
      // Create FormData to send files to backend
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`${file.name}-${index}`, file);
      });
      
      // Call the provided onSubmit function with the files
      onSubmit && onSubmit(formData);
      setFiles([]);
    } catch (error) {
      console.error('Error submitting files:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full">
      <div className="w-full" {...getRootProps()}>
        <div className="p-10 group/file block rounded-lg w-full relative overflow-hidden">
          <input
            ref={fileInputRef}
            id="file-upload-handle"
            type="file"
            onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center">
            <p className="relative z-20 font-sans font text-neutral-900 dark:text-neutral-300 text-base">
              Contribute Notes 
            </p>
            <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
              Drag or drop your files here or click to upload
            </p>
            
            {/* File Upload Area */}
            <div className="relative w-full mt-10 max-w-xl mx-auto">
              {/* File List */}
              {files.length > 0 && (
                <div className="w-full space-y-4">
                  {files.map((file, idx) => (
                    <motion.div
                      key={`file-${idx}`}
                      layoutId={idx === 0 ? "file-upload" : `file-upload-${idx}`}
                      className={cn(
                        "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 w-full mx-auto rounded-md",
                        "shadow-lg group/file-item"
                      )}
                    >
                      <div className="flex justify-between w-full items-center gap-4">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                          className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                        >
                          {file.name}
                        </motion.p>
                        <div className="flex items-center gap-2">
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            layout
                            className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                          >
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </motion.p>
                          
                          {/* Delete Button - Now positioned absolutely */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute right-4 top-4 z-50"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(idx);
                              }}
                              className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                            >
                              <IconX className="h-4 w-4" />
                            </button>
                          </motion.div>
                        </div>
                      </div>

                      <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                          className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800"
                        >
                          {file.type}
                        </motion.p>

                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                        >
                          modified{" "}
                          {new Date(file.lastModified).toLocaleDateString()}
                        </motion.p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Empty State */}
              {!files.length && (
                <div onClick={handleClick} className="cursor-pointer">
                  <motion.div
                    layoutId="file-upload"
                    variants={mainVariant}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className={cn(
                      "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                      "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                    )}
                  >
                    {isDragActive ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-neutral-600 flex flex-col items-center"
                      >
                        Drop it
                        <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                      </motion.p>
                    ) : (
                      <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                    )}
                  </motion.div>

                  <motion.div
                    variants={secondaryVariant}
                    className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
                  ></motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      {files.length > 0 && (
        <div className=" text-center flex flex-col items-center justify-evenly gap-4 ">
        <Button
          onClick={handleClick}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
        >
          +
        </Button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <span>Exporting...</span>
            ) : (
              <>
                <span>Upload Pdf</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};