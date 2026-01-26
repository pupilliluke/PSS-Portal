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
