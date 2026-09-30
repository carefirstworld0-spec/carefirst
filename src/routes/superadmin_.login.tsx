import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminLogin } from '@/superadmin/pages/Login'

export const Route = createFileRoute('/superadmin_/login')({
  component: SuperAdminLogin,
})
