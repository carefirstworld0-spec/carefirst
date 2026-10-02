import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "../../admin/pages/Settings";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});
