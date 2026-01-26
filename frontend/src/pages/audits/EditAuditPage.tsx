import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useAudit, useUpdateAudit } from '@/hooks/useAudits'

const updateAuditSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
})

type UpdateAuditFormData = z.infer<typeof updateAuditSchema>

export function EditAuditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: audit, isLoading } = useAudit(id!)
  const updateAudit = useUpdateAudit()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateAuditFormData>({
    resolver: zodResolver(updateAuditSchema),
  })

  // Populate form when audit loads
  useEffect(() => {
    if (audit) {
      reset({
        title: audit.title,
        notes: audit.notes || '',
      })
    }
  }, [audit, reset])

  const onSubmit = async (data: UpdateAuditFormData) => {
    try {
      await updateAudit.mutateAsync({ id: id!, data })
      navigate(`/audits/${id}`)
    } catch {
      // Error handled by mutation
    }
  }

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!audit) {
    return (
      <EmptyState
        title="Audit not found"
        description="The audit you're looking for doesn't exist"
        action={
          <Button asChild>
            <Link to="/audits">Back to Audits</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to={`/audits/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Back to Audit
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Edit Audit</h2>
        <p className="text-muted-foreground">Update the audit details</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Details</CardTitle>
          <CardDescription>
            Update the information for this audit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" required>
                Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Q1 2026 Marketing Audit"
                autoFocus
                {...register('title')}
                error={errors.title?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this audit…"
                rows={5}
                {...register('notes')}
                error={errors.notes?.message}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Add context, objectives, or any relevant information.
              </p>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link to={`/audits/${id}`}>Cancel</Link>
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting || updateAudit.isPending}
                disabled={!isDirty}
              >
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
