import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Beer } from 'lucide-react'
import { ProgressSteps } from './components/ProgressSteps'
import { PackageSelector } from './components/PackageSelector'
import { DetailsStep } from './components/DetailsStep'
import { ContractPreview } from './components/ContractPreview'
import { ConfirmationPage } from './components/ConfirmationPage'
import type { TourPackage, BookingFormData, ChatMessage } from './types'

type Step = 'packages' | 'details' | 'contract' | 'done'

const STEP_LABELS = ['Paket wählen', 'Ihre Daten', 'Vertrag prüfen', 'Bestätigung']
const STEP_MAP: Record<Step, number> = { packages: 0, details: 1, contract: 2, done: 3 }

const SLIDE = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as number[] },
}

const BookingApp = () => {
  const [step, setStep] = useState<Step>('packages')
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null)
  const [formData, setFormData] = useState<BookingFormData | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [contractId, setContractId] = useState<string | null>(null)

  const resetAll = () => {
    setStep('packages')
    setSelectedPackage(null)
    setFormData(null)
    setChatMessages([])
    setContractId(null)
  }

  return (
    <div className="booking-root">
      <header className="booking-header glass">
        <div className="header-inner">
          <div className="header-logo">
            <div className="logo-icon-wrap">
              <Beer size={22} className="text-primary" />
            </div>
            <h1 className="logo-text gradient-text">Brauerei Buchung</h1>
          </div>
          {step !== 'done' && (
            <ProgressSteps steps={STEP_LABELS} current={STEP_MAP[step]} />
          )}
        </div>
      </header>

      <main className="booking-main">
        <AnimatePresence mode="wait">
          {step === 'packages' && (
            <motion.div key="packages" {...SLIDE}>
              <PackageSelector
                onSelect={(pkg) => {
                  setSelectedPackage(pkg)
                  setStep('details')
                }}
              />
            </motion.div>
          )}

          {step === 'details' && selectedPackage && (
            <motion.div key="details" {...SLIDE}>
              <DetailsStep
                selectedPackage={selectedPackage}
                chatMessages={chatMessages}
                onChatUpdate={setChatMessages}
                onBack={() => setStep('packages')}
                onSubmit={(data) => {
                  setFormData(data)
                  setStep('contract')
                }}
              />
            </motion.div>
          )}

          {step === 'contract' && selectedPackage && formData && (
            <motion.div key="contract" {...SLIDE}>
              <ContractPreview
                selectedPackage={selectedPackage}
                formData={formData}
                chatMessages={chatMessages}
                onBack={() => setStep('details')}
                onAccepted={(id) => {
                  setContractId(id)
                  setStep('done')
                }}
              />
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <ConfirmationPage contractId={contractId} onNewBooking={resetAll} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .booking-root {
          min-height: 100vh;
          background: var(--background);
          display: flex;
          flex-direction: column;
        }
        .booking-header {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 0.9rem 2rem;
          border-bottom: 1px solid var(--border);
        }
        .header-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }
        .header-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .logo-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(212, 163, 115, 0.1);
          border: 1px solid rgba(212, 163, 115, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo-text {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.3px;
        }
        .booking-main {
          flex: 1;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          padding: 2rem;
        }
      `}</style>
    </div>
  )
}

export default BookingApp
