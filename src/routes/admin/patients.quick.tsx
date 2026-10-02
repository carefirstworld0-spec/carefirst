import { createFileRoute } from "@tanstack/react-router";
import { QuickRegistration } from "../../admin/pages/patients/QuickRegistration";

export const Route = createFileRoute("/admin/patients/quick")({
  component: QuickRegistration,
});
