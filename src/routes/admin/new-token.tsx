import { createFileRoute } from "@tanstack/react-router";
import { NewToken } from "../../admin/pages/NewToken";

export const Route = createFileRoute("/admin/new-token")({
  component: NewToken,
});
