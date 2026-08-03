"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Layer, Rect, Stage } from "react-konva";
import useImage from "use-image";
import ImageDropzone from "./ImageDropzone";

function getFitDimensions(
  imageWidth: number,
  imageHeight: number,
  stageWidth: number,
  stageHeight: number,
) {
  const scale = Math.min(stageWidth / imageWidth, stageHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    x: (stageWidth - width) / 2,
    y: (stageHeight - height) / 2,
    width,
    height,
  };
}

function FittedCanvasImage({
  src,
  stageWidth,
  stageHeight,
}: {
  src: string;
  stageWidth: number;
  stageHeight: number;
}) {
  const [image] = useImage(src);

  if (!image) {
    return null;
  }

  const { x, y, width, height } = getFitDimensions(
    image.naturalWidth,
    image.naturalHeight,
    stageWidth,
    stageHeight,
  );

  return <Image image={image} x={x} y={y} width={width} height={height} />;
}

export default function CanvasBoard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect();
      console.log("CanvasBoard resize:", { width, height });
      setSize({ width, height });
    };

    // Mount fallback — don't wait for ResizeObserver's first callback
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const handleImageUpload = useCallback((dataUrl: string) => {
    setUploadedImage(dataUrl);
    console.log("Uploaded image base64 length:", dataUrl.length);
  }, []);

  return (
    <ImageDropzone
      ref={containerRef}
      onImageUpload={handleImageUpload}
      hasImage={uploadedImage !== null}
    >
      {size.width > 0 && size.height > 0 && (
        <Stage width={size.width} height={size.height}>
          <Layer>
            {!uploadedImage ? (
              <Rect
                x={0}
                y={0}
                width={size.width}
                height={size.height}
                fill="#09090b"
                stroke="#27272a"
                strokeWidth={1}
              />
            ) : (
              <FittedCanvasImage
                src={uploadedImage}
                stageWidth={size.width}
                stageHeight={size.height}
              />
            )}
          </Layer>
        </Stage>
      )}
    </ImageDropzone>
  );
}
