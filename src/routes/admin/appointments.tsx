import { createFileRoute } from "@tanstack/react-router";
import { AppointmentsPage } from "../../admin/pages/Appointments";

export const Route = createFileRoute("/admin/appointments")({
  component: AppointmentsPage,
});
