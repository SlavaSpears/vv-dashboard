import AITerminal from "@/components/AITerminal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AITerminalPage() {
  return (
    <div className="h-full">
      <AITerminal />
    </div>
  );
}
