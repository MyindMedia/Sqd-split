// Mock data for the Splits app

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  location?: string;
}

export interface SplitEvent {
  id: string;
  name: string;
  emoji: string;
  date: string;
  totalBill: number;
  myShare: number;
  participants: Friend[];
  status: 'settled' | 'pending' | 'owe';
}

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  claimedBy: string[];
}

// Avatar colors for generating placeholder avatars
export const AVATAR_COLORS = [
  '#E3FF73', '#B4A2FF', '#82B1FF', '#FF7351', '#FFD54F',
  '#69F0AE', '#FF80AB', '#80DEEA', '#CE93D8', '#FFAB40',
];

export const friends: Friend[] = [
  { id: '1', name: 'Marissa', avatar: '', location: 'San Francisco, CA' },
  { id: '2', name: 'Rogers', avatar: '', location: 'Oakland, CA' },
  { id: '3', name: 'Jessy', avatar: '', location: 'Los Angeles, CA' },
  { id: '4', name: 'Maddy', avatar: '', location: 'Berkeley, California' },
  { id: '5', name: 'Hope Young', avatar: '', location: 'Provo, Utah' },
  { id: '6', name: 'Ben Reid', avatar: '', location: 'Berkeley, California' },
  { id: '7', name: 'Alex Kim', avatar: '', location: 'Seattle, WA' },
  { id: '8', name: 'Taylor M.', avatar: '', location: 'Austin, TX' },
];

export const recentSplits: SplitEvent[] = [
  {
    id: '1',
    name: 'Team Dinner',
    emoji: '🍕',
    date: 'Mar 14, 2026',
    totalBill: 360,
    myShare: 87.50,
    participants: friends.slice(0, 4),
    status: 'settled',
  },
  {
    id: '2',
    name: 'Design Tour',
    emoji: '🎨',
    date: 'Mar 12, 2026',
    totalBill: 875.24,
    myShare: 218.81,
    participants: friends.slice(1, 5),
    status: 'pending',
  },
  {
    id: '3',
    name: 'Birthday Bash',
    emoji: '🎂',
    date: 'Mar 10, 2026',
    totalBill: 1240,
    myShare: 155,
    participants: friends.slice(0, 6),
    status: 'owe',
  },
  {
    id: '4',
    name: 'Coffee Run',
    emoji: '☕',
    date: 'Mar 8, 2026',
    totalBill: 48.50,
    myShare: 12.13,
    participants: friends.slice(2, 5),
    status: 'settled',
  },
  {
    id: '5',
    name: 'Game Night',
    emoji: '🎮',
    date: 'Mar 5, 2026',
    totalBill: 220,
    myShare: 55,
    participants: friends.slice(0, 4),
    status: 'settled',
  },
];

export const sampleReceiptItems: ReceiptItem[] = [
  { id: '1', name: 'Margherita Pizza', price: 18.99, quantity: 1, claimedBy: ['1'] },
  { id: '2', name: 'Caesar Salad', price: 14.50, quantity: 1, claimedBy: ['2'] },
  { id: '3', name: 'Pasta Carbonara', price: 22.00, quantity: 1, claimedBy: ['3'] },
  { id: '4', name: 'Grilled Salmon', price: 28.50, quantity: 1, claimedBy: ['4'] },
  { id: '5', name: 'Shared Appetizer Plate', price: 24.00, quantity: 1, claimedBy: ['1', '2', '3', '4'] },
  { id: '6', name: 'Craft Beer (x4)', price: 36.00, quantity: 4, claimedBy: ['1', '2', '3', '4'] },
  { id: '7', name: 'Tiramisu', price: 12.00, quantity: 1, claimedBy: ['1', '3'] },
  { id: '8', name: 'Espresso', price: 6.00, quantity: 2, claimedBy: ['2', '4'] },
];

export const userProfile = {
  name: 'Lawrence B.',
  handle: '@thamyind',
  memberSince: 'Mar 2026',
  totalSplits: 24,
  friendCount: 12,
  totalSplitAmount: 2400,
  paymentMethods: [
    { id: '1', type: 'visa', last4: '4242', isDefault: true },
  ],
  preferences: {
    notifications: true,
    defaultTip: 20,
    splitMethod: 'even' as const,
  },
};
