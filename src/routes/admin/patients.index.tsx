import { createFileRoute } from "@tanstack/react-router";
import { PatientList } from "../../admin/pages/patients/PatientList";

export const Route = createFileRoute("/admin/patients/")({
  component: PatientList,
});
