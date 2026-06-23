import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck, Users, Euro, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import { useBookings } from '../hooks/useBookings'
import type { BookingRow } from '../hooks/useBookings'

const STATUS_LABEL: Record<BookingRow['status'], string> = {
  ACCEPTED: 'Bestätigt',
  DRAFT: 'Entwurf',
  CANCELLED: 'Storniert',
}

const STATUS_STYLE: Record<BookingRow['status'], string> = {
  ACCEPTED: 'status-accepted',
  DRAFT: 'status-draft',
  CANCELLED: 'status-cancelled',
}

const EVENT_LABELS: Record<string, string> = {
  FUEHRUNG: 'Führung',
  PRIVATE_EVENT: 'Firmen-Event',
  TASTING: 'Verkostung',
}

type Filter = 'all' | BookingRow['status']

export const BookingsView = () => {
  const { bookings, loading, error, totalRevenue, upcoming } = useBookings()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered =
    filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  const accepted = bookings.filter((b) => b.status === 'ACCEPTED').length

  return (
    <div className="bv-root">
      {/* Stats */}
      <motion.div
        className="bv-stats"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <StatCard
          icon={<CalendarCheck size={20} />}
          label="Bestätigte Buchungen"
          value={accepted.toString()}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Bevorstehende Termine"
          value={upcoming.toString()}
        />
        <StatCard
          icon={<Users size={20} />}
          label="Buchungen gesamt"
          value={bookings.length.toString()}
        />
        <StatCard
          icon={<Euro size={20} />}
          label="Gesamtumsatz (bestätigt)"
          value={`${totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`}
          highlight
        />
      </motion.div>

      {/* Table */}
      <div className="card bv-table-card">
        <div className="bv-table-header">
          <h3 className="bv-table-title">Alle Buchungen</h3>
          <div className="bv-filter-row">
            {(['all', 'ACCEPTED', 'DRAFT', 'CANCELLED'] as Filter[]).map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Alle' : STATUS_LABEL[f as BookingRow['status']]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bv-loading">
            <Loader2 size={24} className="spin text-muted" />
            <span className="text-muted">Buchungen werden geladen…</span>
          </div>
        ) : error ? (
          <div className="bv-error">
            <AlertCircle size={20} className="text-error" />
            <span className="text-error">{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bv-empty text-muted">
            Keine Buchungen gefunden.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="bv-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Paket</th>
                  <th>Datum</th>
                  <th>Kontakt</th>
                  <th>Pers.</th>
                  <th>Preis</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span className="mono-id">{b.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td>
                      <div className="pkg-cell">
                        <span className="pkg-name">{b.package_name}</span>
                        <span className="pkg-type text-muted">
                          {EVENT_LABELS[b.event_type] ?? b.event_type}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <span>
                          {new Date(b.requested_date + 'T00:00:00').toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                          })}
                        </span>
                        <span className="text-muted">{b.requested_time}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <span>{b.contact_name}</span>
                        {b.company_name && (
                          <span className="text-muted">{b.company_name}</span>
                        )}
                      </div>
                    </td>
                    <td className="text-center">{b.participant_count}</td>
                    <td>
                      {b.total_price != null
                        ? `${b.total_price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`
                        : '—'}
                    </td>
                    <td>
                      <span className={`status-badge ${STATUS_STYLE[b.status]}`}>
                        {STATUS_LABEL[b.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .bv-root { display: flex; flex-direction: column; gap: 1.5rem; }
        .bv-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.25rem;
        }
        .bv-table-card { padding: 0; overflow: hidden; }
        .bv-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .bv-table-title { font-size: 1rem; font-weight: 700; }
        .bv-filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-btn {
          padding: 5px 14px;
          border-radius: 20px;
          border: 1px solid var(--border);
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition);
        }
        .filter-btn:hover { border-color: var(--border-hover); color: var(--text); }
        .filter-btn.active {
          background: rgba(212,163,115,0.12);
          border-color: rgba(212,163,115,0.35);
          color: var(--primary);
        }
        .bv-loading, .bv-error, .bv-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 3rem;
          font-size: 0.9rem;
        }
        .table-wrapper { overflow-x: auto; }
        .bv-table {
          width: 100%;
          border-collapse: collapse;
        }
        .bv-table th {
          text-align: left;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .bv-table td {
          padding: 13px 16px;
          border-bottom: 1px solid var(--border);
          font-size: 0.85rem;
          vertical-align: middle;
        }
        .bv-table tr:last-child td { border-bottom: none; }
        .bv-table tr:hover td { background: rgba(255,255,255,0.02); }
        .text-center { text-align: center; }
        .mono-id {
          font-family: 'Courier New', monospace;
          font-size: 0.78rem;
          color: var(--text-muted);
          letter-spacing: 1px;
        }
        .pkg-cell, .date-cell, .contact-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pkg-name { font-weight: 600; }
        .pkg-type { font-size: 0.75rem; }
        .status-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .status-badge.status-accepted {
          background: rgba(122, 158, 130, 0.15);
          color: var(--success);
          border: 1px solid rgba(122, 158, 130, 0.25);
        }
        .status-badge.status-draft {
          background: rgba(188, 188, 200, 0.1);
          color: var(--silver, #BCBCC8);
          border: 1px solid rgba(188, 188, 200, 0.2);
        }
        .status-badge.status-cancelled {
          background: rgba(217, 52, 68, 0.1);
          color: var(--error);
          border: 1px solid rgba(217, 52, 68, 0.2);
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

const StatCard = ({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
}) => (
  <div className={`stat-card bv-stat ${highlight ? 'stat-highlight' : ''}`}>
    <div className="bv-stat-icon">{icon}</div>
    <span className="bv-stat-label">{label}</span>
    <span className={`bv-stat-value ${highlight ? 'gradient-text' : ''}`}>{value}</span>
    <style>{`
      .bv-stat { padding: 1.25rem; }
      .bv-stat-icon {
        color: var(--primary);
        margin-bottom: 0.75rem;
      }
      .bv-stat-label {
        display: block;
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-bottom: 4px;
      }
      .bv-stat-value {
        display: block;
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--text);
        line-height: 1.2;
      }
      .stat-highlight {
        border-color: rgba(212,163,115,0.2);
        background: rgba(212,163,115,0.04);
      }
    `}</style>
  </div>
)
