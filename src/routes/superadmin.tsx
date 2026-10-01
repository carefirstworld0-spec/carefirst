import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminLayout } from "@/superadmin/layouts/SuperAdminLayout";

export const Route = createFileRoute("/superadmin")({
  component: SuperAdminLayout,
});
