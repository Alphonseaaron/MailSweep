import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { EmailList } from '../components/EmailList';
import { Mail, CreditCard, Filter, Check } from 'lucide-react';
import { mockEmails, mockStats } from '../lib/mockData';
import { Email } from '../lib/types';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthUrl, setCredentials, deleteEmails, markAsSpam, loadStoredCredentials } from '../lib/gmail';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const initializeGmail = useCallback(async () => {
    if (!user) return;

    try {
      // Try to load stored credentials
      const hasStoredCredentials = await loadStoredCredentials(user.uid);
      if (hasStoredCredentials) {
        setGmailConnected(true);
        return;
      }

      // Check for OAuth callback
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      
      if (code) {
        await setCredentials(code, user.uid);
        setGmailConnected(true);
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Gmail initialization failed:', error);
      setError('Failed to connect to Gmail. Please try again.');
      setGmailConnected(false);
    }
  }, [user, location, navigate]);

  useEffect(() => {
    initializeGmail();
  }, [initializeGmail]);

  const filteredEmails = selectedCategory === 'all'
    ? emails
    : emails.filter(email => email.category === selectedCategory);

  const handleGmailConnect = async () => {
    try {
      setError(null);
      const authUrl = await getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      setError('Failed to initiate Gmail connection. Please try again.');
    }
  };

  const handleDelete = async (ids: string[]) => {
    try {
      if (!gmailConnected) {
        await handleGmailConnect();
        return;
      }
      setShowPayment(true);
    } catch (error) {
      console.error('Delete operation failed:', error);
      setError('Failed to process delete operation. Please try again.');
    }
  };

  const handleUnsubscribe = async (ids: string[]) => {
    try {
      if (!gmailConnected) {
        await handleGmailConnect();
        return;
      }
      setShowPayment(true);
    } catch (error) {
      console.error('Unsubscribe operation failed:', error);
      setError('Failed to process unsubscribe operation. Please try again.');
    }
  };

  const handleBlock = async (ids: string[]) => {
    try {
      if (!gmailConnected) {
        await handleGmailConnect();
        return;
      }
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
      await deleteEmails(['example-id']); // In real app, use actual email IDs
      setEmails(prevEmails => prevEmails.filter(email => !email.id.includes('example-id')));
    } catch (error) {
      console.error('Payment/email processing failed:', error);
      setError('Failed to process payment or emails. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

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
              {!gmailConnected && (
                <Button variant="outline" size="sm" onClick={handleGmailConnect}>
                  Connect Gmail
                </Button>
              )}
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
              {Object.entries(mockStats).map(([category, count]) => (
                category !== 'total' && (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`p-4 rounded-lg border ${
                      selectedCategory === category
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-lg font-semibold">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{category}</div>
                  </button>
                )
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
                      We're ready to process your request for {mockStats.total} emails.
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