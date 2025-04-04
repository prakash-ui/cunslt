export interface Review {
  id: string
  consultation_id: string
  client_id: string
  expert_id: string
  rating: number
  comment: string
  is_verified: boolean
  is_anonymous: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ReviewResponse {
  id: string
  review_id: string
  response: string
  created_at: string
  updated_at: string
}

export interface ReviewReport {
  id: string
  review_id: string
  reporter_id: string
  reason: string
  status: "pending" | "resolved" | "rejected"
  created_at: string
  updated_at: string
}

export interface ReviewHelpful {
  id: string
  review_id: string
  user_id: string
  is_helpful: boolean
  created_at: string
}

export interface ReviewStats {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export interface ReviewFormData {
  consultation_id: string
  rating: number
  comment: string
  is_anonymous: boolean
}

export interface ReviewResponseFormData {
  review_id: string
  response: string
}

export interface ReviewReportFormData {
  review_id: string
  reason: string
}

