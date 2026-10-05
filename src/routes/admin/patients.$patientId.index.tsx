import { createFileRoute } from "@tanstack/react-router";
import { PatientProfile } from "../../admin/pages/patients/PatientProfile";

export const Route = createFileRoute("/admin/patients/$patientId/")({
  component: PatientProfile,
});
