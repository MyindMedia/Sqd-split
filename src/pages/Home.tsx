import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Avatar, AvatarGroup } from '../components/Avatar';
import { BottomNav } from '../components/BottomNav';
import { friends as mockFriends, recentSplits as mockRecentSplits } from '../data/mockData';
import { useUser } from '../hooks/useUser';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { userId } = useUser();
  
  // Convex live data
  const liveEvents = useQuery(api.splitEvents.listUserEvents, userId ? { userId } : "skip");
  const liveFriends = useQuery(api.friends.getUserFriends, userId ? { userId } : "skip");

  // Fallback to mock if not yet configured with Convex
  const splits = liveEvents || mockRecentSplits;
  const friends = liveFriends || mockFriends;

  const activeSplit = splits[0];

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <button className="icon-btn">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="10" cy="10" r="7" stroke="#adaaaa" strokeWidth="1.5"/>
            <line x1="15" y1="15" x2="20" y2="20" stroke="#adaaaa" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <Avatar name="Lawrence B." size={36} />
      </header>

      {/* Active Split Card */}
      <div className="split-card glass-card" onClick={() => navigate(`/claim/${activeSplit?._id || activeSplit?.id}`)}>
        <div className="split-card-top">
          <div className="split-card-left">
            <span className="label-md text-muted">Split With</span>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <AvatarGroup names={activeSplit?.participants?.map((p: any) => p.name || p.user?.name) || []} size={28} />
            </div>
            <button className="split-now-btn" onClick={(e) => { e.stopPropagation(); navigate('/scan'); }}>
              Split Now
            </button>
          </div>
          <div className="split-card-right">
            <span className="label-md text-muted">Total Bill</span>
            <span className="display-amount">${activeSplit?.totalBill || activeSplit?.totalBill}</span>
            <span className="split-event-name label-md text-primary">{activeSplit?.name}</span>
          </div>
        </div>
      </div>

      {/* Nearby Friends */}
      <section className="home-section">
        <div className="section-header">
          <span className="title-sm">Nearby Friends</span>
          <button className="label-md text-primary" onClick={() => navigate('/friends')}>See all</button>
        </div>
        <div className="friends-row">
          {friends.slice(0, 4).map((friend: any) => (
            <div key={friend._id || friend.id} className="friend-chip" onClick={() => navigate('/friends')}>
              <Avatar name={friend.name} size={48} />
              <span className="label-sm text-muted">{friend.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Splits */}
      <section className="home-section">
        <div className="section-header">
          <span className="title-sm">Recent Split</span>
        </div>
        {(splits as any[]).slice(0, 3).map((split: any) => (
          <div key={split._id || split.id} className="recent-split-card" onClick={() => navigate(`/receipt/${split._id || split.id}`)}>
            <div className="split-icon-circle">
              <span>{split.emoji}</span>
            </div>
            <div className="split-info">
              <span className="title-sm">{split.name}</span>
              <span className="label-sm text-muted">Total payment ${split.totalBill}</span>
            </div>
            <AvatarGroup names={(split.participants as any[])?.map((p: any) => p.name || p.user?.name) || []} size={24} max={3} />
          </div>
        ))}
      </section>

      {/* FAB */}
      <button className="fab" onClick={() => navigate('/create')}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <line x1="14" y1="6" x2="14" y2="22" stroke="#1a1919" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="6" y1="14" x2="22" y2="14" stroke="#1a1919" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      <BottomNav />
      <div style={{ height: 100 }} />
    </div>
  );
}
