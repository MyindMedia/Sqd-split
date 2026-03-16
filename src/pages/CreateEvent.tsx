import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Avatar } from '../components/Avatar';
import { friends as mockFriends } from '../data/mockData';
import { useUser } from '../hooks/useUser';
import './CreateEvent.css';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { userId } = useUser();
  const liveFriends = useQuery(api.friends.getUserFriends, userId ? { userId } : "skip");
  const createEventMutation = useMutation(api.splitEvents.createEvent);

  const friends = liveFriends || mockFriends;

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date] = useState('Today');
  const [time] = useState('7:30 PM');
  const [splitMethod, setSplitMethod] = useState<'even' | 'itemized'>('even');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const toggleFriend = (id: string) => {
    setSelectedFriends(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      // Create event in Convex
      if (userId && createEventMutation) {
        const { eventId } = await createEventMutation({
          name,
          emoji: '🍽️',
          hostId: userId,
          venue: location,
          date: `${date} ${time}`,
          splitMethod,
        });

        // In a full implementation, we'd also call mutations to add the selected friends
        // but for now, we navigate to the invite screen for that event
        navigate(`/invite/${eventId}`);
      } else {
        // Fallback for mock/dev
        navigate('/invite');
      }
    } catch (err) {
      console.error("Failed to create split:", err);
      // Fallback
      navigate('/invite');
    }
  };

  return (
    <div className="create-page animate-fade-in">
      <header className="page-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="title-md">New Split</span>
        <button className="icon-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="6" r="1.5" fill="#adaaaa"/>
            <circle cx="12" cy="12" r="1.5" fill="#adaaaa"/>
            <circle cx="12" cy="18" r="1.5" fill="#adaaaa"/>
          </svg>
        </button>
      </header>

      <div className="create-body">
        {/* Event Name */}
        <div className="create-field">
          <label className="label-md text-muted">Event Name</label>
          <input
            type="text"
            placeholder="Sarah's Birthday Dinner"
            className="create-input body-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="create-field">
          <label className="label-md text-muted">Location</label>
          <div className="create-input-row">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5C5.96 1.5 3.5 3.96 3.5 7C3.5 11.375 9 16.5 9 16.5C9 16.5 14.5 11.375 14.5 7C14.5 3.96 12.04 1.5 9 1.5Z" stroke="#adaaaa" strokeWidth="1.2"/>
              <circle cx="9" cy="7" r="2" stroke="#adaaaa" strokeWidth="1.2"/>
            </svg>
            <input
              type="text"
              placeholder="Restaurant or venue name"
              className="body-md"
              style={{ flex: 1 }}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="create-field">
          <label className="label-md text-muted">Date & Time</label>
          <div className="create-input-row">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="3" width="14" height="13" rx="2" stroke="#adaaaa" strokeWidth="1.2"/>
              <line x1="2" y1="7" x2="16" y2="7" stroke="#adaaaa" strokeWidth="1.2"/>
              <line x1="6" y1="1.5" x2="6" y2="4.5" stroke="#adaaaa" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="12" y1="1.5" x2="12" y2="4.5" stroke="#adaaaa" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="body-md text-muted">{date} — {time}</span>
          </div>
        </div>

        {/* Add Participants */}
        <div className="create-field" style={{ overflow: 'visible' }}>
          <label className="label-md text-muted">Add Participants</label>
          <div className="participants-row">
            {friends.slice(0, 4).map((friend: any) => (
              <div 
                key={friend._id || friend.id} 
                onClick={() => toggleFriend(friend._id || friend.id)}
                className={selectedFriends.includes(friend._id || friend.id) ? 'selected' : ''}
              >
                <Avatar name={friend.name} size={44} />
              </div>
            ))}
            <button className="add-participant-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="10" y1="4" x2="10" y2="16" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="4" y1="10" x2="16" y2="10" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <span className="label-sm text-muted" style={{ marginTop: 'var(--space-2)' }}>{selectedFriends.length} people added</span>
        </div>

        {/* Split Method */}
        <div className="create-field">
          <label className="label-md text-muted">Split Method</label>
          <div className="split-method-row">
            <button 
              className={`method-card ${splitMethod === 'even' ? 'active' : ''}`}
              onClick={() => setSplitMethod('even')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <line x1="4" y1="12" x2="20" y2="12" stroke={splitMethod === 'even' ? 'var(--primary)' : 'var(--on-surface-variant)'} strokeWidth="2" strokeLinecap="round"/>
                <line x1="4" y1="8" x2="20" y2="8" stroke={splitMethod === 'even' ? 'var(--primary)' : 'var(--on-surface-variant)'} strokeWidth="2" strokeLinecap="round"/>
                <line x1="4" y1="16" x2="20" y2="16" stroke={splitMethod === 'even' ? 'var(--primary)' : 'var(--on-surface-variant)'} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className={`label-md ${splitMethod === 'even' ? '' : 'text-muted'}`}>Even Split</span>
            </button>
            <button 
              className={`method-card ${splitMethod === 'itemized' ? 'active' : ''}`}
              onClick={() => setSplitMethod('itemized')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke={splitMethod === 'itemized' ? 'var(--primary)' : 'var(--on-surface-variant)'} strokeWidth="1.5"/>
                <line x1="7" y1="8" x2="17" y2="8" stroke={splitMethod === 'itemized' ? 'var(--primary)' : 'var(--on-surface-variant)'} strokeWidth="1.2"/>
                <line x1="7" y1="12" x2="17" y2="12" stroke={splitMethod === 'itemized' ? 'var(--primary)' : 'var(--on-surface-variant)'} strokeWidth="1.2"/>
                <line x1="7" y1="16" x2="13" y2="16" stroke={splitMethod === 'itemized' ? 'var(--primary)' : 'var(--on-surface-variant)'} strokeWidth="1.2"/>
              </svg>
              <span className={`label-md ${splitMethod === 'itemized' ? '' : 'text-muted'}`}>Itemized</span>
            </button>
          </div>
        </div>
      </div>

      <div className="create-footer">
        <button className="btn-primary-gradient" onClick={handleSubmit}>
          Create Split
        </button>
      </div>
    </div>
  );
}
