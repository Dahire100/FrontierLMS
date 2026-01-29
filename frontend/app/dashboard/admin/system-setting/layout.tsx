"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"

export default function SystemSettingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute allowedRoles={["school_admin"]}>
            <DashboardLayout title="System Setting">
                {children}
            </DashboardLayout>
        </ProtectedRoute>
    )
}
