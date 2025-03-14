export interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  category: 'primary' | 'promotional' | 'social' | 'updates' | 'spam';
  read: boolean;
  selected?: boolean;
}

export interface EmailStats {
  primary: number;
  promotional: number;
  social: number;
  updates: number;
  spam: number;
  total: number;
}