import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { EmailList } from '../components/EmailList';
import { Mail, CreditCard, Filter, Check } from 'lucide-react';
import { Email } from '../lib/types';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthUrl, setCredentials, deleteEmails, markAsSpam, loadStoredCredentials, fetchEmails, GmailMessage } from '../lib/gmail';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const loadEmails = useCallback(async (token: string) => {
    try {
      const messages = await fetchEmails(token);
      const formattedEmails: Email[] = messages.map((msg: GmailMessage) => {
        const from = msg.payload.headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
        const subject = msg.payload.headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
        
        return {
          id: msg.id,
          from,
          subject,
          preview: msg.snippet,
          date: new Date(parseInt(msg.internalDate)).toISOString(),
          category: msg.labelIds.includes('CATEGORY_PROMOTIONS') ? 'promotional' :
                   msg.labelIds.includes('CATEGORY_SOCIAL') ? 'social' :
                   msg.labelIds.includes('CATEGORY_UPDATES') ? 'updates' :
                   msg.labelIds.includes('SPAM') ? 'spam' : 'primary',
          read: !msg.labelIds.includes('UNREAD'),
        };
      });

      setEmails(formattedEmails);
    } catch (error) {
      console.error('Error loading emails:', error);
      setError('Failed to load emails. Please try again.');
    }
  }, []);

  const initializeGmail = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      
      // Check for OAuth callback
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state');
      
      if (code && state === user.uid) {
        const tokens = await setCredentials(code, user);
        setAccessToken(tokens.access_token);
        setGmailConnected(true);
        await loadEmails(tokens.access_token);
        navigate('/dashboard', { replace: true });
        return;
      }

      // Try to load stored credentials
      const tokens = await loadStoredCredentials(user);
      if (tokens) {
        setAccessToken(tokens.access_token);
        setGmailConnected(true);
        await loadEmails(tokens.access_token);
        return;
      }

      // If no stored credentials, initiate OAuth flow
      const authUrl = await getAuthUrl(user.uid);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Gmail initialization failed:', error);
      setError('Failed to connect to Gmail. Please try again.');
      setGmailConnected(false);
    } finally {
      setLoading(false);
    }
  }, [user, location, navigate, loadEmails]);

  useEffect(() => {
    initializeGmail();
  }, [initializeGmail]);

  const filteredEmails = selectedCategory === 'all'
    ? emails
    : emails.filter(email => email.category === selectedCategory);

  const handleDelete = async (ids: string[]) => {
    if (!accessToken) return;
    
    try {
      setShowPayment(true);
    } catch (error) {
      console.error('Delete operation failed:', error);
      setError('Failed to process delete operation. Please try again.');
    }
  };

  const handleUnsubscribe = async (ids: string[]) => {
    if (!accessToken) return;
    
    try {
      setShowPayment(true);
    } catch (error) {
      console.error('Unsubscribe operation failed:', error);
      setError('Failed to process unsubscribe operation. Please try again.');
    }
  };

  const handleBlock = async (ids: string[]) => {
    if (!accessToken) return;
    
    try {
      setShowPayment(true);
    } catch (error) {
      console.error('Block operation failed:', error);
      setError('Failed to process block operation. Please try again.');
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      // Simulating payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPaymentComplete(true);
      
      // After successful payment, process the email actions
      if (accessToken) {
        await deleteEmails(['example-id'], accessToken);
        setEmails(prevEmails => prevEmails.filter(email => !email.id.includes('example-id')));
      }
    } catch (error) {
      console.error('Payment/email processing failed:', error);
      setError('Failed to process payment or emails. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MailSweep</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Categories</h2>
            <div className="grid grid-cols-5 gap-4">
              {['all', 'primary', 'promotional', 'social', 'updates'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-4 rounded-lg border ${
                    selectedCategory === category
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-semibold">
                    {emails.filter(e => category === 'all' ? true : e.category === category).length}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">{category}</div>
                </button>
              ))}
            </div>
          </div>

          <EmailList
            emails={filteredEmails}
            onDelete={handleDelete}
            onUnsubscribe={handleUnsubscribe}
            onBlock={handleBlock}
          />

          {showPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg max-w-md w-full">
                {!paymentComplete ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Ready to Clean
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      We're ready to process your request for {filteredEmails.length} emails.
                      Complete the payment to proceed.
                    </p>
                    <Button
                      className="w-full"
                      onClick={handlePayment}
                      disabled={processing}
                    >
                      {processing ? (
                        'Processing...'
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay $3 to Continue
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Payment Successful
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your emails are being processed. This may take a few minutes.
                      </p>
                    </div>
                  </>
                )}
                <button
                  className="mt-4 text-sm text-gray-600 hover:text-gray-900 w-full"
                  onClick={() => {
                    setShowPayment(false);
                    setPaymentComplete(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}