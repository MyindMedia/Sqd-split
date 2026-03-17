import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { AvatarGroup } from '../components/Avatar';
import { QRCodeSVG } from 'qrcode.react';
import './QRInvite.css';

export default function QRInvite() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // Convex live data
  const event = useQuery(api.splitEvents.getEvent, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");
  const participants = useQuery(api.splitEvents.getEventParticipants, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");

  // Generate real Join URL
  const joinUrl = `${window.location.origin}/join/${eventId}`;

  // Fallback / Mock values
  const inviteCode = event?.inviteCode || "SPLIT99";
  const participantNames = participants?.map((p: any) => p.user?.name || "User") || ["Lawrence B."];

  return (
    <div className="invite-page animate-fade-in">
      <header className="page-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="title-md">Invite Friends</span>
        <button className="icon-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 12H20M12 4V20" stroke="#adaaaa" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      <div className="invite-body">
        <div className="qr-card glass-card">
          <div className="qr-box">
            <QRCodeSVG 
              value={joinUrl} 
              size={180} 
              level="H" 
              includeMargin={false}
              bgColor="transparent"
              fgColor="var(--primary)"
              style={{ borderRadius: '12px' }}
            />
          </div>
          <div className="invite-code-section">
            <span className="label-md text-muted">Invite Code</span>
            <div className="code-display">
              <span className="headline-md text-primary">{inviteCode}</span>
              <button className="icon-btn-small">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M12 2H4C2.9 2 2 2.9 2 4V12H4V4H12V2ZM14 6H7C5.9 6 5 6.9 5 8V15C5 16.1 5.9 17 7 17H14C15.1 17 16 16.1 16 15V8C16 6.9 15.1 6 14 6ZM14 15H7V8H14V15Z" fill="#adaaaa"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="share-section">
          <span className="label-md text-muted">Or share via</span>
          <div className="share-grid">
            <button className="share-btn">WhatsApp</button>
            <button className="share-btn">Messages</button>
            <button className="share-btn">Messenger</button>
            <button className="share-btn">Copy Link</button>
          </div>
        </div>

        <div className="divider" />

        <div className="joined-section">
          <div className="joined-header">
            <span className="title-sm">{participantNames.length} Friends Joined</span>
            <AvatarGroup names={participantNames} size={28} />
          </div>
          <span className="label-sm text-muted">They'll be able to claim items once the receipt is scanned.</span>
        </div>
      </div>

      <div className="invite-footer">
        <button className="btn-primary-gradient" onClick={() => navigate(`/scan/${eventId}`)}>
          Scan Receipt
        </button>
      </div>
    </div>
  );
}
