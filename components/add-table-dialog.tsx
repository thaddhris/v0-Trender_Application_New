"use client"

import type React from "react"

import { useState } from "react"
import { Plus, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Form, Table } from "@/lib/types"

interface AddTableDialogProps {
  forms: Form[]
  currentListId: string | null
  onCreateTable: (table: Omit<Table, "id" | "createdAt">) => void
  trigger?: React.ReactNode
}

type Step = "form" | "fields" | "primary-key" | "review"

export function AddTableDialog({ forms, currentListId, onCreateTable, trigger }: AddTableDialogProps) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>("form")
  const [selectedForm, setSelectedForm] = useState<Form | null>(null)
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([])
  const [primaryKeyFieldId, setPrimaryKeyFieldId] = useState<string>("")
  const [tableName, setTableName] = useState("")

  const steps: { key: Step; title: string; description: string }[] = [
    { key: "form", title: "Select Form", description: "Choose the form to create a table from" },
    { key: "fields", title: "Select Fields", description: "Choose which fields to include as columns" },
    { key: "primary-key", title: "Primary Key", description: "Select the primary key field" },
    { key: "review", title: "Review", description: "Review and create your table" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)
  const canProceed = () => {
    switch (currentStep) {
      case "form":
        return selectedForm !== null
      case "fields":
        return selectedFieldIds.length > 0
      case "primary-key":
        return primaryKeyFieldId !== ""
      case "review":
        return tableName.trim() !== ""
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].key)
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].key)
    }
  }

  const handleFormSelect = (form: Form) => {
    setSelectedForm(form)
    setSelectedFieldIds([])
    setPrimaryKeyFieldId("")
    setTableName(`${form.name} Table`)
  }

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFieldIds((prev) => {
      const newSelection = prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
      // Reset primary key if it's no longer selected
      if (!newSelection.includes(primaryKeyFieldId)) {
        setPrimaryKeyFieldId("")
      }
      return newSelection
    })
  }

  const handleCreate = () => {
    if (!selectedForm || !currentListId) return

    onCreateTable({
      listId: currentListId,
      formId: selectedForm.id,
      name: tableName.trim(),
      selectedFieldIds,
      primaryKeyFieldId,
      isLocked: false,
    })

    // Reset form
    setSelectedForm(null)
    setSelectedFieldIds([])
    setPrimaryKeyFieldId("")
    setTableName("")
    setCurrentStep("form")
    setOpen(false)
  }

  const selectedFields = selectedForm?.fields.filter((f) => selectedFieldIds.includes(f.id)) || []

  const renderStepContent = () => {
    switch (currentStep) {
      case "form":
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {forms.map((form) => (
                <Card
                  key={form.id}
                  className={`cursor-pointer transition-colors ${
                    selectedForm?.id === form.id ? "ring-2 ring-primary" : "hover:bg-accent"
                  }`}
                  onClick={() => handleFormSelect(form)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{form.name}</h4>
                        <p className="text-sm text-muted-foreground">{form.fields.length} fields</p>
                      </div>
                      {selectedForm?.id === form.id && <Check className="w-5 h-5 text-primary" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case "fields":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Select the fields you want to include as columns in your table.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedFieldIds.length === selectedForm?.fields.length) {
                    setSelectedFieldIds([])
                    setPrimaryKeyFieldId("")
                  } else {
                    const allFieldIds = selectedForm?.fields.map((f) => f.id) || []
                    setSelectedFieldIds(allFieldIds)
                    if (allFieldIds.length > 0) {
                      setPrimaryKeyFieldId(allFieldIds[0])
                    }
                  }
                }}
              >
                {selectedFieldIds.length === selectedForm?.fields.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="space-y-3">
              {selectedForm?.fields.map((field) => (
                <div key={field.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={field.id}
                    checked={selectedFieldIds.includes(field.id)}
                    onCheckedChange={() => handleFieldToggle(field.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={field.id} className="font-medium cursor-pointer">
                      {field.name}
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                      {field.options && (
                        <Badge variant="secondary" className="text-xs">
                          {field.options.length} options
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "primary-key":
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Choose which field will be the primary key (first column) for your table.
            </div>
            <RadioGroup value={primaryKeyFieldId} onValueChange={setPrimaryKeyFieldId}>
              <div className="space-y-3">
                {selectedFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value={field.id} id={`pk-${field.id}`} />
                    <div className="flex-1">
                      <Label htmlFor={`pk-${field.id}`} className="font-medium cursor-pointer">
                        {field.name}
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Primary Key
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )

      case "review":
        const primaryKeyField = selectedFields.find((f) => f.id === primaryKeyFieldId)
        return (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="table-name">Table Name</Label>
              <Input
                id="table-name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Enter table name"
              />
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Form</h4>
                <p className="text-sm text-muted-foreground">{selectedForm?.name}</p>
              </div>
              <div>
                <h4 className="font-medium">Selected Fields ({selectedFields.length})</h4>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedFields.map((field) => (
                    <Badge
                      key={field.id}
                      variant={field.id === primaryKeyFieldId ? "default" : "outline"}
                      className="text-xs"
                    >
                      {field.name}
                      {field.id === primaryKeyFieldId && " (PK)"}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium">Primary Key</h4>
                <p className="text-sm text-muted-foreground">{primaryKeyField?.name}</p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Table</DialogTitle>
          <DialogDescription>
            Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex].description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStepIndex ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${index < currentStepIndex ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[300px]">{renderStepContent()}</div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStepIndex === 0}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            {currentStep === "review" ? (
              <Button onClick={handleCreate} disabled={!canProceed()}>
                Create Table
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
