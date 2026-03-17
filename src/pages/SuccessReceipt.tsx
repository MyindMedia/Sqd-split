import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from "../../convex/_generated/dataModel";
import './SuccessReceipt.css';

export default function SuccessReceipt() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // Convex live data
  const event = useQuery(api.splitEvents.getEvent, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");

  const totalAmount = event?.totalBill || 875.24;

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
      </div>

      <div className="success-footer">
        <button className="btn-primary-gradient" onClick={() => navigate('/home')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
