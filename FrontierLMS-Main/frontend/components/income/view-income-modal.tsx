import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar, Receipt, User, DollarSign, FileText, Tag, CreditCard } from "lucide-react"

interface ViewIncomeModalProps {
    isOpen: boolean
    onClose: () => void
    income: any
}

export function ViewIncomeModal({ isOpen, onClose, income }: ViewIncomeModalProps) {
    if (!income) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-row items-center justify-between sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">Income Details</DialogTitle>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">
                                {income.invoiceNo || income.receiptNumber || 'Ref # N/A'}
                            </p>
                        </div>
                    </div>
                    <Badge variant={income.status === 'completed' ? 'default' : 'secondary'} className="uppercase">
                        {income.status || 'Recorded'}
                    </Badge>
                </DialogHeader>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Amount Section */}
                    <div className="bg-emerald-50 rounded-xl p-6 flex flex-col items-center justify-center border border-emerald-100">
                        <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide mb-1">Total Amount Received</span>
                        <div className="flex items-center text-4xl font-bold text-emerald-700">
                            <span className="text-2xl mr-1">₹</span>
                            {income.amount?.toLocaleString() || '0'}
                        </div>
                        {income.date && (
                            <div className="flex items-center gap-1.5 mt-3 text-sm text-emerald-800/70 font-medium">
                                <Calendar className="h-4 w-4" />
                                {new Date(income.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                                <Tag className="h-4 w-4" /> Income Head
                            </div>
                            <p className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">
                                {income.incomeHead || income.category || 'N/A'}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                                <User className="h-4 w-4" /> Received From (Source)
                            </div>
                            <p className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">
                                {income.incomeFrom || income.receivedFrom || 'N/A'}
                            </p>
                        </div>

                        {income.accountName && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                                    <CreditCard className="h-4 w-4" /> Credited To Account
                                </div>
                                <p className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-2">
                                    {income.accountName}
                                </p>
                            </div>
                        )}

                        <div className="space-y-1 md:col-span-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                                <FileText className="h-4 w-4" /> Description / Notes
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed border border-gray-100 min-h-[80px]">
                                {income.description || 'No description provided.'}
                            </div>
                        </div>
                    </div>

                    {(income.createdBy || income.createdAt) && (
                        <>
                            <Separator />
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <span>Created by: {typeof income.createdBy === 'object' ? income.createdBy?.name : income.createdBy || 'System'}</span>
                                <span>Recorded on: {income.createdAt ? new Date(income.createdAt).toLocaleString() : 'N/A'}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
