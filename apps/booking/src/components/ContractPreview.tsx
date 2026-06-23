import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  CheckCircle2,
  Loader2,
  FileText,
  AlertCircle,
  Euro,
} from 'lucide-react'
import { getSupabaseClient } from '../lib/supabase'
import { AI_BASE } from '../lib/ai'
import type { TourPackage, BookingFormData, ChatMessage } from '../types'

interface ContractPreviewProps {
  selectedPackage: TourPackage
  formData: BookingFormData
  chatMessages: ChatMessage[]
  onBack: () => void
  onAccepted: (contractId: string) => void
}

function calcPrice(pkg: TourPackage, count: number): number {
  if (pkg.price_per_person) return pkg.price_per_person * count
  if (pkg.price_flat) return pkg.price_flat
  return 0
}

const EVENT_LABELS: Record<string, string> = {
  FUEHRUNG: 'Brauerei-Führung',
  PRIVATE_EVENT: 'Private Veranstaltung',
  TASTING: 'Bier-Tasting',
}

export const ContractPreview = ({
  selectedPackage,
  formData,
  chatMessages,
  onBack,
  onAccepted,
}: ContractPreviewProps) => {
  const [contractText, setContractText] = useState('')
  const [generating, setGenerating] = useState(true)
  const [genError, setGenError] = useState<string | null>(null)
  const [acceptName, setAcceptName] = useState(formData.contact_name)
  const [accepted, setAccepted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const totalPrice = calcPrice(selectedPackage, formData.participant_count)

  useEffect(() => {
    const generate = async () => {
      try {
        const res = await fetch(`${AI_BASE}/booking/generate-contract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contact_name: formData.contact_name,
            contact_email: formData.contact_email,
            contact_phone: formData.contact_phone || null,
            company_name: formData.company_name || null,
            package_name: selectedPackage.name,
            event_type: selectedPackage.event_type,
            participant_count: formData.participant_count,
            requested_date: formData.requested_date,
            requested_time: formData.requested_time,
            special_requirements: formData.special_requirements || null,
            total_price: totalPrice,
            duration_minutes: selectedPackage.duration_minutes ?? 90,
            includes_catering: selectedPackage.includes_catering,
          }),
        })
        if (!res.ok) throw new Error(`Generierung fehlgeschlagen (${res.status})`)
        const data = (await res.json()) as { contract_text: string }
        setContractText(data.contract_text)
      } catch (err) {
        setGenError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      } finally {
        setGenerating(false)
      }
    }
    generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAccept = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('event_contracts')
        .insert({
          package_id: selectedPackage.id,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone || null,
          company_name: formData.company_name || null,
          participant_count: formData.participant_count,
          requested_date: formData.requested_date,
          requested_time: formData.requested_time,
          special_requirements: formData.special_requirements || null,
          total_price: totalPrice,
          contract_text: contractText,
          status: 'ACCEPTED' as const,
          accepted_at: new Date().toISOString(),
          accepted_by_name: acceptName,
          chat_transcript: chatMessages,
        })
        .select('id')
        .single()

      if (error) throw new Error(error.message)
      onAccepted(data.id)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const formattedDate = formData.requested_date
    ? new Date(formData.requested_date + 'T00:00:00').toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  return (
    <div className="contract-root">
      <div className="contract-top">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={16} /> Zurück
        </button>
        <h2 className="page-title">Vertrag prüfen &amp; unterzeichnen</h2>
      </div>

      <div className="contract-layout">
        {/* Left: Summary + Acceptance */}
        <div className="contract-sidebar">
          <div className="card summary-card">
            <h3 className="card-h">Buchungsübersicht</h3>
            <dl className="summary-dl">
              <dt>Paket</dt>
              <dd>{selectedPackage.name}</dd>
              <dt>Art</dt>
              <dd>{EVENT_LABELS[selectedPackage.event_type] ?? selectedPackage.event_type}</dd>
              <dt>Datum</dt>
              <dd>{formattedDate}</dd>
              <dt>Uhrzeit</dt>
              <dd>{formData.requested_time} Uhr</dd>
              <dt>Personen</dt>
              <dd>{formData.participant_count}</dd>
              <dt>Kontakt</dt>
              <dd>{formData.contact_name}</dd>
              {formData.company_name && <><dt>Firma</dt><dd>{formData.company_name}</dd></>}
              {formData.special_requirements && (
                <><dt>Sonderwünsche</dt><dd>{formData.special_requirements}</dd></>
              )}
            </dl>

            <div className="price-box">
              <Euro size={15} className="text-primary" />
              <div className="price-box-inner">
                <span className="price-label text-muted">Gesamtpreis</span>
                <span className="price-amount gradient-text">
                  {totalPrice.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                </span>
                {selectedPackage.price_per_person && (
                  <span className="price-note text-muted">
                    {selectedPackage.price_per_person.toFixed(2)} € × {formData.participant_count} Personen
                  </span>
                )}
              </div>
            </div>
          </div>

          {!generating && !genError && (
            <motion.div
              className="card acceptance-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="card-h">Digitale Unterschrift</h3>
              <p className="text-muted accept-note">
                Mit der Unterzeichnung bestätigen Sie die Buchung verbindlich.
              </p>

              <div className="field-b">
                <label className="flabel">Vor- und Nachname *</label>
                <input
                  type="text"
                  className="finput"
                  value={acceptName}
                  onChange={(e) => setAcceptName(e.target.value)}
                />
              </div>

              <label className="check-row">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                <span className="check-text">
                  Ich habe den Vertragstext gelesen und akzeptiere alle Bedingungen verbindlich.
                </span>
              </label>

              {saveError && (
                <p className="save-error text-error">{saveError}</p>
              )}

              <button
                className="accept-btn"
                disabled={!accepted || !acceptName.trim() || saving}
                onClick={handleAccept}
              >
                {saving ? (
                  <Loader2 size={17} className="spin" />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                {saving ? 'Wird gespeichert…' : 'Jetzt verbindlich buchen'}
              </button>
            </motion.div>
          )}
        </div>

        {/* Right: Contract text */}
        <div className="card contract-text-card">
          <div className="ct-header">
            <FileText size={17} className="text-primary" />
            <h3 className="card-h">Vertragstext</h3>
          </div>

          {generating && (
            <div className="gen-loading">
              <div className="gen-spinner">
                <Loader2 size={30} className="spin text-primary" />
              </div>
              <p className="text-muted">Ihr persönlicher Vertrag wird von der KI generiert…</p>
              <p className="gen-note text-muted">Dies dauert ca. 30–90 Sekunden.</p>
            </div>
          )}

          {genError && (
            <div className="gen-error">
              <AlertCircle size={26} className="text-error" />
              <p className="text-error">Fehler: {genError}</p>
              <p className="text-muted">Bitte gehen Sie zurück und versuchen es erneut.</p>
            </div>
          )}

          {!generating && !genError && (
            <motion.pre
              className="contract-pre"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {contractText}
            </motion.pre>
          )}
        </div>
      </div>

      <style>{`
        .contract-root { display: flex; flex-direction: column; gap: 1.5rem; }
        .contract-top { display: flex; align-items: center; gap: 1rem; }
        .page-title { font-size: 1.6rem; font-weight: 700; }
        .contract-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 900px) { .contract-layout { grid-template-columns: 1fr; } }

        .contract-sidebar { display: flex; flex-direction: column; gap: 1.25rem; }
        .card-h { font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem; }
        .summary-card { }
        .summary-dl {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 7px 14px;
          margin-bottom: 1rem;
        }
        .summary-dl dt { color: var(--text-muted); font-size: 0.78rem; padding-top: 1px; }
        .summary-dl dd { font-size: 0.85rem; font-weight: 500; }
        .price-box {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 1rem;
          background: rgba(212,163,115,0.06);
          border: 1px solid rgba(212,163,115,0.15);
          border-radius: var(--radius-sm);
        }
        .price-box-inner { display: flex; flex-direction: column; gap: 2px; }
        .price-label { font-size: 0.75rem; }
        .price-amount { font-size: 1.5rem; font-weight: 700; line-height: 1.2; }
        .price-note { font-size: 0.72rem; }

        .acceptance-card { display: flex; flex-direction: column; gap: 1rem; }
        .accept-note { font-size: 0.83rem; }
        .field-b { display: flex; flex-direction: column; gap: 5px; }
        .flabel { font-size: 0.77rem; font-weight: 600; color: var(--text-muted); }
        .finput {
          background: var(--surface-2, #1e1e1e);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 9px 12px;
          color: var(--text);
          font-size: 0.875rem;
          width: 100%;
          transition: var(--transition);
        }
        .finput:focus { outline: none; border-color: var(--primary); }
        .check-row {
          display: flex;
          gap: 10px;
          cursor: pointer;
          align-items: flex-start;
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .checkbox {
          width: 17px; height: 17px;
          flex-shrink: 0;
          margin-top: 2px;
          accent-color: var(--primary);
          cursor: pointer;
        }
        .check-text { }
        .save-error { font-size: 0.82rem; }
        .accept-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--primary);
          color: #0D0D0D;
          padding: 13px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: var(--transition);
          width: 100%;
          margin-top: 0.25rem;
        }
        .accept-btn:hover:not(:disabled) { background: var(--primary-dark); }
        .accept-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .contract-text-card { }
        .ct-header { display: flex; align-items: center; gap: 9px; margin-bottom: 1rem; }
        .gen-loading, .gen-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
          text-align: center;
        }
        .gen-spinner {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: rgba(212,163,115,0.08);
          display: flex; align-items: center; justify-content: center;
        }
        .gen-note { font-size: 0.8rem; }
        .contract-pre {
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          line-height: 1.75;
          white-space: pre-wrap;
          word-break: break-word;
          color: var(--text-muted);
          max-height: 600px;
          overflow-y: auto;
        }

        .back-btn {
          display: flex; align-items: center; gap: 6px;
          color: var(--text-muted);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          transition: var(--transition);
          font-size: 0.875rem;
        }
        .back-btn:hover { color: var(--text); background: rgba(255,255,255,0.04); }
      `}</style>
    </div>
  )
}
