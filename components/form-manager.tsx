"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, FileText, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { mockSubmissions } from "@/lib/mock-data"
import type { Form } from "@/lib/types"

interface FormManagerProps {
  forms: Form[]
  onCreateForm: (name: string) => void
  onUpdateForm: (id: string, updates: Partial<Form>) => void
  onDeleteForm: (id: string) => void
  onEditForm: (form: Form) => void
}

export function FormManager({ forms, onCreateForm, onUpdateForm, onDeleteForm, onEditForm }: FormManagerProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [newFormName, setNewFormName] = useState("")
  const [editingForm, setEditingForm] = useState<Form | null>(null)
  const [editName, setEditName] = useState("")
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set())

  const handleCreate = () => {
    if (newFormName.trim()) {
      onCreateForm(newFormName.trim())
      setNewFormName("")
      setCreateOpen(false)
    }
  }

  const handleEdit = (form: Form) => {
    setEditingForm(form)
    setEditName(form.name)
    setEditOpen(true)
  }

  const handleUpdate = () => {
    if (editingForm && editName.trim()) {
      onUpdateForm(editingForm.id, { name: editName.trim() })
      setEditOpen(false)
      setEditingForm(null)
      setEditName("")
    }
  }

  const toggleExpanded = (formId: string) => {
    const newExpanded = new Set(expandedForms)
    if (newExpanded.has(formId)) {
      newExpanded.delete(formId)
    } else {
      newExpanded.add(formId)
    }
    setExpandedForms(newExpanded)
  }

  const getSubmissionCount = (formId: string) => {
    return mockSubmissions.filter((s) => s.formId === formId).length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-balance">IoT Device Forms</h2>
          <p className="text-muted-foreground">Manage your IoT device schemas and sensor field definitions</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Device Form
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Device Form</DialogTitle>
              <DialogDescription>Create a new IoT device form schema to collect sensor data.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="form-name">Device Form Name</Label>
                <Input
                  id="form-name"
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  placeholder="e.g., Temperature Sensor, Motion Detector"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={!newFormName.trim()}>
                Create Device Form
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => {
          const isExpanded = expandedForms.has(form.id)
          const submissionCount = getSubmissionCount(form.id)

          return (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <FileText className="w-5 h-5" />
                    <CardTitle className="text-lg">{form.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0 ml-auto"
                      onClick={() => toggleExpanded(form.id)}
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>
                    {form.fields.length} sensor field{form.fields.length !== 1 ? "s" : ""}
                  </p>
                  <p>{submissionCount} data entries</p>
                  <p>Created {form.createdAt.toLocaleDateString()}</p>
                </div>

                {isExpanded && (
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-sm font-medium">Sensor Fields:</h4>
                    <div className="grid gap-1">
                      {form.fields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between text-xs">
                          <span className="font-medium">{field.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {field.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {form.fields.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No fields configured yet</p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {form.fields.slice(0, 3).map((field) => (
                    <Badge key={field.id} variant="outline" className="text-xs">
                      {field.name}
                    </Badge>
                  ))}
                  {form.fields.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{form.fields.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => onEditForm(form)} className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Fields
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(form)}>
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
                        <AlertDialogTitle>Delete Device Form</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{form.name}"? This action cannot be undone and will affect
                          any tables using this device form.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteForm(form.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Device Form</DialogTitle>
            <DialogDescription>Update the device form name.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Device Form Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter device form name"
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} disabled={!editName.trim()}>
              Update Device Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
