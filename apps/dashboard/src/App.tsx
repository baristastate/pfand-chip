import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  History,
  Settings,
  Bell,
  Search,
  Beer,
  ScanLine,
  Loader2,
  CalendarRange,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useBarrels } from './hooks/useBarrels';
import { useDashboardStats } from './hooks/useDashboardStats';
import { BookingsView } from './views/BookingsView';

type Page = 'overview' | 'buchungen';

const Dashboard = () => {
  const [page, setPage] = useState<Page>('overview');
  const { barrels, loading: barrelsLoading } = useBarrels();
  const { stats, loading: statsLoading } = useDashboardStats();

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div className="logo-section">
          <Beer className="logo-icon" size={32} />
          <h1 className="logo-text gradient-text">Kindl System</h1>
        </div>

        <nav className="nav-menu">
          <NavItem icon={<LayoutDashboard size={20} />} label="Übersicht" active={page === 'overview'} onClick={() => setPage('overview')} />
          <NavItem icon={<Package size={20} />} label="Fässer" onClick={() => setPage('overview')} />
          <NavItem icon={<Truck size={20} />} label="Lieferungen" onClick={() => setPage('overview')} />
          <NavItem icon={<Users size={20} />} label="Kunden" onClick={() => setPage('overview')} />
          <NavItem icon={<CalendarRange size={20} />} label="Buchungen" active={page === 'buchungen'} onClick={() => setPage('buchungen')} />
          <NavItem icon={<History size={20} />} label="Protokoll" onClick={() => setPage('overview')} />
          <NavItem icon={<Settings size={20} />} label="Einstellungen" onClick={() => setPage('overview')} />
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile card">
            <div className="avatar">MK</div>
            <div className="user-info">
              <span className="user-name">Lager Admin</span>
              <span className="user-role text-muted">Management</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar glass">
          <div className="search-box">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Search barrels, customers, RFID..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn"><Bell size={20} /></button>
            <button className="primary-btn"><ScanLine size={18} /> New Scan</button>
          </div>
        </header>

        <section className="content-grid">
          {page === 'buchungen' ? (
            <BookingsView />
          ) : (
            <>
              {statsLoading ? (
                <div className="loading-state"><Loader2 className="animate-spin" /> Berechne Kennzahlen…</div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="stats-row"
                >
                  <StatCard label="Aktive Fässer" value={stats.activeBarrels.toString()} trend="+3%" />
                  <StatCard label="Beim Kunden" value={stats.atCustomer.toString()} trend="+12%" />
                  <StatCard label="Wartung" value={stats.maintenance.toString()} trend="-2%" />
                  <StatCard label="Offene Pfänder" value={`${stats.totalDeposit.toLocaleString('de-DE')} €`} trend="+540€" />
                </motion.div>
              )}

          {/* Recent Activity / Barrel Status */}
          <div className="data-layout">
            <div className="card barrel-list">
              <div className="card-header">
                <h3>Live Barrel Tracking</h3>
                <div className="header-right">
                  {barrelsLoading && <Loader2 className="animate-spin text-muted" size={16} />}
                  <button className="text-btn">View All</button>
                </div>
              </div>
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Barrel Number</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Batch</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barrels.length > 0 ? (
                      barrels.slice(0, 10).map((barrel) => (
                        <TableRow 
                          key={barrel.id}
                          id={barrel.barrel_number} 
                          size={`${barrel.size_liters}L`} 
                          status={barrel.status} 
                          location={barrel.current_batch_id || '-'} 
                          time={new Date(barrel.created_at).toLocaleDateString('de-DE')} 
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-8">No barrels found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card ai-insights glass">
              <div className="card-header">
                <h3>AI Insights (Ollama)</h3>
              </div>
              <div className="insight-content">
                <p className="text-muted text-sm">
                  "3 Barrels at 'Sendlinger Brauhaus' are over 60 days. Recommendation: Trigger return reminder sequence."
                </p>
                <div className="insight-tags">
                  <span className="tag warning">Action Required</span>
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </section>
      </main>

      <style>{`
        .dashboard-container {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }
        .sidebar {
          width: 280px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 3rem;
        }
        .logo-icon { color: var(--primary); }
        .logo-text { font-weight: 700; font-size: 1.5rem; letter-spacing: -0.5px; }
        
        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          color: var(--text-muted);
          transition: var(--transition);
        }
        .nav-item:hover, .nav-item.active {
          background: rgba(212, 163, 115, 0.1);
          color: var(--primary);
        }
        .nav-item.active { font-weight: 600; }
        
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          padding: 2rem;
          gap: 2rem;
        }
        .top-bar {
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: var(--radius);
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          width: 400px;
        }
        .search-box input {
          background: none;
          border: none;
          color: var(--text);
          width: 100%;
          outline: none;
        }
        
        .primary-btn {
          background: var(--primary);
          color: var(--background);
          padding: 10px 20px;
          border-radius: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: var(--transition);
        }
        .primary-btn:hover { background: var(--primary-dark); }
        
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .stat-card {
           background: var(--surface);
           padding: 1.5rem;
           border-radius: var(--radius);
           border: 1px solid var(--border);
        }
        .stat-label { color: var(--text-muted); font-size: 0.875rem; }
        .stat-value { font-size: 1.75rem; font-weight: 700; margin-top: 4px; display: block; }
        
        .data-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }
        .custom-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        .custom-table th {
          text-align: left;
          color: var(--text-muted);
          font-weight: 500;
          padding: 12px;
          border-bottom: 1px solid var(--border);
        }
        .custom-table td {
          padding: 16px 12px;
          border-bottom: 1px solid var(--border);
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-badge.at_customer { background: rgba(244, 162, 97, 0.2); color: var(--warning); }
        .status-badge.filled { background: rgba(132, 169, 140, 0.2); color: var(--success); }
        
        .avatar {
          width: 40px;
          height: 40px;
          background: var(--primary);
          color: var(--background);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: 700;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
        }
        .user-info { display: flex; flex-direction: column; }
        .user-name { font-weight: 600; font-size: 0.9rem; }
        .user-role { font-size: 0.75rem; }
      `}</style>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) => (
  <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({ label, value, trend }) => (
  <div className="stat-card">
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
    <span className={`trend ${trend.startsWith('+') ? 'text-success' : 'text-error'}`} style={{fontSize: '0.75rem'}}>
      {trend} vs last month
    </span>
  </div>
);

const TableRow = ({ id, size, status, location, time }) => (
  <tr>
    <td style={{fontWeight: 600}}>{id}</td>
    <td>{size}</td>
    <td><span className={`status-badge ${status.toLowerCase()}`}>{status}</span></td>
    <td>{location}</td>
    <td className="text-muted">{time}</td>
  </tr>
);

export default Dashboard;
