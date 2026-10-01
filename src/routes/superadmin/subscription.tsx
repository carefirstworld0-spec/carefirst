import { createFileRoute } from "@tanstack/react-router";
import { Subscription } from "@/superadmin/pages/Subscription";

export const Route = createFileRoute("/superadmin/subscription")({
  component: Subscription,
});
