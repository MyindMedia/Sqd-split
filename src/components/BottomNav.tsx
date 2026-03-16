import { useLocation, useNavigate } from 'react-router-dom';
import './BottomNav.css';

const tabs = [
  { id: 'home', label: 'Home', path: '/home', icon: HomeIcon },
  { id: 'splits', label: 'Splits', path: '/history', icon: SplitsIcon },
  { id: 'profile', label: 'Profile', path: '/profile', icon: ProfileIcon },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    if (location.pathname.startsWith('/history') || location.pathname.startsWith('/claim') || location.pathname.startsWith('/confirm') || location.pathname.startsWith('/receipt')) return 'splits';
    if (location.pathname.startsWith('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <tab.icon active={activeTab === tab.id} />
            <span className="bottom-nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15C15 14.4477 14.5523 14 14 14H10C9.44772 14 9 14.4477 9 15V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
        fill={active ? '#e1fd71' : 'none'}
        stroke={active ? '#e1fd71' : '#767575'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SplitsIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke={active ? '#e1fd71' : '#767575'} strokeWidth="1.5" fill={active ? '#e1fd71' : 'none'} fillOpacity={active ? 0.15 : 0} />
      <line x1="3" y1="9" x2="21" y2="9" stroke={active ? '#e1fd71' : '#767575'} strokeWidth="1.5" />
      <line x1="12" y1="9" x2="12" y2="20" stroke={active ? '#e1fd71' : '#767575'} strokeWidth="1.5" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={active ? '#e1fd71' : '#767575'} strokeWidth="1.5" fill={active ? '#e1fd71' : 'none'} fillOpacity={active ? 0.15 : 0} />
      <path d="M4 20C4 17.7909 7.58172 16 12 16C16.4183 16 20 17.7909 20 20" stroke={active ? '#e1fd71' : '#767575'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
