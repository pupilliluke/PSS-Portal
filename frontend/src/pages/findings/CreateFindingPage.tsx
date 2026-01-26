import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateFinding } from '@/hooks/useFindings'
import { useAudits } from '@/hooks/useAudits'
import {
  FINDING_CATEGORIES,
  FINDING_SEVERITIES,
  FINDING_EFFORTS,
} from '@/lib/constants'

const createFindingSchema = z.object({
  auditId: z.string().min(1, 'Please select an audit'),
  category: z.enum(['Automation', 'Data', 'Marketing', 'Security', 'Ops']),
  severity: z.enum(['Low', 'Medium', 'High']),
  effort: z.enum(['S', 'M', 'L']),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  recommendation: z.string().min(1, 'Recommendation is required').max(2000),
  roiEstimate: z.string().max(500).optional(),
})

type CreateFindingFormData = z.infer<typeof createFindingSchema>

export function CreateFindingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedAuditId = searchParams.get('auditId') || ''

  const createFinding = useCreateFinding()
  const { data: audits } = useAudits()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateFindingFormData>({
    resolver: zodResolver(createFindingSchema),
    defaultValues: {
      auditId: preselectedAuditId,
      category: 'Automation',
      severity: 'Medium',
      effort: 'M',
    },
  })

  const onSubmit = async (data: CreateFindingFormData) => {
    try {
      const finding = await createFinding.mutateAsync(data)
      navigate(`/findings/${finding.id}`)
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link to="/findings">
            <ArrowLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Back to Findings
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Create New Finding</h2>
        <p className="text-muted-foreground">
          Document an issue or opportunity discovered during an audit
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Finding Details</CardTitle>
          <CardDescription>
            Provide information about the finding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Audit Selection */}
            <div className="space-y-2">
              <Label htmlFor="auditId" required>
                Audit
              </Label>
              <Select
                id="auditId"
                {...register('auditId')}
                error={errors.auditId?.message}
              >
                <option value="">Select an audit</option>
                {audits?.map((audit) => (
                  <option key={audit.id} value={audit.id}>
                    {audit.title}
                  </option>
                ))}
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" required>
                Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Missing email automation for lead nurturing"
                {...register('title')}
                error={errors.title?.message}
              />
            </div>

            {/* Category, Severity, Effort */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category" required>
                  Category
                </Label>
                <Select id="category" {...register('category')}>
                  {FINDING_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity" required>
                  Severity
                </Label>
                <Select id="severity" {...register('severity')}>
                  {FINDING_SEVERITIES.map((sev) => (
                    <option key={sev} value={sev}>
                      {sev}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="effort" required>
                  Effort
                </Label>
                <Select id="effort" {...register('effort')}>
                  {FINDING_EFFORTS.map((eff) => (
                    <option key={eff} value={eff}>
                      {eff === 'S' ? 'Small' : eff === 'M' ? 'Medium' : 'Large'}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" required>
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the finding in detail…"
                rows={4}
                {...register('description')}
                error={errors.description?.message}
              />
            </div>

            {/* Recommendation */}
            <div className="space-y-2">
              <Label htmlFor="recommendation" required>
                Recommendation
              </Label>
              <Textarea
                id="recommendation"
                placeholder="Describe the recommended action to address this finding…"
                rows={4}
                {...register('recommendation')}
                error={errors.recommendation?.message}
              />
            </div>

            {/* ROI Estimate */}
            <div className="space-y-2">
              <Label htmlFor="roiEstimate">ROI Estimate</Label>
              <Input
                id="roiEstimate"
                placeholder="e.g., $10,000 annual savings or 20% efficiency improvement"
                {...register('roiEstimate')}
                error={errors.roiEstimate?.message}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Estimate the potential return on investment.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link to="/findings">Cancel</Link>
              </Button>
              <Button type="submit" isLoading={isSubmitting || createFinding.isPending}>
                <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                Create Finding
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
