"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Layer, Line, Rect, Stage } from "react-konva";
import type Konva from "konva";
import useImage from "use-image";
import ImageDropzone from "./ImageDropzone";
import type { SelectionBox } from "@/types";

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
    scale,
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
  if (!image) return null;
  const { x, y, width, height } = getFitDimensions(
    image.naturalWidth,
    image.naturalHeight,
    stageWidth,
    stageHeight,
  );
  return <Image image={image} x={x} y={y} width={width} height={height} />;
}

interface Props {
  onImageUpload: (dataUrl: string) => void;
  uploadedImage: string | null;
  onSelectionChange: (box: SelectionBox | null) => void;
  imageNaturalSize: { width: number; height: number } | null;
}

export default function CanvasBoard({
  onImageUpload,
  uploadedImage,
  onSelectionChange,
  imageNaturalSize,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // lasso state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect();
      setSize({ width, height });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Reset selection when image changes
  useEffect(() => {
    setSelection(null);
    onSelectionChange(null);
  }, [uploadedImage, onSelectionChange]);

  const fitDims =
    uploadedImage && imageNaturalSize && size.width > 0
      ? getFitDimensions(imageNaturalSize.width, imageNaturalSize.height, size.width, size.height)
      : null;

  const getStagePos = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pos = stage.getPointerPosition();
    return pos ?? { x: 0, y: 0 };
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!uploadedImage) return;
    const pos = getStagePos(e);
    setDrawStart(pos);
    setIsDrawing(true);
    setSelection(null);
    onSelectionChange(null);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !drawStart) return;
    const pos = getStagePos(e);
    const rect = {
      x: Math.min(drawStart.x, pos.x),
      y: Math.min(drawStart.y, pos.y),
      width: Math.abs(pos.x - drawStart.x),
      height: Math.abs(pos.y - drawStart.y),
    };
    setSelection(rect);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setDrawStart(null);
    if (!selection || selection.width < 10 || selection.height < 10) {
      setSelection(null);
      onSelectionChange(null);
      return;
    }
    // Convert stage coords → image-relative coords
    if (fitDims) {
      const box: SelectionBox = {
        x: (selection.x - fitDims.x) / fitDims.scale,
        y: (selection.y - fitDims.y) / fitDims.scale,
        width: selection.width / fitDims.scale,
        height: selection.height / fitDims.scale,
      };
      onSelectionChange(box);
    }
  };

  const dashPattern = [6, 3];

  return (
    <ImageDropzone
      ref={containerRef}
      onImageUpload={onImageUpload}
      hasImage={uploadedImage !== null}
    >
      {size.width > 0 && size.height > 0 && (
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: uploadedImage ? "crosshair" : "default" }}
        >
          <Layer>
            {!uploadedImage ? (
              <Rect x={0} y={0} width={size.width} height={size.height} fill="#09090b" stroke="#27272a" strokeWidth={1} />
            ) : (
              <FittedCanvasImage src={uploadedImage} stageWidth={size.width} stageHeight={size.height} />
            )}
            {selection && (
              <>
                <Rect
                  x={selection.x}
                  y={selection.y}
                  width={selection.width}
                  height={selection.height}
                  fill="rgba(99,102,241,0.1)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dash={dashPattern}
                />
              </>
            )}
          </Layer>
        </Stage>
      )}
      {selection && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600/90 px-3 py-1 text-xs text-white backdrop-blur">
          Region selected — add a prompt below
        </div>
      )}
    </ImageDropzone>
  );
}
