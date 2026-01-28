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
import { Phone, Calendar, Clock, PhoneIncoming, PhoneOutgoing, MessageSquare } from "lucide-react"

interface ViewCallModalProps {
    isOpen: boolean
    onClose: () => void
    call: any
}

export function ViewCallModal({ isOpen, onClose, call }: ViewCallModalProps) {
    if (!call) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {call.name}
                                <Badge variant={call.callType === 'Incoming' ? 'default' : 'secondary'} className={call.callType === 'Incoming' ? 'bg-emerald-600' : 'bg-blue-600'}>
                                    {call.callType === 'Incoming' ? <PhoneIncoming className="w-3 h-3 mr-1" /> : <PhoneOutgoing className="w-3 h-3 mr-1" />}
                                    {call.callType}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-base mt-1">
                                Call Log Details
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Call Information</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Phone className="w-4 h-4 text-indigo-600" />
                                    <span>{call.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Clock className="w-4 h-4 text-indigo-600" />
                                    <span>Duration: <span className="font-medium">{call.callDuration || 'N/A'}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                    <span>Date: <span className="font-medium">{call.date ? new Date(call.date).toLocaleDateString() : 'N/A'}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Calendar className="w-4 h-4 text-orange-600" />
                                    <span>Next Follow-up: <span className="font-medium">{call.nextFollowUpDate || 'None'}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Call Description</h4>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[80px]">
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                        {call.description || "No description provided."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Internal Notes</h4>
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 min-h-[60px]">
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                    {call.note || "No internal notes."}
                                </p>
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
