import { createFileRoute } from "@tanstack/react-router";
import { ConsultationWorkspace } from "../../admin/pages/consultation/ConsultationWorkspace";

export const Route = createFileRoute("/admin/consultation/$visitId")({
  component: ConsultationWorkspace,
});
