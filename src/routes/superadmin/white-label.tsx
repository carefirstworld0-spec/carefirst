import { createFileRoute } from "@tanstack/react-router";
import { WhiteLabel } from "@/superadmin/pages/WhiteLabel";

export const Route = createFileRoute("/superadmin/white-label")({
  component: WhiteLabel,
});
