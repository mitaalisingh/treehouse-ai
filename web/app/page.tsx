"use client";

import { useCallback, useState } from "react";
import CanvasBoard from "./components/CanvasBoard";
import CopilotSidebar from "./components/CopilotSidebar";
import PreviewPane from "./components/PreviewPane";
import type { CopilotFlag, GenerateResponse, SelectionBox } from "@/types";

type Tab = "preview" | "copilot";

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [flags, setFlags] = useState<CopilotFlag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("preview");

  const handleImageUpload = useCallback((dataUrl: string) => {
    setUploadedImage(dataUrl);
    setSelectionBox(null);
    setHtml("");
    setFlags([]);
    setError(null);
    // Extract natural dimensions
    const img = new Image();
    img.onload = () => setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = dataUrl;
  }, []);

  const handleSelectionChange = useCallback((box: SelectionBox | null) => {
    setSelectionBox(box);
  }, []);

  const handleGenerate = async () => {
    if (!uploadedImage || isLoading) return;
    setIsLoading(true);
    setError(null);
    setActiveTab("preview");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedImage,
          prompt: prompt.trim() || undefined,
          selectionBox: selectionBox ?? undefined,
          imageWidth: imageNaturalSize?.width,
          imageHeight: imageNaturalSize?.height,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? "Generation failed");
      }

      const data: GenerateResponse = await res.json();
      setHtml(data.html);
      setFlags(data.flags);
      if (data.flags.length > 0) setActiveTab("copilot");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-5">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-indigo-500" />
          <span className="text-sm font-bold tracking-tight">Treehouse</span>
        </div>
        <p className="text-xs text-zinc-600">From napkin sketch to production-ready web code, instantly.</p>
        <div className="w-32" />
      </header>

      {/* Main */}
      <div className="flex min-h-0 flex-1">
        {/* Left — Canvas */}
        <div className="flex h-full w-[55%] flex-col border-r border-zinc-800">
          <div className="min-h-0 flex-1">
            <CanvasBoard
              uploadedImage={uploadedImage}
              onImageUpload={handleImageUpload}
              onSelectionChange={handleSelectionChange}
              imageNaturalSize={imageNaturalSize}
            />
          </div>

          {/* Prompt bar */}
          <div className="shrink-0 border-t border-zinc-800 bg-zinc-900 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder={
                  selectionBox
                    ? "Describe what to change in the selected region…"
                    : "Describe the layout to generate (optional)…"
                }
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
              {selectionBox && (
                <button
                  onClick={() => { setSelectionBox(null); }}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={handleGenerate}
                disabled={!uploadedImage || isLoading}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading ? "Generating…" : selectionBox ? "Edit Region" : "Generate"}
              </button>
            </div>
            {selectionBox && (
              <p className="mt-1.5 text-xs text-indigo-400">
                Region selected — AI will edit only that area
              </p>
            )}
            {error && (
              <p className="mt-1.5 text-xs text-red-400">{error}</p>
            )}
          </div>
        </div>

        {/* Right — Tabs */}
        <div className="flex h-full w-[45%] flex-col">
          <div className="flex shrink-0 border-b border-zinc-800">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-5 py-3 text-xs font-semibold transition-colors ${
                activeTab === "preview"
                  ? "border-b-2 border-indigo-500 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab("copilot")}
              className={`flex items-center gap-1.5 px-5 py-3 text-xs font-semibold transition-colors ${
                activeTab === "copilot"
                  ? "border-b-2 border-indigo-500 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              UX Copilot
              {flags.length > 0 && (
                <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] text-white">
                  {flags.length}
                </span>
              )}
            </button>
          </div>

          <div className="min-h-0 flex-1">
            {activeTab === "preview" ? (
              <PreviewPane html={html} isLoading={isLoading} />
            ) : (
              <CopilotSidebar flags={flags} isLoading={isLoading} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
