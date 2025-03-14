import { Email, EmailStats } from './types';

// Generate random mock emails
const categories = ['primary', 'promotional', 'social', 'updates', 'spam'] as const;
const companies = ['Amazon', 'Netflix', 'Facebook', 'Twitter', 'LinkedIn', 'Google', 'Apple', 'Microsoft'];
const subjects = [
  'Your order has shipped!',
  'Weekly Newsletter',
  'Security Alert',
  'New Message',
  'Account Update',
  'Special Offer',
  'Payment Received',
  'Friend Request'
];

function generateMockEmails(count: number): Email[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `email-${i}`,
    from: `${companies[Math.floor(Math.random() * companies.length)]}@example.com`,
    subject: subjects[Math.floor(Math.random() * subjects.length)],
    preview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: categories[Math.floor(Math.random() * categories.length)],
    read: Math.random() > 0.5,
  }));
}

export const mockEmails = generateMockEmails(100);

export const mockStats: EmailStats = {
  primary: mockEmails.filter(e => e.category === 'primary').length,
  promotional: mockEmails.filter(e => e.category === 'promotional').length,
  social: mockEmails.filter(e => e.category === 'social').length,
  updates: mockEmails.filter(e => e.category === 'updates').length,
  spam: mockEmails.filter(e => e.category === 'spam').length,
  total: mockEmails.length,
};