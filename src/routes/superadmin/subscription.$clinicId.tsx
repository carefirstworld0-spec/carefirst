import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionDetails } from "@/superadmin/pages/SubscriptionDetails";

export const Route = createFileRoute("/superadmin/subscription/$clinicId")({
  component: SubscriptionDetails,
});
