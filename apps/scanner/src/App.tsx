import React, { useState } from 'react';
import { 
  Scan, 
  Search, 
  History, 
  AlertTriangle,
  ChevronLeft,
  Smartphone,
  CheckCircle2,
  Package,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScanner } from './hooks/useScanner';

const ScannerApp = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const [lastScan, setLastScan] = useState<string | null>(null);
  const { updateBarrelStatus, loading, error } = useScanner();
  const [success, setSuccess] = useState(false);

  const handleSimulateScan = () => {
    // Demo ID matching seed data
    const mockUid = "E004015020304050"; 
    setLastScan(mockUid);
    setSuccess(false);
  };

  const handleBooking = async () => {
    if (!lastScan) return;
    const res = await updateBarrelStatus(lastScan, 'DELIVERED');
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setLastScan(null);
        setSuccess(false);
      }, 2000);
    }
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <header className="mobile-header glass">
        <div className="header-top">
          <Package className="text-primary" size={24} />
          <span className="brand-name">Kindl Scanner</span>
          <div className="battery-status">
            <Smartphone size={16} />
            <span>84%</span>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="mobile-content">
        <AnimatePresence mode="wait">
          {activeTab === 'scan' && (
            <motion.div 
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="scan-view"
            >
              <div className="scanner-target">
                <div className="scanner-line"></div>
                <Scan size={64} className="text-primary opacity-20" />
              </div>
              
              <div className="scan-actions">
                <button className="scan-btn" onClick={handleSimulateScan}>
                  <Scan size={24} /> RFID Scan simulieren
                </button>
                <button className="scan-btn secondary">
                  <Search size={24} /> Manuelle Suche
                </button>
              </div>

              {lastScan && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="scan-result-card card glass"
                >
                  <div className="result-header">
                    <CheckCircle2 className="text-success" size={24} />
                    <h4>Fass erkannt</h4>
                  </div>
                  <div className="result-details">
                    <div className="detail">
                      <span className="label">UID:</span>
                      <span className="value font-mono">{lastScan}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Typ:</span>
                      <span className="value">30L Holzfass</span>
                    </div>
                  </div>
                  <div className="result-actions">
                    <button 
                      className="action-btn success" 
                      onClick={handleBooking}
                      disabled={loading || success}
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : success ? 'Gebucht!' : 'Buchen'}
                    </button>
                    <button className="action-btn danger" disabled={loading || success}>Schaden</button>
                  </div>
                  {error && <p className="text-error text-xs mt-2">{error}</p>}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="mobile-nav glass">
        <NavButton 
          active={activeTab === 'scan'} 
          onClick={() => setActiveTab('scan')} 
          icon={<Scan size={24} />} 
          label="Scanner" 
        />
        <NavButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')} 
          icon={<History size={24} />} 
          label="Historie" 
        />
        <NavButton 
          active={activeTab === 'alerts'} 
          onClick={() => setActiveTab('alerts')} 
          icon={<AlertTriangle size={24} />} 
          label="Schäden" 
        />
      </nav>

      <style>{`
        .mobile-container {
          height: 100vh;
          background: var(--background);
          color: var(--text);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }
        .mobile-header {
          padding: 1.5rem 1rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand-name { font-weight: 700; font-size: 1.1rem; }
        
        .mobile-content {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
        }
        
        .scan-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          gap: 2rem;
        }
        
        .scanner-target {
          width: 260px;
          height: 260px;
          border: 2px solid var(--primary);
          border-radius: 24px;
          margin-top: 2rem;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(212, 163, 115, 0.05);
          overflow: hidden;
        }
        
        .scanner-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--primary);
          box-shadow: 0 0 15px var(--primary);
          animation: scan-anim 2s linear infinite;
        }
        
        @keyframes scan-anim {
          0% { top: 0; }
          100% { top: 100%; }
        }
        
        .scan-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .scan-btn {
          width: 100%;
          padding: 18px;
          border-radius: 16px;
          background: var(--primary);
          color: #000;
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .scan-btn.secondary {
          background: var(--surface);
          color: var(--text);
          border: 1px solid var(--border);
        }
        
        .scan-result-card {
          width: 100%;
          padding: 1.5rem;
          margin-top: auto;
          margin-bottom: 5rem;
        }
        .result-header { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }
        .result-details { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; margin-bottom: 1rem; }
        .detail { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .label { color: #888; font-size: 0.8rem; }
        .value { font-weight: 500; }
        
        .result-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .action-btn { padding: 12px; border-radius: 8px; font-weight: 600; }
        .action-btn.success { background: var(--success); color: #fff; }
        .action-btn.danger { background: var(--error); color: #fff; }

        .mobile-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 80px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          padding-bottom: env(safe-area-inset-bottom);
        }
        .nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: #888;
          transition: 0.2s;
        }
        .nav-btn.active { color: var(--primary); }
        .nav-btn span { font-size: 0.7rem; font-weight: 500; }
      `}</style>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
  <button className={`nav-btn ${active ? 'active' : ''}`} onClick={onClick}>
    {icon}
    <span>{label}</span>
  </button>
);

export default ScannerApp;
