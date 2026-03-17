import React from 'react';
import './SquadCard.css';

interface SquadCardProps {
  eventName: string;
  emoji: string;
  amount: number;
  isSecured: boolean;
}

export const SquadCard: React.FC<SquadCardProps> = ({ eventName, emoji, amount, isSecured }) => {
  return (
    <div className={`squad-card-container ${isSecured ? 'secured' : ''}`}>
      <div className="squad-card glass-card">
        {/* Holographic Overlays */}
        <div className="card-shine" />
        <div className="card-glimmer" />
        
        <div className="card-inner">
          <div className="card-top">
            <div className="card-brand">
              <span className="brand-sqd">SQD</span>
              <span className="brand-split">SPLIT</span>
            </div>
            <div className="card-chip">
              <div className="chip-line" />
              <div className="chip-line" />
              <div className="chip-line" />
            </div>
          </div>

          <div className="card-center">
            <div className="card-emoji-box">
              <span className="card-emoji">{emoji}</span>
            </div>
            <div className="card-status-badge">
              <div className="pulse-dot" />
              <span className="label-sm">{isSecured ? 'SECURED SQUAD' : 'SECURING...'}</span>
            </div>
          </div>

          <div className="card-bottom">
            <div className="card-holder">
              <span className="label-xs text-muted">SQUAD NAME</span>
              <span className="body-md font-logo">{eventName.toUpperCase()}</span>
            </div>
            <div className="card-amount">
              <span className="label-xs text-muted">AUTHORIZED</span>
              <span className="title-md">${amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Security Hologram */}
        <div className="security-hologram">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" stroke="var(--primary)" strokeWidth="0.5" fill="none" strokeDasharray="4 2" />
            <path d="M14 20L18 24L26 16" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};
