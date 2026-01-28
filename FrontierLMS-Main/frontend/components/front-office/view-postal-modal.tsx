import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Send, Inbox, MapPin, FileText, Calendar } from "lucide-react"

interface ViewPostalModalProps {
    isOpen: boolean
    onClose: () => void
    postal: any
}

export function ViewPostalModal({ isOpen, onClose, postal }: ViewPostalModalProps) {
    if (!postal) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {postal.type === 'receive' ? <Inbox className="text-amber-600" /> : <Send className="text-purple-600" />}
                                Postal Details
                                <Badge variant="outline" className="ml-2">
                                    {postal.referenceNo}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-base mt-1">
                                {postal.type === 'receive' ? 'Incoming' : 'Outgoing'} Correspondence Record
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Routing</h4>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="text-xs text-gray-400 uppercase font-bold">From (Sender)</span>
                                    <p className="font-medium text-gray-900">{postal.fromTitle}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="text-xs text-gray-400 uppercase font-bold">To (Recipient)</span>
                                    <p className="font-medium text-gray-900">{postal.toTitle}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Logistics</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                    <span>Date: <span className="font-medium">{postal.date ? new Date(postal.date).toLocaleDateString() : 'N/A'}</span></span>
                                </div>
                                <div className="flex items-start gap-3 text-gray-700">
                                    <MapPin className="w-4 h-4 text-indigo-600 mt-1" />
                                    <span>Address: <span className="font-medium block text-sm">{postal.address || 'No address provided'}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 col-span-1 md:col-span-2">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Content Note</h4>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 min-h-[60px]">
                                <div className="flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-gray-400 mt-1" />
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                        {postal.note || "No specific content notes."}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Placeholder for Document Preview */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Attached Documents</h4>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400">
                                <Package className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-sm">No digital copies attached to this record.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-end">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
