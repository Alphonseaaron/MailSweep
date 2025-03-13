import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Trash2, Ban, Mail, CreditCard } from 'lucide-react';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [emailCount, setEmailCount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);

  const handleScan = () => {
    setScanning(true);
    // Simulate scanning emails
    setTimeout(() => {
      setEmailCount(1234);
      setScanning(false);
      setShowPayment(true);
    }, 2000);
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
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-600">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Cleanup Options</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="border rounded-lg p-4">
                <Trash2 className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="text-lg font-medium">Delete All Emails</h3>
                <p className="text-gray-600 mb-4">Remove all unwanted emails from your inbox</p>
                <Button onClick={handleScan} disabled={scanning}>
                  {scanning ? 'Scanning...' : 'Start Scan'}
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <Mail className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="text-lg font-medium">Unsubscribe</h3>
                <p className="text-gray-600 mb-4">Unsubscribe from unwanted newsletters</p>
                <Button variant="outline">Manage Subscriptions</Button>
              </div>

              <div className="border rounded-lg p-4">
                <Ban className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="text-lg font-medium">Block Senders</h3>
                <p className="text-gray-600 mb-4">Block specific email addresses</p>
                <Button variant="outline">Manage Blocks</Button>
              </div>
            </div>

            {showPayment && (
              <div className="mt-8 border-t pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900">Ready to Clean</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    We found {emailCount} emails to clean up. Complete the payment to proceed.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => console.log('Process payment')}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay $3 to Continue
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}