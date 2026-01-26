export const API_URL = import.meta.env.VITE_API_URL || '/api'

export const AUDIT_STATUSES = [
  'Draft',
  'InReview',
  'InProgress',
  'Delivered',
  'Closed',
] as const

export const FINDING_CATEGORIES = [
  'Automation',
  'Data',
  'Marketing',
  'Security',
  'Ops',
] as const

export const FINDING_SEVERITIES = ['Low', 'Medium', 'High'] as const

export const FINDING_EFFORTS = ['S', 'M', 'L'] as const

export const FINDING_STATUSES = [
  'Identified',
  'InProgress',
  'Resolved',
] as const

export const USER_ROLES = [
  'Owner',
  'Admin',
  'ClientManager',
  'ClientViewer',
] as const

// Status colors for badges
export const STATUS_COLORS = {
  Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  InReview: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  InProgress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  Identified: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  Resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
} as const

export const SEVERITY_COLORS = {
  Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
} as const

export const CATEGORY_COLORS = {
  Automation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  Data: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Marketing: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  Security: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  Ops: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
} as const

// Allowed file types for uploads
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ],
  data: ['text/csv', 'text/plain'],
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
