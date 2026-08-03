"use client";

import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"] as const;
const ACCEPT_ATTR = ACCEPTED_TYPES.join(",");

function isAcceptedImage(file: File): boolean {
  return (ACCEPTED_TYPES as readonly string[]).includes(file.type);
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

type ImageDropzoneProps = {
  children: React.ReactNode;
  onImageUpload: (dataUrl: string) => void;
  hasImage?: boolean;
};

const ImageDropzone = forwardRef<HTMLDivElement, ImageDropzoneProps>(
  function ImageDropzone({ children, onImageUpload, hasImage = false }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const dragCounterRef = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    const processFile = useCallback(
      async (file: File) => {
        if (!isAcceptedImage(file)) {
          console.warn("Rejected file type:", file.type);
          return;
        }

        try {
          const dataUrl = await readFileAsDataURL(file);
          onImageUpload(dataUrl);
        } catch (error) {
          console.error("Failed to read file:", error);
        }
      },
      [onImageUpload],
    );

    const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragCounterRef.current += 1;
      setIsDragging(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);

      const file = event.dataTransfer.files[0];
      if (file) {
        void processFile(file);
      }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        void processFile(file);
      }
      event.target.value = "";
    };

    const openFilePicker = () => {
      inputRef.current?.click();
    };

    return (
      <div
        ref={ref}
        className="relative h-full w-full"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {children}

        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center border-2 border-dashed border-blue-500 bg-blue-500/10">
            <span className="font-medium text-blue-400">Drop image here</span>
          </div>
        )}

        {!hasImage && !isDragging && (
          <button
            type="button"
            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-zinc-950/60 text-sm text-zinc-400 transition-colors hover:bg-zinc-950/80 hover:text-zinc-300"
            onClick={openFilePicker}
          >
            Click or drag an image to upload
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    );
  },
);

export default ImageDropzone;
