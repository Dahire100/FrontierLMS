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
import { Calendar, Phone, Mail, MapPin, User, Layers, Clock, FileText } from "lucide-react"

interface ViewEnquiryModalProps {
    isOpen: boolean
    onClose: () => void
    enquiry: any
}

export function ViewEnquiryModal({ isOpen, onClose, enquiry }: ViewEnquiryModalProps) {
    if (!enquiry) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {enquiry.studentName}
                                <Badge variant={
                                    enquiry.status === 'won' ? 'default' :
                                    enquiry.status === 'active' ? 'secondary' :
                                    'outline'
                                } className="ml-2 capitalize">
                                    {enquiry.status}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-base mt-1">
                                Enquiry Details & Timeline
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Phone className="w-4 h-4 text-indigo-600" />
                                    <span>{enquiry.phone}</span>
                                </div>
                                {enquiry.email && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Mail className="w-4 h-4 text-indigo-600" />
                                        <span>{enquiry.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Enquiry Details</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <User className="w-4 h-4 text-indigo-600" />
                                    <span>Class: <span className="font-medium">{enquiry.className || 'N/A'}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <User className="w-4 h-4 text-indigo-600" />
                                    <span>Children: <span className="font-medium">{enquiry.noOfChild || 1}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Layers className="w-4 h-4 text-indigo-600" />
                                    <span>Source: <span className="font-medium">{enquiry.source}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                    <span>Date: <span className="font-medium">{enquiry.date ? new Date(enquiry.date).toLocaleDateString() : 'N/A'}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                         <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes & Remarks</h4>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 min-h-[120px]">
                                <div className="flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-gray-400 mt-1" />
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                        {enquiry.description || "No additional notes provided."}
                                    </p>
                                </div>
                            </div>
                        </div>

                         <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Timeline</h4>
                            <div className="relative border-l border-gray-200 ml-2 space-y-6 py-2">
                                <div className="ml-6 relative">
                                    <div className="absolute -left-[31px] bg-indigo-100 h-4 w-4 rounded-full border-2 border-indigo-600"></div>
                                    <h5 className="font-medium text-gray-900 text-sm">Enquiry Created</h5>
                                    <p className="text-xs text-gray-500">{enquiry.date ? new Date(enquiry.date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                {/* Placeholder for more history */}
                                <div className="ml-6 relative opacity-50">
                                    <div className="absolute -left-[31px] bg-gray-100 h-4 w-4 rounded-full border-2 border-gray-300"></div>
                                    <h5 className="font-medium text-gray-500 text-sm">Follow-up Pending</h5>
                                </div>
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
