import { createFileRoute } from "@tanstack/react-router";
import { Appointments } from "../../admin/pages/Appointments";

export const Route = createFileRoute("/admin/appointments")({
  component: Appointments,
});
