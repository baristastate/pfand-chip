import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Bot,
  Send,
  Loader2,
} from 'lucide-react'
import { useBookingChat } from '../hooks/useBookingChat'
import type { TourPackage, BookingFormData, ChatMessage } from '../types'

interface DetailsStepProps {
  selectedPackage: TourPackage
  chatMessages: ChatMessage[]
  onChatUpdate: (msgs: ChatMessage[]) => void
  onBack: () => void
  onSubmit: (data: BookingFormData) => void
}

const minDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}

export const DetailsStep = ({
  selectedPackage,
  chatMessages,
  onChatUpdate,
  onBack,
  onSubmit,
}: DetailsStepProps) => {
  const [form, setForm] = useState<BookingFormData>({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    company_name: '',
    participant_count: selectedPackage.min_participants,
    requested_date: '',
    requested_time: '14:00',
    special_requirements: '',
  })

  const { messages, streaming, sendMessage, initChat } = useBookingChat(
    selectedPackage,
    chatMessages,
    onChatUpdate,
  )

  useEffect(() => {
    if (chatMessages.length === 0) initChat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = <K extends keyof BookingFormData>(k: K, v: BookingFormData[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const isValid =
    form.contact_name.trim() &&
    form.contact_email.trim() &&
    form.requested_date &&
    form.requested_time

  return (
    <div className="details-root">
      {/* Form column */}
      <div className="details-form-col">
        <div className="card form-card">
          <div className="form-pkg-badge">
            <span
              className="badge-pill"
              style={{ background: 'rgba(212,163,115,0.1)', color: 'var(--primary)', border: '1px solid rgba(212,163,115,0.2)' }}
            >
              {selectedPackage.name}
            </span>
          </div>
          <h2 className="form-title">Ihre Buchungsdetails</h2>

          <div className="form-grid">
            <Field label="Ihr Name *" span>
              <input
                type="text"
                className="finput"
                value={form.contact_name}
                onChange={(e) => set('contact_name', e.target.value)}
                placeholder="Max Mustermann"
              />
            </Field>
            <Field label="E-Mail-Adresse *">
              <input
                type="email"
                className="finput"
                value={form.contact_email}
                onChange={(e) => set('contact_email', e.target.value)}
                placeholder="max@beispiel.de"
              />
            </Field>
            <Field label="Telefon">
              <input
                type="tel"
                className="finput"
                value={form.contact_phone}
                onChange={(e) => set('contact_phone', e.target.value)}
                placeholder="+49 89 …"
              />
            </Field>
            <Field label="Wunschdatum *">
              <input
                type="date"
                className="finput"
                value={form.requested_date}
                min={minDate()}
                onChange={(e) => set('requested_date', e.target.value)}
              />
            </Field>
            <Field label="Uhrzeit *">
              <input
                type="time"
                className="finput"
                value={form.requested_time}
                onChange={(e) => set('requested_time', e.target.value)}
              />
            </Field>
            <Field label="Firmenname / Organisation">
              <input
                type="text"
                className="finput"
                value={form.company_name}
                onChange={(e) => set('company_name', e.target.value)}
                placeholder="Optional"
              />
            </Field>

            <div className="field-block full-span">
              <label className="flabel">
                Personenanzahl * &nbsp;
                <span className="text-muted">({selectedPackage.min_participants}–{selectedPackage.max_participants})</span>
              </label>
              <div className="counter-row">
                <button
                  className="counter-btn"
                  onClick={() => set('participant_count', Math.max(selectedPackage.min_participants, form.participant_count - 1))}
                >
                  −
                </button>
                <span className="counter-val">{form.participant_count}</span>
                <button
                  className="counter-btn"
                  onClick={() => set('participant_count', Math.min(selectedPackage.max_participants, form.participant_count + 1))}
                >
                  +
                </button>
                <span className="counter-price text-muted">
                  {selectedPackage.price_per_person
                    ? `= ${(selectedPackage.price_per_person * form.participant_count).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`
                    : selectedPackage.price_flat
                    ? `${selectedPackage.price_flat.toFixed(2)} € pauschal`
                    : ''}
                </span>
              </div>
            </div>

            <div className="field-block full-span">
              <label className="flabel">Sonderwünsche / Allergien</label>
              <textarea
                className="finput"
                rows={3}
                value={form.special_requirements}
                onChange={(e) => set('special_requirements', e.target.value)}
                placeholder="Z.B. vegetarisch, Rollstuhlzugang, Jubiläumsdeko…"
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="back-btn" onClick={onBack}>
              <ChevronLeft size={16} /> Zurück
            </button>
            <button
              className="next-btn"
              disabled={!isValid}
              onClick={() => onSubmit(form)}
            >
              Vertrag erstellen <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Chat column */}
      <aside className="details-chat-col">
        <div className="card glass chat-panel">
          <div className="chat-head">
            <div className="chat-head-icon">
              <Bot size={16} className="text-primary" />
            </div>
            <div>
              <p className="chat-head-title">KI-Assistent</p>
              <p className="chat-head-sub text-muted">Stellt gerne Ihre Fragen</p>
            </div>
          </div>
          <ChatMessages messages={messages} streaming={streaming} />
          <ChatInput onSend={sendMessage} streaming={streaming} />
        </div>
      </aside>

      <style>{`
        .details-root {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 920px) {
          .details-root { grid-template-columns: 1fr; }
        }
        .form-card { padding: 2rem; }
        .form-pkg-badge { margin-bottom: 0.75rem; }
        .badge-pill {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text);
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .field-block { display: flex; flex-direction: column; gap: 6px; }
        .field-block.full-span { grid-column: 1 / -1; }
        .flabel {
          font-size: 0.77rem;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.2px;
        }
        .finput {
          background: var(--surface-2, #1e1e1e);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 10px 13px;
          color: var(--text);
          font-size: 0.9rem;
          width: 100%;
          transition: var(--transition);
          resize: vertical;
        }
        .finput:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(212,163,115,0.04);
        }
        .finput::placeholder { color: var(--text-subtle); }
        .counter-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .counter-btn {
          width: 34px; height: 34px;
          border-radius: 8px;
          background: var(--surface-2, #1e1e1e);
          border: 1px solid var(--border);
          font-size: 1.1rem;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          color: var(--text);
        }
        .counter-btn:hover { border-color: var(--primary); color: var(--primary); }
        .counter-val { font-size: 1.2rem; font-weight: 700; min-width: 28px; text-align: center; }
        .counter-price { font-size: 0.85rem; margin-left: 4px; }
        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }
        .back-btn {
          display: flex; align-items: center; gap: 6px;
          color: var(--text-muted);
          padding: 9px 14px;
          border-radius: var(--radius-sm);
          transition: var(--transition);
          font-size: 0.875rem;
        }
        .back-btn:hover { color: var(--text); background: rgba(255,255,255,0.04); }
        .next-btn {
          display: flex; align-items: center; gap: 8px;
          background: var(--primary);
          color: #0D0D0D;
          padding: 11px 22px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.9rem;
          transition: var(--transition);
        }
        .next-btn:hover:not(:disabled) { background: var(--primary-dark); }
        .next-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        /* Chat panel */
        .details-chat-col { position: sticky; top: 80px; }
        .chat-panel {
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 120px);
          padding: 1.25rem;
          gap: 0.75rem;
        }
        .chat-head {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .chat-head-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: rgba(212,163,115,0.1);
          border: 1px solid rgba(212,163,115,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .chat-head-title { font-size: 0.9rem; font-weight: 700; }
        .chat-head-sub { font-size: 0.72rem; margin-top: 1px; }
      `}</style>
    </div>
  )
}

const Field = ({
  label,
  children,
  span,
}: {
  label: string
  children: React.ReactNode
  span?: boolean
}) => (
  <div className={`field-block${span ? ' full-span' : ''}`}>
    <label className="flabel">{label}</label>
    {children}
  </div>
)

const ChatMessages = ({
  messages,
  streaming,
}: {
  messages: ChatMessage[]
  streaming: boolean
}) => {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat-msgs">
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`msg ${msg.role}`}
        >
          {msg.content}
        </motion.div>
      ))}
      {streaming && messages.at(-1)?.content === '' && (
        <div className="msg assistant typing">
          <span />
          <span />
          <span />
        </div>
      )}
      <div ref={endRef} />

      <style>{`
        .chat-msgs {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 9px;
          min-height: 0;
        }
        .msg {
          max-width: 88%;
          padding: 9px 13px;
          border-radius: 10px;
          font-size: 0.84rem;
          line-height: 1.55;
          white-space: pre-wrap;
        }
        .msg.user {
          background: rgba(212,163,115,0.18);
          color: var(--text);
          align-self: flex-end;
          border-bottom-right-radius: 3px;
        }
        .msg.assistant {
          background: rgba(255,255,255,0.05);
          color: var(--text);
          align-self: flex-start;
          border-bottom-left-radius: 3px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .msg.typing {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 12px 14px;
        }
        .msg.typing span {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--text-muted);
          animation: bounce 1.2s infinite ease-in-out;
        }
        .msg.typing span:nth-child(2) { animation-delay: 0.2s; }
        .msg.typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}

const ChatInput = ({
  onSend,
  streaming,
}: {
  onSend: (msg: string) => void
  streaming: boolean
}) => {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim() || streaming) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="chat-input-row">
      <input
        type="text"
        className="chat-input"
        placeholder="Frage stellen…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        disabled={streaming}
      />
      <button
        className="send-btn"
        onClick={handleSend}
        disabled={!input.trim() || streaming}
        aria-label="Senden"
      >
        {streaming ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
      </button>

      <style>{`
        .chat-input-row {
          display: flex;
          gap: 8px;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .chat-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 9px 15px;
          color: var(--text);
          font-size: 0.84rem;
          transition: var(--transition);
        }
        .chat-input:focus { outline: none; border-color: rgba(212,163,115,0.5); }
        .chat-input:disabled { opacity: 0.45; }
        .chat-input::placeholder { color: var(--text-subtle); }
        .send-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: var(--primary);
          color: #0D0D0D;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: var(--transition);
        }
        .send-btn:hover:not(:disabled) { background: var(--primary-dark); }
        .send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
