import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Avatar } from '../components/Avatar';
import { friends as mockFriends } from '../data/mockData';
import { useUser } from '../hooks/useUser';
import './Friends.css';

export default function Friends() {
  const navigate = useNavigate();
  const { userId } = useUser();
  const liveFriends = useQuery(api.friends.getUserFriends, userId ? { userId } : "skip");

  const friends = liveFriends || mockFriends;

  return (
    <div className="friends-page animate-fade-in">
      <header className="page-header">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="title-md">Friends</span>
        <button className="icon-btn">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M16 16V18M11 16V18M6 16V18" stroke="#adaaaa" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="11" cy="8" r="4" stroke="#adaaaa" strokeWidth="1.5"/>
          </svg>
        </button>
      </header>

      <div className="friends-body">
        {/* Search */}
        <div className="search-bar">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="6" stroke="#adaaaa" strokeWidth="1.5"/>
            <line x1="13" y1="13" x2="16" y2="16" stroke="#adaaaa" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input type="text" placeholder="Search friends..." className="body-md" />
        </div>

        {/* Top Friends Carousel */}
        <section className="friends-section">
          <span className="label-md text-muted">My Friends</span>
          <div className="friends-carousel">
            {friends.slice(0, 5).map((friend: any) => (
              <div key={friend._id || friend.id} className="friend-circle-item">
                <Avatar name={friend.name} size={64} />
                <span className="label-sm">{friend.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* All Friends List */}
        <section className="friends-section">
          <div className="section-header">
            <span className="label-md text-muted">All Friends</span>
            <span className="label-md text-primary">{friends.length}</span>
          </div>
          <div className="friends-list">
            {friends.map((friend: any) => (
              <div key={friend._id || friend.id} className="friend-list-item">
                <Avatar name={friend.name} size={48} />
                <div className="friend-info">
                  <span className="body-md">{friend.name}</span>
                  <span className="label-sm text-muted">{friend.handle || "@friend"}</span>
                </div>
                <div className="friend-actions">
                  <button className="icon-btn-circle">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 5L8 10L13 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
