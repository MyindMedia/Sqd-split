import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { useUser } from '../hooks/useUser';
import { Avatar } from '../components/Avatar';
import './JoinSquad.css';

export default function JoinSquad() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { userId, user } = useUser();
  const [status, setStatus] = useState<'joining' | 'success' | 'error'>('joining');

  const joinMutation = useMutation(api.splitEvents.joinEvent);
  const event = useQuery(api.splitEvents.getEvent, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");

  useEffect(() => {
    const performJoin = async () => {
      if (userId && eventId && status === 'joining') {
        try {
          await joinMutation({
            eventId: eventId as Id<"splitEvents">,
            userId: userId as Id<"users">,
          });
          setStatus('success');
          // Auto-navigate to claim items after a brief delay
          setTimeout(() => {
            navigate(`/claim/${eventId}`);
          }, 2000);
        } catch (err) {
          console.error("Failed to join squad:", err);
          setStatus('error');
        }
      }
    };

    performJoin();
  }, [userId, eventId, joinMutation, navigate, status]);

  if (!event) {
    return (
      <div className="join-page animate-fade-in">
        <p className="text-muted">Finding Squad...</p>
      </div>
    );
  }

  return (
    <div className="join-page animate-fade-in">
      <div className="join-glow" />
      
      <div className="join-content">
        <div className="join-event-info">
          <div className="join-icon-circle">
            <span>{event.emoji}</span>
          </div>
          <h1 className="headline-md">Sourcing Squad</h1>
          <p className="body-md text-muted">You're joining <span className="text-primary">{event.name}</span></p>
        </div>

        <div className="join-status-area">
          {status === 'joining' && (
            <div className="join-loading">
              <div className="spinner" />
              <p className="label-md">Entry in progress...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="join-success animate-slide-up">
              <div className="success-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M6 16L13 23L26 9" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="title-lg">You're In!</h2>
              <p className="body-sm text-muted">Redirecting to claims...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="join-error animate-slide-up">
              <p className="text-error">Something went wrong. Try again?</p>
              <button className="btn-primary-gradient" onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}
        </div>

        <div className="join-user-preview">
          <Avatar name={user?.name || "User"} size={64} />
          <span className="label-md text-muted">{user?.name}</span>
        </div>
      </div>
    </div>
  );
}
