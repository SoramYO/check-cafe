export interface Document {
  url: string
  publicId: string
  _id: string
}

export interface Shop {
  _id: string
  name: string
  address: string
  owner_id: string
}

export interface User {
  _id: string
  email: string
}

export interface Verification {
  _id: string
  shop_id: Shop | null
  document_type: string
  documents: Document[]
  status: "Pending" | "Approved" | "Rejected"
  submitted_at: string
  reviewed_by?: User
  reviewed_at?: string
  reason?: string
  createdAt: string
  updatedAt: string
}

export interface VerificationResponse {
  message: string
  status: number
  data: {
    verifications: Verification[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface VerificationDetailResponse {
  message: string
  status: number
  data: {
    verification: Verification
  }
}

export interface FilterParams {
  page: number
  limit: number
  status?: string
  shopId?: string
} 