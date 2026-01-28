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
import { Clock, Phone, Mail, User, Users, Calendar, FileText, ClipboardList } from "lucide-react"

interface ViewVisitorModalProps {
    isOpen: boolean
    onClose: () => void
    visitor: any
}

export function ViewVisitorModal({ isOpen, onClose, visitor }: ViewVisitorModalProps) {
    if (!visitor) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                {visitor.name}
                                <Badge variant={visitor.outTime && visitor.outTime !== 'Still In' ? 'outline' : 'default'} className={visitor.outTime && visitor.outTime !== 'Still In' ? '' : 'bg-emerald-600'}>
                                    {visitor.outTime && visitor.outTime !== 'Still In' ? 'Checked Out' : 'On Premises'}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-base mt-1">
                                Visitor Record Details
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Visitor Details</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Phone className="w-4 h-4 text-emerald-600" />
                                    <span>{visitor.phone}</span>
                                </div>
                                {visitor.email && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Mail className="w-4 h-4 text-emerald-600" />
                                        <span>{visitor.email}</span>
                                    </div>
                                )}
                                {visitor.idCard && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <ClipboardList className="w-4 h-4 text-emerald-600" />
                                        <span>ID: <span className="font-medium">{visitor.idCard}</span></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Visit Context</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <User className="w-4 h-4 text-emerald-600" />
                                    <span>Purpose: <span className="font-medium px-2 py-0.5 bg-gray-100 rounded text-xs">{visitor.purpose}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Users className="w-4 h-4 text-emerald-600" />
                                    <span>Group Size: <span className="font-medium">{visitor.noOfPerson || 1} Person(s)</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Time & Date</h4>
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100/50">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-gray-700">
                                        <span className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-emerald-600" /> Date</span>
                                        <span className="font-bold">{visitor.date ? new Date(visitor.date).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="h-px bg-emerald-200/50 w-full"></div>
                                    <div className="flex justify-between items-center text-gray-700">
                                        <span className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-emerald-600" /> In Time</span>
                                        <span className="font-bold">{visitor.inTime}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-700">
                                        <span className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-orange-500" /> Out Time</span>
                                        <span className="font-bold">{visitor.outTime || '---'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Remarks</h4>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[80px]">
                                <div className="flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-gray-400 mt-1" />
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                        {visitor.note || "No remarks entered for this visit."}
                                    </p>
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
