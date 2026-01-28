"use client"

import { useState, useEffect } from "react"
import { API_URL } from "@/lib/api-config"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowUpRight, ArrowDownLeft, Store, Plus, History, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function StudentWallet() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [processing, setProcessing] = useState(false)

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      const [walletRes, txnRes] = await Promise.all([
        fetch(`${API_URL}/api/wallet`, { headers }),
        fetch(`${API_URL}/api/wallet/transactions`, { headers })
      ])

      const walletData = await walletRes.json()
      const txnData = await txnRes.json()

      if (walletData.balance !== undefined) {
        setBalance(walletData.balance)
      }

      if (txnData.transactions) {
        setTransactions(txnData.transactions)
      }
    } catch (error) {
      console.error("Failed to load wallet data", error)
      toast.error("Failed to load wallet information")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [])

  const totalCredit = transactions.filter(t => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)
  const totalDebit = transactions.filter(t => t.type === "debit").reduce((sum, t) => sum + t.amount, 0)

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/wallet/recharge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: "Online Top-up",
          referenceId: `REF-${Date.now()}` // Simulated payment ref
        })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Wallet Recharged", { description: `Successfully added ₹${amount}` })
        setBalance(data.newBalance)
        setIsAddMoneyOpen(false)
        setAmount("")
        fetchWalletData() // Refresh transactions
      } else {
        toast.error(data.error || "Recharge failed")
      }
    } catch (error) {
      console.error("Recharge error", error)
      toast.error("Payment failed")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Student Wallet">
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Student Wallet">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              My Wallet
            </h2>
            <p className="text-muted-foreground mt-1">Manage your wallet and transactions</p>
          </div>
          <Dialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                <Plus className="mr-2 h-4 w-4" /> Add Money
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddMoney}>
                <DialogHeader>
                  <DialogTitle>Add Money to Wallet</DialogTitle>
                  <DialogDescription>Choose amount and payment method.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      min="1"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select defaultValue="card">
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="upi">UPI / Net Banking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={processing}>
                    {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {processing ? "Processing..." : "Proceed to Pay"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wallet Card */}
          <div className="md:col-span-1">
            <div className="h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <Wallet className="h-8 w-8 text-blue-400" />
                  <Store className="h-8 w-8 opacity-20" />
                  <span className="font-mono text-xs text-gray-400">VIRTUAL CARD</span>
                </div>
                <div className="mb-2">
                  <p className="text-gray-400 text-sm">Total Balance</p>
                  <p className="text-4xl font-bold tracking-tight">₹{balance.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="font-mono text-sm text-gray-400">**** **** **** 1234</div>
                <div className="text-xs font-semibold bg-white/10 px-2 py-1 rounded">VALID THRU 12/28</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Credited</p>
                  <p className="text-2xl font-bold text-green-600">+₹{totalCredit.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ArrowUpRight className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Debited</p>
                  <p className="text-2xl font-bold text-red-600">-₹{totalDebit.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <ArrowDownLeft className="h-6 w-6 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Transaction History</CardTitle>
            <CardDescription>Recent wallet transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No transactions found.</p>
              ) : transactions.map((tx) => (
                <div key={tx.txId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${tx.type === "credit" ? "bg-green-100" : "bg-red-100"}`}>
                      {tx.type === "credit" ? (
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(tx.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{tx.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${tx.type === "credit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {tx.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
