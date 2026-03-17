import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { Avatar } from '../components/Avatar';
import { useUser } from '../hooks/useUser';
import { PaymentModal } from '../components/PaymentModal';
import './ConfirmPay.css';

export default function ConfirmPay() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { userId } = useUser();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Convex live data
  const event = useQuery(api.splitEvents.getEvent, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");
  const participants = useQuery(api.splitEvents.getEventParticipants, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");
  const updateTipMutation = useMutation(api.splitEvents.updateParticipantTip);

  const me = participants?.find((p: any) => p.userId === userId);
  const currentTip = me?.tipPercentage ?? 20;
  const myOwedAmount = me?.calculatedTotal || me?.totalOwed || 0;
  const myPaymentStatus = me?.paymentStatus || 'pending';

  const handleTipChange = async (percent: number) => {
    if (userId && eventId && updateTipMutation) {
      await updateTipMutation({
        eventId: eventId as Id<"splitEvents">,
        userId,
        tipPercentage: percent
      });
    }
  };

  const handlePaymentSuccess = () => {
    // In a real app, you'd update the database here via mutation
    // For now, we'll navigate to the receipt as the "success" state
    navigate(`/receipt/${eventId}`);
  };

  const shares = participants?.map((p: any) => ({
    name: p.user?.name || "User",
    amount: p.calculatedTotal || p.totalOwed || 0,
    paid: p.paymentStatus !== "pending"
  })) || [];

  const totalAmount = event?.totalBill || 0;

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
            <span className="body-md">${(event?.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="confirm-total-row">
            <span className="body-md text-muted">Tax</span>
            <span className="body-md">${(event?.taxAmount || 0).toFixed(2)}</span>
          </div>
          <div className="confirm-total-row">
            <span className="body-md text-muted">Tip (Group Total)</span>
            <span className="body-md">${(event?.tipAmount || 0).toFixed(2)}</span>
          </div>
          <div className="confirm-divider" />
          <div className="confirm-total-row total">
            <span className="title-md">Total Bill</span>
            <span className="headline-sm text-primary">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="confirm-payment-method">
          <span className="label-md text-muted">Your Share to Pay</span>
          <div className="payment-card-row">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="6" width="24" height="16" rx="3" stroke="var(--tertiary)" strokeWidth="1.5"/>
              <line x1="2" y1="11" x2="26" y2="11" stroke="var(--tertiary)" strokeWidth="1.5"/>
              <rect x="5" y="17" width="8" height="2" rx="1" fill="var(--tertiary)" opacity="0.5"/>
            </svg>
            <div>
              <span className="body-md">Your Total</span>
              <span className="label-sm text-muted">{myPaymentStatus === 'pending' ? 'Unpaid' : 'Paid'}</span>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
               <span className="title-md text-primary">${myOwedAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="confirm-footer">
        {myPaymentStatus === 'pending' ? (
          <button className="btn-primary-gradient" onClick={() => setIsPaymentModalOpen(true)}>
            Confirm & Pay ${myOwedAmount.toFixed(2)}
          </button>
        ) : (
          <button className="btn-primary-gradient" onClick={() => navigate(`/receipt/${eventId}`)}>
            View Receipt
          </button>
        )}
      </div>

      {userId && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          userId={userId}
          mode="payment"
          amount={Math.round(myOwedAmount * 100)} // Convert to cents
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
