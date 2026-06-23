export interface TourPackage {
  id: string
  name: string
  description: string | null
  event_type: 'FUEHRUNG' | 'PRIVATE_EVENT' | 'TASTING'
  duration_minutes: number | null
  min_participants: number
  max_participants: number
  price_per_person: number | null
  price_flat: number | null
  includes_catering: boolean
  active: boolean
  created_at: string
}

export interface BookingFormData {
  contact_name: string
  contact_email: string
  contact_phone: string
  company_name: string
  participant_count: number
  requested_date: string
  requested_time: string
  special_requirements: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
