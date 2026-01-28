"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Users, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlanCardProps {
  name: string
  price: string
  description: string
  features: string[]
  subscribers: number
  isPopular?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function PlanCard({ 
  name, 
  price, 
  description, 
  features, 
  subscribers, 
  isPopular = false,
  onEdit,
  onDelete 
}: PlanCardProps) {
  return (
    <Card className={cn(
      "relative hover:shadow-lg transition-all",
      isPopular && "border-2 border-primary shadow-md"
    )}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "Custom" && <span className="text-muted-foreground">/month</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <Users className="h-4 w-4" />
            <span>{subscribers} subscribers</span>
          </div>
          
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" className="flex-1" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" className="flex-1" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
