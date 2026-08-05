"use client";

interface Props {
  html: string;
  isLoading: boolean;
}

const TAILWIND_CDN = "https://cdn.tailwindcss.com";

function buildDoc(html: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <script src="${TAILWIND_CDN}"></script>
  <style>body{margin:0;font-family:sans-serif;}</style>
</head>
<body>${html}</body>
</html>`;
}

export default function PreviewPane({ html, isLoading }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Preview</span>
        {html && (
          <button
            onClick={() => navigator.clipboard.writeText(html)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Copy HTML
          </button>
        )}
      </div>

      <div className="relative flex-1 overflow-hidden bg-white">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-zinc-900/80">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="text-xs text-zinc-400">Generating layout…</p>
          </div>
        )}

        {html ? (
          <iframe
            srcDoc={buildDoc(html)}
            sandbox="allow-scripts"
            className="h-full w-full border-0"
            title="Generated preview"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-900">
            <div className="text-center">
              <p className="text-sm text-zinc-500">Upload a sketch and click Generate</p>
              <p className="mt-1 text-xs text-zinc-700">Your live preview will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
