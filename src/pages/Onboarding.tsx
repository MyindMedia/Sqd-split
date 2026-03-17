import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="onboarding-page">
      <div className="onboarding-glow" />

      <div className="onboarding-content animate-fade-in">
        <div className="onboarding-logo-area">
          <div className="onboarding-logo-ring">
            <img src="/logo.png" alt="Splits Logo" style={{ width: 80, height: 80, borderRadius: '1.25rem' }} />
          </div>

          <h1 className="onboarding-title">Splits</h1>
          <p className="onboarding-tagline">Split bills. Not friendships.</p>
        </div>

        <div className="onboarding-illustration">
          <div className="onboarding-avatars">
            {['#E3FF73', '#B4A2FF', '#82B1FF', '#FF7351', '#FFD54F'].map((color, i) => (
              <div
                key={i}
                className="onboarding-avatar-circle"
                style={{
                  background: color,
                  animationDelay: `${i * 0.15}s`,
                  left: `${15 + i * 15}%`,
                  top: `${20 + Math.sin(i * 1.2) * 25}%`,
                }}
              />
            ))}
            <svg className="onboarding-lines" viewBox="0 0 200 100">
              <line x1="40" y1="30" x2="80" y2="60" stroke="#e1fd71" strokeWidth="0.5" opacity="0.3" />
              <line x1="80" y1="60" x2="120" y2="40" stroke="#b3a1fe" strokeWidth="0.5" opacity="0.3" />
              <line x1="120" y1="40" x2="155" y2="65" stroke="#96bcff" strokeWidth="0.5" opacity="0.3" />
            </svg>
          </div>
        </div>

        <div className="onboarding-actions">
          <button className="btn-primary-gradient" onClick={() => navigate('/login')}>
            Get Started
          </button>
          <button className="btn-ghost" onClick={() => navigate('/login')}>
            I already have an account
          </button>
          <p className="onboarding-legal label-sm text-muted">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
