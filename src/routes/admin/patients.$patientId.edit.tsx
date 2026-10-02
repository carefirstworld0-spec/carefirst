import { createFileRoute } from "@tanstack/react-router";
import { EditPatient } from "../../admin/pages/patients/EditPatient";

export const Route = createFileRoute("/admin/patients/$patientId/edit")({
  component: EditPatient,
});
