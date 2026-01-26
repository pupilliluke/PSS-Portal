import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateAudit } from '@/hooks/useAudits'

const createAuditSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
})

type CreateAuditFormData = z.infer<typeof createAuditSchema>

export function CreateAuditPage() {
  const navigate = useNavigate()
  const createAudit = useCreateAudit()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAuditFormData>({
    resolver: zodResolver(createAuditSchema),
  })

  const onSubmit = async (data: CreateAuditFormData) => {
    try {
      const audit = await createAudit.mutateAsync(data)
      navigate(`/audits/${audit.id}`)
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to="/audits">
            <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Back to Audits
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Create New Audit</h2>
        <p className="text-muted-foreground">
          Start a new consulting audit for your client
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Details</CardTitle>
          <CardDescription>
            Provide the basic information for this audit
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
                <Link to="/audits">Cancel</Link>
              </Button>
              <Button type="submit" isLoading={isSubmitting || createAudit.isPending}>
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                Create Audit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
