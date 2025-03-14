import { useState } from 'react';
import { Mail, Trash2, Ban, X } from 'lucide-react';
import { Email } from '../lib/types';
import { Button } from './Button';

interface EmailListProps {
  emails: Email[];
  onDelete: (ids: string[]) => void;
  onUnsubscribe: (ids: string[]) => void;
  onBlock: (ids: string[]) => void;
}

export function EmailList({ emails, onDelete, onUnsubscribe, onBlock }: EmailListProps) {
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmails = emails.filter(email => 
    email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedEmails.size === filteredEmails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filteredEmails.map(e => e.id)));
    }
  };

  const toggleEmail = (id: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEmails(newSelected);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search emails..."
          className="flex-1 px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(Array.from(selectedEmails))}
          disabled={selectedEmails.size === 0}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUnsubscribe(Array.from(selectedEmails))}
          disabled={selectedEmails.size === 0}
        >
          <X className="w-4 h-4 mr-2" />
          Unsubscribe
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBlock(Array.from(selectedEmails))}
          disabled={selectedEmails.size === 0}
        >
          <Ban className="w-4 h-4 mr-2" />
          Block
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b px-6 py-4 flex items-center">
          <input
            type="checkbox"
            checked={selectedEmails.size === filteredEmails.length}
            onChange={toggleSelectAll}
            className="mr-4"
          />
          <span className="text-sm text-gray-600">
            {selectedEmails.size} selected
          </span>
        </div>

        <div className="divide-y">
          {filteredEmails.map((email) => (
            <div
              key={email.id}
              className={`px-6 py-4 flex items-center ${
                email.read ? 'bg-gray-50' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedEmails.has(email.id)}
                onChange={() => toggleEmail(email.id)}
                className="mr-4"
              />
              <Mail className="w-5 h-5 text-gray-400 mr-4" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{email.from}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(email.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{email.subject}</div>
                <div className="text-sm text-gray-500 truncate">
                  {email.preview}
                </div>
              </div>
              <span className="ml-4 text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                {email.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}