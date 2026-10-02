import { createFileRoute } from "@tanstack/react-router";
import { Hammer } from "lucide-react";

export const Route = createFileRoute("/admin/$")({
  component: UnderDevelopment,
});

function UnderDevelopment() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center text-center">
      <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-primary/10 shadow-inner">
        <Hammer size={40} className="text-primary animate-pulse" />
      </div>
      <h1 className="font-display text-[32px] font-extrabold text-navy tracking-tight">
        Under Development
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground font-medium">
        This module is currently being built. Our engineering team is working hard to bring you this
        feature very soon.
      </p>
    </div>
  );
}
