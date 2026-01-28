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
import { AlertCircle, User, Calendar, FileWarning, Phone, Mail } from "lucide-react"

interface ViewComplaintModalProps {
    isOpen: boolean
    onClose: () => void
    complaint: any
}

export function ViewComplaintModal({ isOpen, onClose, complaint }: ViewComplaintModalProps) {
    if (!complaint) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <AlertCircle className="text-red-600" />
                                Complaint Details
                                <Badge variant="outline" className="ml-2">
                                    {complaint.complaintType}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-base mt-1">
                                Filed by: {complaint.complainantName || complaint.source}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Complainant Info</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <User className="w-4 h-4 text-red-600" />
                                    <span>{complaint.complainantName || complaint.source}</span>
                                </div>
                                {complaint.phone && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Phone className="w-4 h-4 text-red-600" />
                                        <span>{complaint.phone}</span>
                                    </div>
                                )}
                                {complaint.email && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Mail className="w-4 h-4 text-red-600" />
                                        <span>{complaint.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Calendar className="w-4 h-4 text-red-600" />
                                    <span>Date: <span className="font-medium">{complaint.date ? new Date(complaint.date).toLocaleDateString() : 'N/A'}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Details</h4>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100 min-h-[100px]">
                                <div className="flex items-start gap-2">
                                    <FileWarning className="w-4 h-4 text-red-400 mt-1" />
                                    <div>
                                        <span className="text-xs font-bold text-red-600 uppercase block mb-1">Description</span>
                                        <p className="text-gray-800 text-sm whitespace-pre-wrap">
                                            {complaint.description || complaint.note || "No details provided."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {complaint.actionTaken && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Action Taken</h4>
                                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                    <p className="text-emerald-800 text-sm whitespace-pre-wrap">
                                        {complaint.actionTaken}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="sm:justify-end">
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
