import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ManualInterventionModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function ManualInterventionModal({ isOpen, onClose, onComplete }: ManualInterventionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>需要人工接管</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>AI遇到了无法自动解决的问题，需要人工接管。请检查并解决问题后继续。</p>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            取消
          </Button>
          <Button onClick={onComplete}>完成接管</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

