"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StrategiesGuide } from "./strategies-guide"
import { GraduationCap } from "lucide-react"

interface StrategyGuideModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StrategyGuideModal({ open, onOpenChange }: StrategyGuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-500" />
            Connect Four Strategy Guide
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <StrategiesGuide />
        </div>
      </DialogContent>
    </Dialog>
  )
}
