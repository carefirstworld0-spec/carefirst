import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminDashboard } from '@/superadmin/pages/Dashboard'

export const Route = createFileRoute('/superadmin/_layout/')({
  component: SuperAdminDashboard,
})
