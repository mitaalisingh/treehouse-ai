import CanvasBoard from "./components/CanvasBoard";

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center border-b border-zinc-800 bg-zinc-900 px-4">
        <span className="text-lg font-bold text-white">Treehouse</span>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="h-full w-[55%] bg-zinc-950">
          <CanvasBoard />
        </div>

        <div className="w-[45%] border-l border-zinc-800 bg-zinc-900">
          {/* Output panel */}
          <div />
        </div>
      </div>
    </div>
  );
}
