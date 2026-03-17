import { useNavigate } from 'react-router-dom';
import { Show, SignInButton, SignUpButton } from "@clerk/react";
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <img src="/logo.png" alt="Sqd Split Logo" style={{ width: 28, height: 28, borderRadius: '0.5rem' }} />
          <span style={{ fontFamily: 'var(--font-logo)', color: 'var(--primary)', fontSize: '1rem', textTransform: 'uppercase' }}>Sqd Split</span>
        </div>
        <div style={{ width: 24 }} />
      </header>

      <div className="login-body">
        <h1 className="headline-lg text-primary">Simple & Secure</h1>
        <p className="body-md text-muted" style={{ marginTop: 'var(--space-2)' }}>Sign in with Clerk to continue</p>

        <div className="login-actions" style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="btn-primary-gradient">Sign In</button>
            </SignInButton>
            
            <div className="login-divider">
              <span className="label-sm text-muted">or</span>
            </div>

            <SignUpButton mode="modal">
              <button className="btn-ghost" style={{ border: '1px solid var(--border)', width: '100%', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                Create New Account
              </button>
            </SignUpButton>
          </Show>
        </div>

        <p className="login-signup-link body-sm" style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
          By continuing, you agree to our <a href="#" className="text-secondary">Terms & Privacy</a>
        </p>
      </div>
    </div>
  );
}
