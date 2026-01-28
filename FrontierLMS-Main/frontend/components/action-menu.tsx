"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pencil, Trash2, ChevronDown } from "lucide-react"

interface ActionMenuProps {
    onEdit?: () => void
    onDelete?: () => void
    children?: React.ReactNode
}

export function ActionMenu({ onEdit, onDelete, children }: ActionMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="default"
                    size="sm"
                    className="bg-[#0b0c2a] hover:bg-[#0b0c2a]/90 text-white h-8 px-3 gap-2"
                >
                    Action
                    <ChevronDown className="h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
                {children ? children : (
                    <>
                        <DropdownMenuItem onClick={onEdit} className="cursor-pointer text-blue-600 focus:text-blue-600 focus:bg-blue-50">
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
