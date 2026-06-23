import { motion } from 'framer-motion'
import { CheckCircle2, RotateCcw, CalendarCheck, Mail } from 'lucide-react'

interface ConfirmationPageProps {
  contractId: string | null
  onNewBooking: () => void
}

export const ConfirmationPage = ({ contractId, onNewBooking }: ConfirmationPageProps) => (
  <div className="confirm-root">
    <motion.div
      className="card confirm-card"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="check-ring">
        <CheckCircle2 size={40} className="text-success" />
      </div>

      <h2 className="confirm-title gradient-text">Buchung bestätigt!</h2>
      <p className="confirm-sub text-muted">
        Vielen Dank — wir freuen uns auf Ihren Besuch in der Brauerei.
      </p>

      {contractId && (
        <div className="booking-id-wrap">
          <span className="bid-label text-muted">Ihre Buchungs-ID</span>
          <span className="bid-value">{contractId.slice(0, 8).toUpperCase()}</span>
        </div>
      )}

      <div className="next-steps">
        <h3 className="next-title">Was passiert als nächstes?</h3>
        <div className="next-item">
          <div className="next-icon">
            <Mail size={16} className="text-primary" />
          </div>
          <p>Sie erhalten eine Buchungsbestätigung per E-Mail mit allen Details.</p>
        </div>
        <div className="next-item">
          <div className="next-icon">
            <CalendarCheck size={16} className="text-primary" />
          </div>
          <p>50% Anzahlung ist innerhalb von 7 Tagen nach Buchung fällig.</p>
        </div>
        <div className="next-item">
          <div className="next-icon">
            <CheckCircle2 size={16} className="text-success" />
          </div>
          <p>Wir melden uns 7 Tage vor dem Termin zur finalen Bestätigung.</p>
        </div>
      </div>

      <button className="new-btn" onClick={onNewBooking}>
        <RotateCcw size={15} />
        Neue Buchung starten
      </button>
    </motion.div>

    <style>{`
      .confirm-root {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 65vh;
        padding: 2rem 0;
      }
      .confirm-card {
        max-width: 520px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        padding: 2.5rem;
        text-align: center;
        border-color: var(--border-hover, #3D3D3D);
      }
      .check-ring {
        width: 72px; height: 72px;
        border-radius: 50%;
        background: rgba(132, 169, 140, 0.1);
        border: 1px solid rgba(132, 169, 140, 0.25);
        display: flex; align-items: center; justify-content: center;
      }
      .confirm-title { font-size: 1.9rem; font-weight: 700; }
      .confirm-sub { font-size: 0.95rem; }
      .booking-id-wrap {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 12px 28px;
        background: rgba(212,163,115,0.07);
        border: 1px solid rgba(212,163,115,0.2);
        border-radius: var(--radius-sm);
      }
      .bid-label { font-size: 0.72rem; letter-spacing: 1px; text-transform: uppercase; }
      .bid-value {
        font-size: 1.15rem;
        font-weight: 700;
        letter-spacing: 3px;
        color: var(--primary);
        font-family: 'Courier New', monospace;
      }
      .next-steps {
        width: 100%;
        text-align: left;
        background: rgba(255,255,255,0.025);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .next-title {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.7px;
        margin-bottom: 0.25rem;
      }
      .next-item {
        display: flex;
        gap: 10px;
        align-items: flex-start;
      }
      .next-icon {
        width: 28px; height: 28px;
        border-radius: 6px;
        background: rgba(212,163,115,0.08);
        border: 1px solid var(--border);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .next-item p { font-size: 0.83rem; color: var(--text-muted); line-height: 1.5; padding-top: 4px; }
      .new-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 22px;
        border-radius: 20px;
        border: 1px solid var(--border-hover, #3D3D3D);
        color: var(--text-muted);
        font-size: 0.875rem;
        cursor: pointer;
        transition: var(--transition);
      }
      .new-btn:hover { color: var(--text); border-color: var(--text-muted); }
    `}</style>
  </div>
)
