// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  organizationName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  organizationId: string
  email: string
}

export interface RefreshRequest {
  refreshToken: string
}

// Audit Types
export interface Audit {
  id: string
  title: string
  status: AuditStatus
  auditorId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type AuditStatus = 'Draft' | 'InReview' | 'InProgress' | 'Delivered' | 'Closed'

export interface CreateAuditRequest {
  title: string
  notes?: string
}

export interface UpdateAuditRequest {
  title: string
  notes?: string
}

export interface UpdateStatusRequest {
  status: string
}

// Finding Types
export interface Finding {
  id: string
  auditId: string
  category: FindingCategory
  severity: FindingSeverity
  effort: FindingEffort
  title: string
  description: string
  recommendation: string
  roiEstimate: string | null
  status: FindingStatus
  createdAt: string
  updatedAt: string
}

export interface FindingDetail extends Finding {
  audit: AuditSummary
}

export interface AuditSummary {
  id: string
  title: string
  status: AuditStatus
}

export type FindingCategory = 'Automation' | 'Data' | 'Marketing' | 'Security' | 'Ops'
export type FindingSeverity = 'Low' | 'Medium' | 'High'
export type FindingEffort = 'S' | 'M' | 'L'
export type FindingStatus = 'Identified' | 'InProgress' | 'Resolved'

export interface CreateFindingRequest {
  auditId: string
  category: FindingCategory
  severity: FindingSeverity
  effort: FindingEffort
  title: string
  description: string
  recommendation: string
  roiEstimate?: string
}

export interface UpdateFindingRequest {
  category: FindingCategory
  severity: FindingSeverity
  effort: FindingEffort
  title: string
  description: string
  recommendation: string
  roiEstimate?: string
}

// Activity Types
export interface ActivityLog {
  id: string
  userId: string
  userEmail: string
  action: ActivityAction
  entityType: EntityType
  entityId: string
  timestamp: string
}

export type ActivityAction = 'Created' | 'Updated' | 'StatusChanged' | 'Deleted'
export type EntityType = 'Audit' | 'Finding' | 'Attachment'

// Attachment Types
export interface Attachment {
  id: string
  auditId: string | null
  fileName: string
  contentType: string
  fileSize: number
  uploadedAt: string
  uploadedByEmail: string
}

// Lead Types
export interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  company: string | null
  source: LeadSource
  status: LeadStatus
  score: number | null
  notes: string | null
  importBatchId: string | null
  importSourceId: string | null
  createdAt: string
  updatedAt: string
}

export type LeadSource = 'Website' | 'Referral' | 'GoogleSheets' | 'Manual' | 'Advertisement' | 'Other'
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost'

export interface CreateLeadRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  source: LeadSource
  notes?: string
}

export interface UpdateLeadRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  source: LeadSource
  score?: number
  notes?: string
}

export interface LeadsFilters {
  status?: LeadStatus
  source?: LeadSource
  search?: string
}

// Common Types
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  pageSize: number
  currentPage: number
  totalPages: number
}

// Billing Types
export type ServiceModule =
  | 'BasicCRM'
  | 'LeadGeneration'
  | 'EmailAutomation'
  | 'SocialInbox'
  | 'AdvancedAnalytics'
  | 'Integrations'
  | 'EnterpriseFeatures'

export interface ServicePlan {
  service: ServiceModule
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  monthlyPriceId: string
  yearlyPriceId: string
  features: string[]
}

export interface SubscriptionStatus {
  subscriptionId: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  services: SubscribedService[]
}

export interface SubscribedService {
  service: ServiceModule
  priceId: string
  quantity: number
}

export interface Invoice {
  id: string
  invoiceNumber: string | null
  status: string
  amountDue: number
  amountPaid: number
  currency: string
  dueDate: string | null
  paidAt: string | null
  hostedInvoiceUrl: string | null
  invoicePdfUrl: string | null
  createdAt: string
}

export interface PaymentMethod {
  id: string
  type: string
  last4: string | null
  brand: string | null
  expMonth: number | null
  expYear: number | null
  isDefault: boolean
}

export interface CheckoutRequest {
  services: ServiceModule[]
  successUrl: string
  cancelUrl: string
}

export interface CheckoutResponse {
  sessionId: string
  url: string
}

export interface PortalRequest {
  returnUrl: string
}

export interface PortalResponse {
  url: string
}
