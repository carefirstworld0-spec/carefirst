import { createFileRoute } from "@tanstack/react-router";
import { FullRegistration } from "../../admin/pages/patients/FullRegistration";

export const Route = createFileRoute("/admin/patients/new")({
  component: FullRegistration,
});
