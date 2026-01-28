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
import { GraduationCap, User, Phone, Calendar, Building2, ClipboardList, FileText } from "lucide-react"

interface ViewExamModalProps {
    isOpen: boolean
    onClose: () => void
    exam: any
}

export function ViewExamModal({ isOpen, onClose, exam }: ViewExamModalProps) {
    if (!exam) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <GraduationCap className="text-orange-600" />
                                Candidate Profile
                                <Badge variant="secondary" className="ml-2">
                                    {exam.examName}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-base mt-1">
                                Entrance Examination Application
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Applicant Info</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">
                                        {exam.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{exam.name}</p>
                                        <p className="text-xs text-gray-500">{exam.gender} | DOB: {exam.dob}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <User className="w-4 h-4 text-orange-600" />
                                    <span>Guardian: <span className="font-medium">{exam.fatherName || 'Not Listed'}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Phone className="w-4 h-4 text-orange-600" />
                                    <span>Contact: <span className="font-medium">{exam.phone}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Exam Details</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <ClipboardList className="w-4 h-4 text-indigo-600" />
                                    <span>Form No: <span className="font-mono font-bold">{exam.formNo}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Building2 className="w-4 h-4 text-indigo-600" />
                                    <span>Center: <span className="font-medium">{exam.centerName || 'Pending Allocation'}</span></span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes</h4>
                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 min-h-[60px]">
                                <div className="flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-orange-400 mt-1" />
                                    <p className="text-gray-800 text-sm whitespace-pre-wrap">
                                        {exam.note || "No verified notes attached."}
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
