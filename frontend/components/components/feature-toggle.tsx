"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface FeatureToggleProps {
  label: string
  description?: string
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function FeatureToggle({ label, description, defaultChecked = false, onCheckedChange }: FeatureToggleProps) {
  return (
    <div className="flex items-center justify-between space-x-2 rounded-lg border p-3 shadow-sm">
      <div className="space-y-0.5">
        <Label htmlFor={`toggle-${label}`}>{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch id={`toggle-${label}`} defaultChecked={defaultChecked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

