import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from "../../convex/_generated/dataModel";
import { useUser } from '../hooks/useUser';
import { useState } from 'react';
import { SquadCard } from '../components/SquadCard';
import './SuccessReceipt.css';

export default function SuccessReceipt() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { userId } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  // Convex live data
  const event = useQuery(api.splitEvents.getEvent, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");
  const participants = useQuery(api.splitEvents.getEventParticipants, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");
  const executeAutoPull = useAction(api.stripe.executeAutoPull);
  const authorizeHolds = useAction(api.stripe.authorizeSquadHolds);

  const isHost = event?.hostId === userId;
  const isSecured = event?.isSecured || false;
  
  const readyParticipants = participants?.filter((p: any) => p.isReadyToPay && p.paymentStatus === "pending") || [];
  const authorizedParticipants = participants?.filter((p: any) => p.paymentStatus === "authorized") || [];
  const pendingParticipants = participants?.filter((p: any) => p.paymentStatus === "pending" || p.paymentStatus === "authorized") || [];
  
  const totalAmount = event?.totalBill || 0;
  const readyAmount = readyParticipants.reduce((sum: number, p: any) => sum + (p.calculatedTotal || 0), 0);
  const authorizedAmount = authorizedParticipants.reduce((sum: number, p: any) => sum + (p.calculatedTotal || 0) , 0);

  const handleSecureTable = async () => {
    if (!eventId) return;
    setIsProcessing(true);
    try {
      await authorizeHolds({ eventId: eventId as Id<"splitEvents"> });
    } catch (e) {
      console.error("Secure Table failed:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoPull = async () => {
    if (!eventId) return;
    setIsProcessing(true);
    try {
      await executeAutoPull({ eventId: eventId as Id<"splitEvents"> });
      // The query will auto-update participants status
    } catch (e) {
      console.error("Auto-pull failed:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="success-page animate-fade-in">
      <div className="success-header">
        <div className="success-icon-circle">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M10 20L17 27L30 13" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="headline-md">Split Complete!</h1>
        <p className="body-md text-muted">You've successfully settled the bill for {event?.name || "Design Tour"}.</p>
      </div>

      <div className="receipt-card-container">
        <div className="receipt-card glass-card">
          <div className="receipt-header">
            <span className="label-md">Total Amount Shared</span>
            <span className="headline-lg text-primary">${totalAmount.toFixed(2)}</span>
          </div>
          
          <div className="receipt-divider-dashed" />
          
          <div className="receipt-details">
            <div className="receipt-row">
              <span className="label-md text-muted">Venue</span>
              <span className="body-md">{event?.venue || "Design Cafe"}</span>
            </div>
            <div className="receipt-row">
              <span className="label-md text-muted">Date</span>
              <span className="body-md">{event?.date || "Mar 16, 2026"}</span>
            </div>
            <div className="receipt-row">
              <span className="label-md text-muted">Split Method</span>
              <span className="body-md" style={{ textTransform: 'capitalize' }}>{event?.splitMethod || "Itemized"}</span>
            </div>
          </div>

          <div className="receipt-divider-dashed" />

          <div className="receipt-id">
            <span className="label-sm text-muted">Transaction ID: {eventId?.substring(0, 8).toUpperCase() || "TXN-78291"}</span>
          </div>
        </div>

        <div className="receipt-actions">
          <button className="receipt-action-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 12V15C15 16.1046 14.1046 17 13 17H7C5.89543 17 5 16.1046 5 15V12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 3V13M10 13L13 10M10 13L7 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="body-md">Download Receipt</span>
          </button>
        </div>

        {isHost && isSecured && authorizedAmount > 0 && (
          <SquadCard 
            eventName={event?.name || "Squad"} 
            emoji={event?.emoji || "🥂"} 
            amount={authorizedAmount} 
            isSecured={true} 
          />
        )}

        {isHost && pendingParticipants.length > 0 && (
          <div className="squad-status-card glass-card animate-slide-up" style={{ marginTop: 'var(--space-6)', padding: 'var(--space-6)' }}>
            <div className="status-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <span className="title-sm">Squad Status</span>
              <span className="label-sm text-primary">
                {isSecured ? `${authorizedParticipants.length} Secured` : `${readyParticipants.length}/${pendingParticipants.length} Ready`}
              </span>
            </div>
            
            <div className="participant-mini-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {participants?.map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="body-sm" style={{ opacity: p.paymentStatus === 'pending' ? 0.6 : 1 }}>{p.user?.name}</span>
                  {p.paymentStatus === 'charged' ? (
                    <span className="label-sm text-primary">Paid</span>
                  ) : p.paymentStatus === 'authorized' ? (
                    <span className="label-sm" style={{ color: '#FFD700' }}>Secured</span>
                  ) : p.isReadyToPay ? (
                    <span className="label-sm" style={{ color: 'var(--primary)', fontWeight: 600 }}>Ready</span>
                  ) : (
                    <span className="label-sm text-muted">Waiting...</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {!isSecured && readyParticipants.length > 0 && (
                <button 
                  className="btn-primary-gradient" 
                  style={{ width: '100%' }}
                  onClick={handleSecureTable}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Securing..." : `Secure Table ($${readyAmount.toFixed(2)})`}
                </button>
              )}

              {isSecured && authorizedParticipants.length > 0 && (
                <button 
                  className="btn-primary-gradient" 
                  style={{ width: '100%' }}
                  onClick={handleAutoPull}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Close & Finalize Billing`}
                </button>
              )}

              {!isSecured && readyParticipants.length === 0 && (
                <p className="label-sm text-muted text-center">Waiting for friends to tap "Ready"...</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="success-footer">
        <button className="btn-primary-gradient" onClick={() => navigate('/home')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
