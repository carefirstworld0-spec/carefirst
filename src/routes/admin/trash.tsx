import { createFileRoute } from "@tanstack/react-router";
import { TrashPage } from "../../admin/pages/Trash";

export const Route = createFileRoute("/admin/trash")({
  component: TrashPage,
});
