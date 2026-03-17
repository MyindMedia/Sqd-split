import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import './PaymentModal.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  mode: 'payment' | 'setup';
  amount?: number; // In cents, for payment mode
  onSuccess: (paymentMethodId?: string) => void;
}

const CheckoutForm: React.FC<{
  mode: 'payment' | 'setup';
  amount?: number;
  userId: any;
  onSuccess: (paymentMethodId?: string) => void;
  onCancel: () => void;
}> = ({ mode, amount, userId, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const createPaymentIntent = useAction(api.stripe.createPaymentIntent);
  const createSetupIntent = useAction(api.stripe.createSetupIntent);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      if (mode === 'payment' && amount) {
        // 1. Create PaymentIntent on server
        const { clientSecret } = await createPaymentIntent({
          amount,
          currency: 'usd',
          userId,
        });

        if (!clientSecret) throw new Error("Failed to create payment intent");

        // 2. Confirm payment on client
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        });

        if (result.error) {
          setError(result.error.message ?? "Payment failed");
        } else {
          if (result.paymentIntent.status === 'succeeded') {
            onSuccess(result.paymentIntent.payment_method as string);
          }
        }
      } else {
        // Setup Mode (Saving a card)
        const { clientSecret } = await createSetupIntent({ userId });
        
        if (!clientSecret) throw new Error("Failed to create setup intent");

        const result = await stripe.confirmCardSetup(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        });

        if (result.error) {
          setError(result.error.message ?? "Setup failed");
        } else {
          if (result.setupIntent.status === 'succeeded') {
            onSuccess(result.setupIntent.payment_method as string);
          }
        }
      }
    } catch (e: any) {
      setError(e.message ?? "An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-actions">
      <div className="stripe-element-container">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                color: '#ffffff',
                '::placeholder': {
                  color: '#adaaaa',
                },
              },
              invalid: {
                color: '#ff7351',
              },
            },
          }}
        />
      </div>

      <div className="test-card-helper">
        <div className="flex flex-col">
          <span className="label-sm text-muted">Test Card</span>
          <span className="body-md font-mono">4242 4242 4242 4242</span>
        </div>
        <button 
          type="button"
          className="copy-badge"
          onClick={() => {
            navigator.clipboard.writeText('4242424242424242');
            alert('Test Card Copied!');
          }}
        >
          Copy
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="confirm-btn"
        >
          {processing ? 'Processing...' : mode === 'payment' ? `Pay $${((amount || 0) / 100).toFixed(2)}` : 'Save Card'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="cancel-btn"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  userId,
  mode,
  amount,
  onSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="payment-modal-container">
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'payment' ? 'Complete Payment' : 'Add Card'}
          </h2>
          <p className="modal-subtitle">
            {mode === 'payment' 
              ? 'Secure checkout via Stripe' 
              : 'Securely save your card'}
          </p>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm 
            mode={mode} 
            amount={amount} 
            userId={userId} 
            onSuccess={(id) => {
              onSuccess(id);
              onClose();
            }} 
            onCancel={onClose}
          />
        </Elements>
      </div>
    </div>
  );
};
