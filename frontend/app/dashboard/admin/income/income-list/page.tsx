"use client"

import { useState, useEffect } from "react"
import { apiFetch, API_ENDPOINTS } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { StatCard } from "@/components/super-admin/stat-card"
import { AdvancedTable } from "@/components/super-admin/advanced-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ListChecks, Filter, Calendar, DollarSign, Receipt, TrendingUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface IncomeItem {
  id: string
  incomeHead: string
  incomeFrom: string
  invoiceNo: string
  date: string
  amount: number
  reference?: string
}

export default function IncomeList() {
  const { toast } = useToast()
  const [heads, setHeads] = useState<any[]>([])
  const [incomes, setIncomes] = useState<IncomeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    incomeHead: "all",
    dateFrom: "",
    dateTo: "",
    search: ""
  })

  useEffect(() => {
    fetchHeads()
    fetchIncomes()
  }, [])

  const fetchHeads = async () => {
    try {
      const res = await apiFetch(API_ENDPOINTS.INCOME.HEADS)
      if (res.ok) {
        const data = await res.json()
        setHeads(data.data || [])
      }
    } catch (e) { }
  }

  const fetchIncomes = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (filters.incomeHead && filters.incomeHead !== "all") queryParams.append('category', filters.incomeHead)
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)
      if (filters.search) queryParams.append('search', filters.search)

      const response = await apiFetch(`${API_ENDPOINTS.INCOME.BASE}?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        const mappedArray = Array.isArray(data) ? data : data.data || []
        setIncomes(mappedArray.map((item: any) => ({
          id: item._id,
          incomeHead: item.category || item.incomeHead,
          incomeFrom: item.receivedFrom || item.incomeFrom || "N/A",
          invoiceNo: item.receiptNumber || item.invoiceNo,
          date: new Date(item.incomeDate || item.date).toLocaleDateString(),
          amount: item.amount,
          reference: item.receiptNumber
        })))
      }
    } catch (error) {
      console.error('Error fetching incomes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchIncomes()
  }

  const columns = [
    {
      key: "invoiceNo",
      label: "Invoice Ref",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-cyan-600" />
          <span className="font-bold text-cyan-700">{value}</span>
        </div>
      )
    },
    {
      key: "incomeHead",
      label: "Revenue Head",
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: "incomeFrom",
      label: "Source",
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-gray-600">{value}</span>
      )
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Calendar size={14} className="text-gray-400" /> {value}
        </div>
      )
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-emerald-600" />
          <span className="font-bold text-emerald-700">₹{(value || 0).toLocaleString()}</span>
        </div>
      )
    }
  ]

  const stats = {
    total: incomes.length,
    totalAmount: incomes.reduce((sum, i) => sum + i.amount, 0)
  }

  return (
    <DashboardLayout title="Income Ledger">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

        {/* Header Section */}
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <ListChecks className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Income Ledger
            </h1>
            <p className="text-sm text-gray-500">Comprehensive list of all revenue transactions</p>
          </div>
        </div>

        {/* Filter Section */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
              <Filter className="h-5 w-5 text-cyan-600" />
              Filter Income Records
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Income Head</Label>
                <Select value={filters.incomeHead} onValueChange={(val) => setFilters({ ...filters, incomeHead: val })}>
                  <SelectTrigger className="bg-white border-gray-200">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {heads.map(h => (
                      <SelectItem key={h._id} value={h.name}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="bg-white border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="bg-white border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label>Search</Label>
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Ref / Name"
                  className="bg-white border-gray-200"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSearch} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                Search Records
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Total Entries"
            value={stats.total.toString()}
            icon={Receipt}
            iconColor="text-cyan-600"
            iconBgColor="bg-cyan-50"
            description="Filtered results"
          />
          <StatCard
            title="Total Amount"
            value={`₹${stats.totalAmount.toLocaleString()}`}
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            description="Sum of filtered income"
          />
        </div>

        <AdvancedTable
          title="Income Transactions"
          columns={columns}
          data={incomes}
          loading={loading}
          searchable
          searchPlaceholder="Quick search..."
          pagination
        />
      </div>
    </DashboardLayout>
  )
}
