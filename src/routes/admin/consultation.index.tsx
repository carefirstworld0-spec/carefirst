import { createFileRoute } from "@tanstack/react-router";
import { ConsultationDashboard } from "../../admin/pages/consultation/ConsultationDashboard";

export const Route = createFileRoute("/admin/consultation/")({
  component: ConsultationDashboard,
});
