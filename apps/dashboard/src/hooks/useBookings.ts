import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../lib/supabase'

export interface BookingRow {
  id: string
  contact_name: string
  contact_email: string
  company_name: string | null
  package_name: string
  event_type: string
  requested_date: string
  requested_time: string
  participant_count: number
  total_price: number | null
  status: 'DRAFT' | 'ACCEPTED' | 'CANCELLED'
  accepted_at: string | null
  created_at: string
}

export function useBookings() {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase
      .from('event_contracts')
      .select(`
        id,
        contact_name,
        contact_email,
        company_name,
        participant_count,
        requested_date,
        requested_time,
        total_price,
        status,
        accepted_at,
        created_at,
        tour_packages ( name, event_type )
      `)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message)
        } else {
          const rows: BookingRow[] = (data ?? []).map((d) => {
            const pkg = d.tour_packages as { name: string; event_type: string } | null
            return {
              id: d.id,
              contact_name: d.contact_name,
              contact_email: d.contact_email,
              company_name: d.company_name ?? null,
              package_name: pkg?.name ?? '—',
              event_type: pkg?.event_type ?? '—',
              requested_date: d.requested_date,
              requested_time: d.requested_time,
              participant_count: d.participant_count,
              total_price: d.total_price ?? null,
              status: d.status as BookingRow['status'],
              accepted_at: d.accepted_at ?? null,
              created_at: d.created_at,
            }
          })
          setBookings(rows)
        }
        setLoading(false)
      })
  }, [])

  const totalRevenue = bookings
    .filter((b) => b.status === 'ACCEPTED')
    .reduce((sum, b) => sum + (b.total_price ?? 0), 0)

  const upcoming = bookings.filter(
    (b) => b.status === 'ACCEPTED' && new Date(b.requested_date) >= new Date(),
  ).length

  return { bookings, loading, error, totalRevenue, upcoming }
}
