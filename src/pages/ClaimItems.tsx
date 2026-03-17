import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from "../../convex/_generated/dataModel";
import { Avatar } from '../components/Avatar';
import { sampleReceiptItems as mockItems } from '../data/mockData';
import { useUser } from '../hooks/useUser';
import './ClaimItems.css';

export default function ClaimItems() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { userId } = useUser();

  // Convex live data
  const liveItems = useQuery(api.receiptItems.getEventItems, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");
  const participants = useQuery(api.splitEvents.getEventParticipants, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");
  const claimItemMutation = useMutation(api.receiptItems.claimItem);
  const event = useQuery(api.splitEvents.getEvent, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");

  const me = participants?.find((p: any) => p.userId === userId);
  const myShare = me?.calculatedSubtotal || 0;

  const items = liveItems || mockItems;

  const handleClaim = async (itemId: string) => {
    if (userId && eventId && claimItemMutation) {
      await claimItemMutation({
        itemId: itemId as Id<"receiptItems">,
        userId,
        eventId: eventId as Id<"splitEvents">
      });
    }
  };

  const progress = liveItems 
    ? (liveItems.filter((i: any) => i.claims.length > 0).length / liveItems.length) * 100
    : 45;

  return (
    <div className="claim-page animate-fade-in">
      <header className="page-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="title-md">{event?.name || "Claim Items"}</span>
        <button className="icon-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5H17M7 10H17M3 15H17" stroke="#adaaaa" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      <div className="claim-body">
        <div className="claim-summary-card glass-card">
          <div className="claim-summary-info">
            <span className="label-md text-muted">Your Share</span>
            <span className="title-lg text-primary">${myShare > 0 ? myShare.toFixed(2) : "0.00"}</span>
          </div>
          <div className="claim-progress-container">
            <div className="claim-progress-labels">
              <span className="label-sm text-muted">Claimed</span>
              <span className="label-sm text-muted">{Math.round(progress)}%</span>
            </div>
            <div className="claim-progress-bar">
              <div className="claim-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="claim-list">
          {items.map((item: any) => (
            <div 
              key={item._id || item.id} 
              className={`claim-item-card ${item.claims?.some((c: any) => c.user?._id === userId) ? 'claimed-by-me' : ''}`}
              onClick={() => handleClaim(item._id || item.id)}
            >
              <div className="claim-item-info">
                <span className="body-md">{item.name}</span>
                <span className="label-sm text-muted">${item.price.toFixed(2)} x {item.quantity}</span>
              </div>
              <div className="claim-item-right">
                <span className="title-sm">${(item.price * item.quantity).toFixed(2)}</span>
                <div className="claim-avatars">
                  {(item.claims || []).map((c: any) => (
                    <Avatar key={c.claimId} name={c.user?.name || "U"} size={20} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="claim-footer">
        <button className="btn-primary-gradient" onClick={() => navigate(`/confirm/${eventId}`)}>
          Confirm Selections
        </button>
      </div>
    </div>
  );
}
