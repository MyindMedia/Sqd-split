import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-page animate-fade-in">
      <header className="login-header">
        <button className="icon-btn" onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="login-logo text-primary" style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.125rem' }}>Splits</span>
        <div style={{ width: 24 }} />
      </header>

      <div className="login-body">
        <h1 className="headline-lg text-primary">Welcome back</h1>
        <p className="body-md text-muted" style={{ marginTop: 'var(--space-2)' }}>Sign in to continue splitting</p>

        <div className="login-form">
          <div className="input-field">
            <div className="country-picker">
              <span>🇺🇸</span>
              <span className="label-md">+1</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="#adaaaa" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <input
              type="tel"
              placeholder="Phone number"
              className="body-md"
            />
          </div>
        </div>

        <div className="login-divider">
          <span className="label-sm text-muted">or continue with</span>
        </div>

        <div className="social-row">
          <button className="social-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M14.94 10.41C14.94 9.89 14.89 9.55 14.78 9.19H10.18V11.33H12.86C12.78 11.85 12.43 12.64 11.65 13.16L11.63 13.29L13.2 14.5L13.32 14.51C14.36 13.56 14.94 12.13 14.94 10.41Z" fill="#4285F4"/>
              <path d="M10.18 15.98C11.72 15.98 13.02 15.46 13.32 14.51L11.65 13.16C11.22 13.47 10.63 13.68 10.18 13.68C8.7 13.68 7.43 12.73 7.02 11.42L6.9 11.43L5.26 12.7L5.23 12.82C6.15 14.68 8.04 15.98 10.18 15.98Z" fill="#34A853"/>
              <path d="M7.02 11.42C6.89 11.06 6.82 10.67 6.82 10.27C6.82 9.87 6.89 9.48 7.01 9.12L7.01 8.99L5.35 7.7L5.23 7.72C4.82 8.55 4.59 9.38 4.59 10.27C4.59 11.16 4.82 11.99 5.23 12.82L7.02 11.42Z" fill="#FBBC05"/>
              <path d="M10.18 6.86C11.22 6.86 11.92 7.32 12.33 7.7L13.36 6.7C12.51 5.91 11.43 5.42 10.18 5.42C8.04 5.42 6.15 6.72 5.23 8.58L7.01 9.98C7.43 8.67 8.7 6.86 10.18 6.86Z" fill="#EA4335"/>
            </svg>
          </button>
          <button className="social-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <path d="M14.43 10.51C14.43 9.02 13.72 7.84 12.61 7.15C12.86 6.45 13.46 5.28 14.68 4.47C14.86 4.35 14.92 4.11 14.82 3.93C14.72 3.75 14.48 3.67 14.29 3.76C12.79 4.45 11.9 5.56 11.46 6.45C10.99 6.28 10.51 6.18 10 6.18C7.42 6.18 5.57 8.24 5.57 10.51C5.57 12.31 6.29 13.69 7.43 14.58C6.86 14.88 6.36 15.33 6 15.88C5.88 16.06 5.92 16.3 6.1 16.43C6.28 16.55 6.52 16.51 6.65 16.33C7.18 15.54 8.03 15.07 9 15.07H11C11.97 15.07 12.82 15.54 13.35 16.33C13.48 16.51 13.72 16.55 13.9 16.43C14.08 16.3 14.12 16.06 14 15.88C13.64 15.33 13.14 14.88 12.57 14.58C13.71 13.69 14.43 12.31 14.43 10.51Z"/>
            </svg>
          </button>
          <button className="social-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="4" width="16" height="12" rx="2" stroke="white" strokeWidth="1.5"/>
              <path d="M2 6L10 11L18 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <button className="btn-primary-gradient" onClick={() => navigate('/home')} style={{ marginTop: 'var(--space-8)' }}>
          Continue
        </button>

        <p className="login-signup-link body-sm" style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
          Don't have an account? <a href="#" className="text-secondary" onClick={(e) => { e.preventDefault(); navigate('/home'); }}>Sign up</a>
        </p>
      </div>
    </div>
  );
}
