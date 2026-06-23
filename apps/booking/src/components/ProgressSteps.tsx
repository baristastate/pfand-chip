import { Check } from 'lucide-react'

interface ProgressStepsProps {
  steps: string[]
  current: number
}

export const ProgressSteps = ({ steps, current }: ProgressStepsProps) => (
  <div className="progress-steps">
    {steps.map((label, i) => {
      const done = i < current
      const active = i === current
      return (
        <div key={i} className="step-item">
          <div className={`step-circle ${done ? 'done' : active ? 'active' : 'pending'}`}>
            {done ? <Check size={13} strokeWidth={3} /> : <span>{i + 1}</span>}
          </div>
          <span className={`step-label ${active ? 'active' : done ? 'done' : ''}`}>{label}</span>
          {i < steps.length - 1 && <div className={`step-line ${done ? 'done' : ''}`} />}
        </div>
      )
    })}

    <style>{`
      .progress-steps {
        display: flex;
        align-items: center;
        gap: 0;
      }
      .step-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .step-circle {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.72rem;
        font-weight: 700;
        flex-shrink: 0;
        transition: var(--transition);
        border: 1.5px solid var(--border);
        color: var(--text-subtle);
      }
      .step-circle.active {
        border-color: var(--primary);
        color: var(--primary);
        background: rgba(212, 163, 115, 0.08);
        box-shadow: 0 0 0 3px rgba(212, 163, 115, 0.12);
      }
      .step-circle.done {
        border-color: var(--success);
        background: rgba(132, 169, 140, 0.2);
        color: var(--success);
      }
      .step-label {
        font-size: 0.77rem;
        color: var(--text-subtle);
        white-space: nowrap;
        font-weight: 500;
      }
      .step-label.active { color: var(--primary); font-weight: 600; }
      .step-label.done { color: var(--text-muted); }
      .step-line {
        width: 28px;
        height: 1px;
        background: var(--border);
        margin: 0 6px;
        flex-shrink: 0;
        transition: var(--transition);
      }
      .step-line.done { background: var(--success); opacity: 0.6; }

      @media (max-width: 700px) {
        .step-label { display: none; }
        .step-line { width: 16px; }
      }
    `}</style>
  </div>
)
