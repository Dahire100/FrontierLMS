"use client"

import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import FormModal, { FormField } from "@/components/form-modal"
import { ConfirmationDialog } from "@/components/super-admin/confirmation-dialog"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Settings2,
    Layers,
    Info,
    ShieldCheck,
    Target,
    Search,
    MessageSquare,
    Users
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SetupItem {
    id: string
    name: string
    description?: string
    type: string
}

const tabToType = (tab: string) => tab.replace(/-/g, '_')
const typeToTab = (type: string) => type.replace(/_/g, '-')

export default function SetupFrontOfficePage() {
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState("purpose")
    const [items, setItems] = useState<SetupItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null
    })

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        setLoading(true)
        try {
            const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.SETUP)
            if (response.ok) {
                const data = await response.json()
                const mappedArray = Array.isArray(data) ? data : data.data || []
                setItems(mappedArray.map((item: any) => ({
                    id: item._id,
                    name: item.name,
                    description: item.description,
                    type: item.type
                })))
            } else {
                toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error fetching setup items:', error)
            toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (data: any) => {
        try {
            const response = await apiFetch(API_ENDPOINTS.FRONT_OFFICE.SETUP, {
                method: 'POST',
                body: JSON.stringify({ ...data, type: tabToType(activeTab) })
            })
            if (response.ok) {
                toast({ title: "Success", description: "Configuration item added." })
                fetchItems()
                setIsModalOpen(false)
            } else {
                toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error adding item:', error)
            toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
        }
    }

    const handleEdit = async (id: string, data: any) => {
        try {
            const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.SETUP}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            })
            if (response.ok) {
                toast({ title: "Updated", description: "Configuration updated successfully." })
                fetchItems()
                setIsModalOpen(false)
                setEditingId(null)
            } else {
                toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error updating item:', error)
            toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
        }
    }

    const confirmDelete = async () => {
        if (!deleteConfirm.id) return
        try {
            const response = await apiFetch(`${API_ENDPOINTS.FRONT_OFFICE.SETUP}/${deleteConfirm.id}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                toast({ title: "Deleted", description: "Configuration removed." })
                fetchItems()
            } else {
                toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
            }
        } catch (error) {
            console.error('Error deleting item:', error)
            toast({ title: "Error", description: "Backend server is not running. Start it: cd backend && npm start", variant: "destructive" })
        } finally {
            setDeleteConfirm({ open: false, id: null })
        }
    }

    const filteredItems = items.filter(item => item.type === tabToType(activeTab))

    const columns = [
        {
            key: "name",
            label: "Categorization Name",
            sortable: true,
            render: (value: string) => (
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="font-bold text-gray-900">{value}</span>
                </div>
            )
        },
        {
            key: "description",
            label: "Extra Context",
            sortable: true,
            render: (value: string) => (
                <span className="text-xs text-gray-500 italic">
                    {value || "No additional details provided."}
                </span>
            )
        }
    ]

    const formFields: FormField[] = [
        { name: "name", label: "Title / Name", type: "text", required: true, placeholder: "e.g., General Inquiry, Maintenance..." },
        { name: "description", label: "Description (Optional)", type: "textarea", required: false, placeholder: "Briefly describe the purpose of this tag..." },
    ]

    const getActiveTabTitle = () => {
        switch (activeTab) {
            case "purpose": return "Visiting Purview"
            case "complain-type": return "Complaints Taxonomy"
            case "source": return "Acquisition Channels"
            case "reference": return "Referral Partners"
            case "enquiry-status": return "Lead Lifecycle Stages"
            default: return "Settings"
        }
    }

    const getActiveTabIcon = () => {
        switch (activeTab) {
            case "purpose": return Target
            case "complain-type": return MessageSquare
            case "source": return Search
            case "reference": return Users
            case "enquiry-status": return ShieldCheck
            default: return Settings2
        }
    }

    const ActiveIcon = getActiveTabIcon()

    return (
        <DashboardLayout title="Operational Setup">
            <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Settings2 className="text-indigo-600" size={24} />
                            Platform Configuration
                        </h1>
                        <p className="text-sm text-gray-500">Fine-tune the categorical labels and workflows for front-office operations</p>
                    </div>
                    <Button
                        onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                    >
                        <Plus className="h-4 w-4" /> Define New Parameter
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm flex-wrap h-auto mb-6 justify-start gap-1">
                        <TabsTrigger value="purpose" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-4 py-2 text-xs font-bold uppercase tracking-wider">Visiting Purposes</TabsTrigger>
                        <TabsTrigger value="complain-type" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-4 py-2 text-xs font-bold uppercase tracking-wider">Complain Types</TabsTrigger>
                        <TabsTrigger value="source" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-4 py-2 text-xs font-bold uppercase tracking-wider">Lead Sources</TabsTrigger>
                        <TabsTrigger value="reference" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-4 py-2 text-xs font-bold uppercase tracking-wider">References</TabsTrigger>
                        <TabsTrigger value="enquiry-status" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-4 py-2 text-xs font-bold uppercase tracking-wider">Enquiry Statuses</TabsTrigger>
                    </TabsList>

                    <div className="grid grid-cols-1 gap-6 animation-fade-in">
                        <AdvancedTable
                            title={getActiveTabTitle()}
                            columns={columns}
                            data={filteredItems}
                            loading={loading}
                            searchable
                            searchPlaceholder={`Find in ${activeTab.replace('-', ' ')}...`}
                            pagination
                            onEdit={(row) => {
                                setEditingId(row.id)
                                setIsModalOpen(true)
                            }}
                            onDelete={(row) => setDeleteConfirm({ open: true, id: row.id })}
                        />
                    </div>
                </Tabs>

                <FormModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setEditingId(null)
                    }}
                    title={editingId ? `Update Entry` : `Create ${activeTab.replace('-', ' ')}`}
                    fields={formFields}
                    initialData={editingId ? items.find(i => i.id === editingId) : undefined}
                    onSubmit={(data: any) => editingId ? handleEdit(editingId, data) : handleAdd(data)}
                />

                <ConfirmationDialog
                    open={deleteConfirm.open}
                    onOpenChange={(open) => setDeleteConfirm({ open, id: null })}
                    onConfirm={confirmDelete}
                    title="Archive Configuration?"
                    description="Removing this item may affect historical records categorized under it. This action cannot be undone."
                    variant="destructive"
                />
            </div>

            <style jsx global>{`
        .animation-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </DashboardLayout>
    )
}
