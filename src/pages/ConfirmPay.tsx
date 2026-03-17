import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { Avatar } from '../components/Avatar';
import { useUser } from '../hooks/useUser';
import './ConfirmPay.css';

export default function ConfirmPay() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { userId } = useUser();

  // Convex live data
  const event = useQuery(api.splitEvents.getEvent, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");
  const participants = useQuery(api.splitEvents.getEventParticipants, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");
  const updateTipMutation = useMutation(api.splitEvents.updateParticipantTip);

  const me = participants?.find(p => p.userId === userId);
  const currentTip = me?.tipPercentage ?? 20;

  const handleTipChange = async (percent: number) => {
    if (userId && eventId && updateTipMutation) {
      await updateTipMutation({
        eventId: eventId as Id<"splitEvents">,
        userId,
        tipPercentage: percent
      });
    }
  };

  const shares = participants?.map((p: any) => ({
    name: p.user?.name || "User",
    amount: p.calculatedTotal || p.totalOwed || 0,
    paid: p.paymentStatus !== "pending"
  })) || [
    { name: 'Maddy', amount: 275, paid: true },
    { name: 'Jessy', amount: 100, paid: true },
    { name: 'Marissa', amount: 350.24, paid: true },
    { name: 'Rogers', amount: 150, paid: false },
  ];

  const totalAmount = event?.totalBill || 875.24;

  return (
    <div className="confirm-page animate-fade-in">
      <header className="page-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="title-md">Confirm Split</span>
        <button className="icon-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="6" r="1.5" fill="#adaaaa"/>
            <circle cx="12" cy="12" r="1.5" fill="#adaaaa"/>
            <circle cx="12" cy="18" r="1.5" fill="#adaaaa"/>
          </svg>
        </button>
      </header>

      <div className="confirm-body">
        <div className="confirm-list">
          {shares.map((share: any, i: number) => (
            <div key={i} className="confirm-participant">
              <Avatar name={share.name} size={44} />
              <div className="confirm-participant-info">
                <span className="title-sm">{share.name}</span>
                <span className="label-sm text-muted">Total share ${share.amount.toFixed(2)}</span>
              </div>
              <div className={`confirm-check ${share.paid ? 'checked' : ''}`}>
                {share.paid && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 8L7 11L12 5" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tip Selector for Current User */}
        <section className="tip-section glass-card">
          <span className="label-md text-muted">Add Your Tip</span>
          <div className="tip-grid">
            {[15, 18, 20, 25].map((percent) => (
              <button
                key={percent}
                className={`tip-btn ${currentTip === percent ? 'active' : ''}`}
                onClick={() => handleTipChange(percent)}
              >
                {percent}%
              </button>
            ))}
          </div>
        </section>

        <div className="confirm-total-card glass-card">
          <div className="confirm-total-row">
            <span className="body-md text-muted">Subtotal</span>
            <span className="body-md">${(event?.subtotal || 812.32).toFixed(2)}</span>
          </div>
          <div className="confirm-total-row">
            <span className="body-md text-muted">Tax</span>
            <span className="body-md">${(event?.taxAmount || 71.08).toFixed(2)}</span>
          </div>
          <div className="confirm-total-row">
            <span className="body-md text-muted">Tip (Group Total)</span>
            <span className="body-md">${(event?.tipAmount || 146.22).toFixed(2)}</span>
          </div>
          <div className="confirm-divider" />
          <div className="confirm-total-row total">
            <span className="title-md">Total</span>
            <span className="headline-sm text-primary">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="confirm-payment-method">
          <span className="label-md text-muted">Payment Method</span>
          <div className="payment-card-row">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="6" width="24" height="16" rx="3" stroke="var(--tertiary)" strokeWidth="1.5"/>
              <line x1="2" y1="11" x2="26" y2="11" stroke="var(--tertiary)" strokeWidth="1.5"/>
              <rect x="5" y="17" width="8" height="2" rx="1" fill="var(--tertiary)" opacity="0.5"/>
            </svg>
            <div>
              <span className="body-md">Visa •••• 4242</span>
              <span className="label-sm text-muted">Default</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 'auto' }}>
              <path d="M6 4L10 8L6 12" stroke="#adaaaa" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="confirm-footer">
        <button className="btn-primary-gradient" onClick={() => navigate(`/receipt/${eventId}`)}>
          Confirm & Pay ${totalAmount.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
