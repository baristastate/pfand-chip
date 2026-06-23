import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, Utensils, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { getSupabaseClient } from '../lib/supabase'
import type { TourPackage } from '../types'

const EVENT_LABELS: Record<string, string> = {
  FUEHRUNG: 'Brauerei-Führung',
  PRIVATE_EVENT: 'Private Veranstaltung',
  TASTING: 'Bier-Tasting',
}

const EVENT_COLORS: Record<string, string> = {
  FUEHRUNG: '#D4A373',
  PRIVATE_EVENT: '#C0C0C8',
  TASTING: '#84A98C',
}

interface PackageSelectorProps {
  onSelect: (pkg: TourPackage) => void
}

export const PackageSelector = ({ onSelect }: PackageSelectorProps) => {
  const [packages, setPackages] = useState<TourPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase
      .from('tour_packages')
      .select('*')
      .eq('active', true)
      .order('event_type')
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setPackages((data as TourPackage[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="pkg-loading">
        <Loader2 size={30} className="spin text-primary" />
        <p className="text-muted">Pakete werden geladen…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pkg-error card">
        <AlertCircle size={24} className="text-error" />
        <p className="text-error">Fehler: {error}</p>
      </div>
    )
  }

  return (
    <div className="pkg-selector">
      <div className="pkg-hero">
        <p className="pkg-eyebrow text-silver">Willkommen</p>
        <h2 className="pkg-title gradient-text">Was darf es heute sein?</h2>
        <p className="pkg-subtitle text-muted">
          Wählen Sie das passende Erlebnis für Ihre Gruppe — wir führen Sie durch den Rest.
        </p>
      </div>

      <div className="pkg-grid">
        {packages.map((pkg, i) => (
          <motion.button
            key={pkg.id}
            className="pkg-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            onClick={() => onSelect(pkg)}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="pkg-type-pill"
              style={{
                background: `${EVENT_COLORS[pkg.event_type] ?? '#888'}18`,
                color: EVENT_COLORS[pkg.event_type] ?? '#888',
                border: `1px solid ${EVENT_COLORS[pkg.event_type] ?? '#888'}30`,
              }}
            >
              {EVENT_LABELS[pkg.event_type] ?? pkg.event_type}
            </div>

            <h3 className="pkg-name">{pkg.name}</h3>
            <p className="pkg-desc">{pkg.description}</p>

            <div className="pkg-meta">
              {pkg.duration_minutes && (
                <span className="pkg-meta-item">
                  <Clock size={13} /> {pkg.duration_minutes} Min.
                </span>
              )}
              <span className="pkg-meta-item">
                <Users size={13} /> {pkg.min_participants}–{pkg.max_participants} Pers.
              </span>
              {pkg.includes_catering && (
                <span className="pkg-meta-item">
                  <Utensils size={13} /> Brotzeit inkl.
                </span>
              )}
            </div>

            <div className="pkg-footer">
              <span className="pkg-price">
                {pkg.price_per_person
                  ? `${pkg.price_per_person.toFixed(2)} € / Person`
                  : pkg.price_flat
                  ? `${pkg.price_flat.toFixed(2)} € pauschal`
                  : 'Preis auf Anfrage'}
              </span>
              <span className="pkg-cta-icon">
                <ChevronRight size={16} />
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <style>{`
        .pkg-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          min-height: 40vh;
        }
        .pkg-error {
          display: flex;
          align-items: center;
          gap: 12px;
          border-color: var(--error);
        }
        .pkg-selector { padding: 0.5rem 0; }
        .pkg-hero { margin-bottom: 2.5rem; }
        .pkg-eyebrow {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        .pkg-title { font-size: 2.2rem; font-weight: 700; line-height: 1.2; margin-bottom: 0.75rem; }
        .pkg-subtitle { font-size: 1.05rem; max-width: 560px; }
        .pkg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 1.25rem;
        }
        .pkg-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          background: var(--surface);
          border: 1px solid var(--border);
          text-align: left;
          cursor: pointer;
          transition: border-color 0.25s, box-shadow 0.25s;
          width: 100%;
        }
        .pkg-card:hover {
          border-color: var(--primary);
          box-shadow: 0 0 0 1px rgba(212,163,115,0.15), 0 12px 28px rgba(0,0,0,0.4);
        }
        .pkg-type-pill {
          display: inline-flex;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          width: fit-content;
        }
        .pkg-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text);
          line-height: 1.3;
        }
        .pkg-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.55;
          flex: 1;
        }
        .pkg-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .pkg-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.77rem;
          color: var(--text-subtle);
        }
        .pkg-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid var(--border);
          margin-top: 2px;
        }
        .pkg-price {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--primary);
        }
        .pkg-cta-icon {
          color: var(--text-muted);
          display: flex;
          align-items: center;
          transition: color 0.2s, transform 0.2s;
        }
        .pkg-card:hover .pkg-cta-icon {
          color: var(--primary);
          transform: translateX(3px);
        }
        .text-silver { color: var(--silver); }
      `}</style>
    </div>
  )
}
