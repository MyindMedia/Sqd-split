import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { AvatarGroup } from '../components/Avatar';
import { BottomNav } from '../components/BottomNav';
import { recentSplits as mockRecentSplits } from '../data/mockData';
import { useUser } from '../hooks/useUser';
import './History.css';

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  settled: { bg: 'rgba(105, 240, 174, 0.12)', color: '#69F0AE', label: 'Settled' },
  paid: { bg: 'rgba(105, 240, 174, 0.12)', color: '#69F0AE', label: 'Paid' },
  pending: { bg: 'rgba(150, 188, 255, 0.12)', color: '#96bcff', label: 'Pending' },
  owe: { bg: 'rgba(255, 115, 81, 0.12)', color: '#ff7351', label: 'You Owe' },
};

export default function History() {
  const navigate = useNavigate();
  const { userId } = useUser();

  // Convex live data
  const liveEvents = useQuery(api.splitEvents.listUserEvents, userId ? { userId } : "skip");
  const splits = liveEvents || mockRecentSplits;

  return (
    <div className="history-page animate-fade-in">
      <header className="page-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="title-md">My Splits</span>
        <button className="icon-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5H17M7 10H17M3 15H17" stroke="#adaaaa" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      {/* Stats Row */}
      <div className="history-stats">
        <div className="stat-card glass-card">
          <span className="display-stat text-primary">{splits.length}</span>
          <span className="label-sm text-muted">Total Splits</span>
        </div>
        <div className="stat-card glass-card">
          <span className="display-stat text-primary">$1,240</span>
          <span className="label-sm text-muted">This Month</span>
        </div>
        <div className="stat-card glass-card">
          <span className="display-stat text-primary">$350</span>
          <span className="label-sm text-muted">Saved</span>
        </div>
      </div>

      {/* Recent Section */}
      <section className="history-section">
        <div className="section-header" style={{ padding: '0 var(--space-5)' }}>
          <span className="title-sm">Recent</span>
          <button className="label-md text-primary">See all</button>
        </div>
        <div className="history-list">
          {splits.map((split: any) => {
            const status = STATUS_STYLES[split.status] || STATUS_STYLES.pending;
            const myShare = split.myShare || (split.totalBill / 4); // Handle live data structure
            
            return (
              <div key={split._id || split.id} className="history-item" onClick={() => navigate(`/receipt/${split._id || split.id}`)}>
                <div className="split-icon-circle">
                  <span>{split.emoji || "🍽️"}</span>
                </div>
                <div className="history-item-info">
                  <span className="title-sm">{split.name}</span>
                  <span className="label-sm text-muted">{split.date}</span>
                </div>
                <div className="history-item-right">
                  <span className="title-sm text-primary">${myShare.toFixed(2)}</span>
                  <span
                    className="status-chip label-sm"
                    style={{ background: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>
                <AvatarGroup names={(split.participants as any[])?.map((p: any) => p.name || p.user?.name) || []} size={20} max={3} />
              </div>
            );
          })}
        </div>
      </section>

      <BottomNav />
      <div style={{ height: 100 }} />
    </div>
  );
}
