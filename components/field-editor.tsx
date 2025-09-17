"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Type, Hash, Calendar, ToggleLeft, List, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Form, Field } from "@/lib/types"

interface FieldEditorProps {
  form: Form
  onUpdateForm: (updates: Partial<Form>) => void
  onBack: () => void
}

const FIELD_TYPE_ICONS = {
  text: Type,
  number: Hash,
  date: Calendar,
  boolean: ToggleLeft,
  enum: List,
}

const FIELD_TYPE_LABELS = {
  text: "Text",
  number: "Number",
  date: "Date",
  boolean: "Boolean",
  enum: "Select",
}

export function FieldEditor({ form, onUpdateForm, onBack }: FieldEditorProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingField, setEditingField] = useState<Field | null>(null)
  const [fieldName, setFieldName] = useState("")
  const [fieldType, setFieldType] = useState<Field["type"]>("text")
  const [enumOptions, setEnumOptions] = useState("")

  const handleCreateField = () => {
    if (!fieldName.trim()) return

    const newField: Field = {
      id: `field-${Date.now()}`,
      formId: form.id,
      name: fieldName.trim(),
      type: fieldType,
      options: fieldType === "enum" ? enumOptions.split("\n").filter((opt) => opt.trim()) : undefined,
    }

    onUpdateForm({
      fields: [...form.fields, newField],
    })

    setFieldName("")
    setFieldType("text")
    setEnumOptions("")
    setCreateOpen(false)
  }

  const handleEditField = (field: Field) => {
    setEditingField(field)
    setFieldName(field.name)
    setFieldType(field.type)
    setEnumOptions(field.options?.join("\n") || "")
    setEditOpen(true)
  }

  const handleUpdateField = () => {
    if (!editingField || !fieldName.trim()) return

    const updatedField: Field = {
      ...editingField,
      name: fieldName.trim(),
      type: fieldType,
      options: fieldType === "enum" ? enumOptions.split("\n").filter((opt) => opt.trim()) : undefined,
    }

    onUpdateForm({
      fields: form.fields.map((f) => (f.id === editingField.id ? updatedField : f)),
    })

    setEditingField(null)
    setFieldName("")
    setFieldType("text")
    setEnumOptions("")
    setEditOpen(false)
  }

  const handleDeleteField = (fieldId: string) => {
    onUpdateForm({
      fields: form.fields.filter((f) => f.id !== fieldId),
    })
  }

  const resetForm = () => {
    setFieldName("")
    setFieldType("text")
    setEnumOptions("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Forms
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-balance">{form.name}</h2>
          <p className="text-muted-foreground">Manage fields for this form</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Fields ({form.fields.length})</h3>
          <p className="text-sm text-muted-foreground">Define the structure of your form data</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Field</DialogTitle>
              <DialogDescription>Create a new field for this form.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="field-name">Field Name</Label>
                <Input
                  id="field-name"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="Enter field name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="field-type">Field Type</Label>
                <Select value={fieldType} onValueChange={(value: Field["type"]) => setFieldType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="enum">Select (Enum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {fieldType === "enum" && (
                <div className="grid gap-2">
                  <Label htmlFor="enum-options">Options (one per line)</Label>
                  <Textarea
                    id="enum-options"
                    value={enumOptions}
                    onChange={(e) => setEnumOptions(e.target.value)}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={4}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Reset
              </Button>
              <Button onClick={handleCreateField} disabled={!fieldName.trim()}>
                Add Field
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {form.fields.map((field) => {
          const IconComponent = FIELD_TYPE_ICONS[field.type]
          return (
            <Card key={field.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{field.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{FIELD_TYPE_LABELS[field.type]}</Badge>
                        {field.options && (
                          <Badge variant="secondary" className="text-xs">
                            {field.options.length} options
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditField(field)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Field</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the field "{field.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteField(field.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {field.options && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Options:</p>
                    <div className="flex flex-wrap gap-1">
                      {field.options.map((option, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Field</DialogTitle>
            <DialogDescription>Update the field properties.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-field-name">Field Name</Label>
              <Input
                id="edit-field-name"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="Enter field name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-field-type">Field Type</Label>
              <Select value={fieldType} onValueChange={(value: Field["type"]) => setFieldType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="enum">Select (Enum)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {fieldType === "enum" && (
              <div className="grid gap-2">
                <Label htmlFor="edit-enum-options">Options (one per line)</Label>
                <Textarea
                  id="edit-enum-options"
                  value={enumOptions}
                  onChange={(e) => setEnumOptions(e.target.value)}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateField} disabled={!fieldName.trim()}>
              Update Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
