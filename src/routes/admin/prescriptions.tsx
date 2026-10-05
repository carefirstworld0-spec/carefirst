import { createFileRoute } from "@tanstack/react-router";
import { Prescriptions } from "../../admin/pages/Prescriptions";

export const Route = createFileRoute("/admin/prescriptions")({
  component: Prescriptions,
});
