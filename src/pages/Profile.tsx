import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Avatar } from '../components/Avatar';
import { BottomNav } from '../components/BottomNav';
import { userProfile as mockUserProfile } from '../data/mockData';
import { useUser } from '../hooks/useUser';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { userId, user: liveUser } = useUser();
  const updatePrefs = useMutation(api.users.updatePreferences);
  const paymentMethods = useQuery(api.friends.getPaymentMethods, userId ? { userId } : "skip");

  const user = (liveUser || mockUserProfile) as any;
  const [notificationsOn, setNotificationsOn] = useState(user.preferences?.notifications ?? true);

  const toggleNotifications = async () => {
    const newVal = !notificationsOn;
    setNotificationsOn(newVal);
    if (userId && updatePrefs) {
      await updatePrefs({ userId, notificationsEnabled: newVal });
    }
  };

  return (
    <div className="profile-page animate-fade-in">
      <header className="page-header">
        <div style={{ width: 24 }} />
        <span className="title-md">Profile</span>
        <button className="icon-btn">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="2" stroke="#adaaaa" strokeWidth="1.5"/>
            <path d="M11 2V4M11 18V20M2 11H4M18 11H20M4.22 4.22L5.64 5.64M16.36 16.36L17.78 17.78M4.22 17.78L5.64 16.36M16.36 5.64L17.78 4.22" stroke="#adaaaa" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      <div className="profile-body">
        {/* Avatar & Info */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-ring">
            <Avatar name={user.name} size={80} />
          </div>
          <h2 className="headline-sm" style={{ marginTop: 'var(--space-3)' }}>{user.name}</h2>
          <span className="body-md text-muted">{user.handle}</span>
          <span className="label-sm text-muted" style={{ marginTop: 'var(--space-1)' }}>Member since {user.memberSince}</span>
        </div>

        {/* Stats */}
        <div className="profile-stats-row">
          <div className="profile-stat">
            <span className="title-md text-primary">{user.totalSplits || 24}</span>
            <span className="label-sm text-muted">Splits</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="title-md text-primary">{user.friendCount || 15}</span>
            <span className="label-sm text-muted">Friends</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="title-md text-primary">${(user.totalSplitAmount || 1240).toLocaleString()}</span>
            <span className="label-sm text-muted">Split</span>
          </div>
        </div>

        {/* Payment Methods */}
        <section className="profile-section">
          <span className="label-lg text-muted">Payment Methods</span>
          {(paymentMethods || []).map((pm: any) => (
            <div key={pm._id} className="profile-payment-card">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="6" width="24" height="16" rx="3" stroke="var(--tertiary)" strokeWidth="1.5"/>
                <line x1="2" y1="11" x2="26" y2="11" stroke="var(--tertiary)" strokeWidth="1.5"/>
                <rect x="5" y="17" width="8" height="2" rx="1" fill="var(--tertiary)" opacity="0.5"/>
              </svg>
              <div className="profile-payment-info">
                <span className="body-md">•••• {pm.last4}</span>
                <span className="label-sm text-muted">{pm.type.charAt(0).toUpperCase() + pm.type.slice(1)} · {pm.isDefault ? "Default" : ""}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="#adaaaa" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          ))}
          {!paymentMethods && (
            <div className="profile-payment-card">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="6" width="24" height="16" rx="3" stroke="var(--tertiary)" strokeWidth="1.5"/>
                <line x1="2" y1="11" x2="26" y2="11" stroke="var(--tertiary)" strokeWidth="1.5"/>
                <rect x="5" y="17" width="8" height="2" rx="1" fill="var(--tertiary)" opacity="0.5"/>
              </svg>
              <div className="profile-payment-info">
                <span className="body-md">•••• 4242</span>
                <span className="label-sm text-muted">Visa · Default</span>
              </div>
            </div>
          )}
          <button className="profile-add-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="3" x2="8" y2="13" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="3" y1="8" x2="13" y2="8" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="body-md text-primary">Add Payment Method</span>
          </button>
        </section>

        {/* Preferences */}
        <section className="profile-section">
          <span className="label-lg text-muted">Preferences</span>
          <div className="profile-pref-row">
            <span className="body-md">Push Notifications</span>
            <button
              className={`toggle-switch ${notificationsOn ? 'on' : ''}`}
              onClick={toggleNotifications}
            >
              <div className="toggle-thumb" />
            </button>
          </div>
          <div className="profile-pref-row">
            <span className="body-md">Default Tip</span>
            <span className="body-md text-muted">{user.defaultTipPercent || 20}%</span>
          </div>
          <div className="profile-pref-row">
            <span className="body-md">Split Method</span>
            <span className="body-md text-muted" style={{ textTransform: 'capitalize' }}>{user.splitMethod || "even"}</span>
          </div>
        </section>

        {/* Account */}
        <section className="profile-section">
          <span className="label-lg text-muted">Account</span>
          <div className="profile-pref-row clickable">
            <span className="body-md">Privacy & Security</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="#adaaaa" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="profile-pref-row clickable" onClick={() => navigate('/')}>
            <span className="body-md text-error">Log Out</span>
          </div>
        </section>
      </div>

      <BottomNav />
      <div style={{ height: 100 }} />
    </div>
  );
}
