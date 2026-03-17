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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/10">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': {
                  color: '#a1a1aa',
                },
              },
              invalid: {
                color: '#ef4444',
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full py-4 bg-[#E3FF73] text-black font-bold rounded-2xl disabled:opacity-50 transition-all active:scale-95"
        >
          {processing ? 'Processing...' : mode === 'payment' ? `Pay $${((amount || 0) / 100).toFixed(2)}` : 'Save Card'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-3 text-zinc-400 text-sm font-medium"
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
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-md bg-zinc-950 rounded-t-[32px] sm:rounded-[32px] border border-white/10 p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">
            {mode === 'payment' ? 'Complete Payment' : 'Add Payment Method'}
          </h2>
          <p className="text-zinc-400 text-sm">
            {mode === 'payment' 
              ? 'Secure checkout powered by Stripe' 
              : 'Securely save your card for future splits'}
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
