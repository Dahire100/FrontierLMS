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
import { ShieldCheck, User, Calendar, Clock, Lock, FileText } from "lucide-react"

interface ViewGatePassModalProps {
    isOpen: boolean
    onClose: () => void
    pass: any
}

export function ViewGatePassModal({ isOpen, onClose, pass }: ViewGatePassModalProps) {
    if (!pass) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <ShieldCheck className="text-indigo-600" />
                                Gate Pass Authorization
                                <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200">
                                    {pass.issuedTo}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-base mt-1">
                                Secure Campus Access Credential
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Identity</h4>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                        {pass.name.charAt(0)}
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-400 uppercase font-bold">Authorized Person</span>
                                        <p className="font-bold text-gray-900">{pass.name}</p>
                                    </div>
                                </div>
                                {pass.personCarrying && (
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                                        <User className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <span className="text-xs text-gray-400 uppercase font-bold">Escort / Guardian</span>
                                            <p className="font-medium text-gray-900">{pass.personCarrying}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Validity Window</h4>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
                                <div className="flex justify-between items-center text-gray-700">
                                    <span className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-emerald-600" /> Valid From</span>
                                    <span className="font-bold">{pass.startDate}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-700">
                                    <span className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-red-600" /> Valid To</span>
                                    <span className="font-bold">{pass.endDate}</span>
                                </div>
                                <div className="h-px bg-gray-200 w-full my-2"></div>
                                <div className="flex justify-between items-center text-gray-700">
                                    <span className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-emerald-600" /> Entry Time</span>
                                    <span className="font-mono font-bold">{pass.inTime || "Any"}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-700">
                                    <span className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-red-600" /> Exit Time</span>
                                    <span className="font-mono font-bold">{pass.outTime || "Any"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Security Remarks</h4>
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 min-h-[60px]">
                                <div className="flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-yellow-600 mt-1" />
                                    <p className="text-gray-800 text-sm whitespace-pre-wrap">
                                        {pass.note || "No specific security remarks entered."}
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
