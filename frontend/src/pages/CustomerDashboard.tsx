import DashboardLayout from '../layouts/DashboardLayout';
import { Wallet, CreditCard, CheckCircle2, Clock, Check, X, ArrowUpRight, ArrowDownRight, IndianRupee, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { AxiosError } from 'axios';

export default function CustomerDashboard() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    totalCreditTaken: 0,
    totalPaymentsMade: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  // UPI Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentVendor, setPaymentVendor] = useState<any | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [pendingRes, analyticsRes] = await Promise.all([
        api.get('/transactions/pending'),
        api.get('/analytics/customer')
      ]);
      
      setPendingRequests(pendingRes.data);
      setStats({
        totalOutstanding: analyticsRes.data.stats.totalOutstanding || 0,
        totalCreditTaken: analyticsRes.data.stats.totalCreditTaken || 0,
        totalPaymentsMade: analyticsRes.data.stats.totalPaymentsMade || 0
      });
      setRecentTransactions(analyticsRes.data.recentTransactions || []);

      // If they have outstanding debt, auto-select the first vendor from recent transactions for demo purposes
      if (analyticsRes.data.recentTransactions && analyticsRes.data.recentTransactions.length > 0) {
        setPaymentVendor(analyticsRes.data.recentTransactions[0].vendorId);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await api.put(`/transactions/${id}/status`, { status: action });
      if (action === 'approved') {
        alert('Transaction Approved! It has been officially added to your Khata.');
      } else {
        alert('Transaction Rejected. It will not be added to your balance.');
      }
      // Refresh all data
      fetchDashboardData();
    } catch (err) {
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || 'Failed to update transaction status');
      }
    }
  };

  const handleSendPaymentDemo = async () => {
    if (!paymentAmount || !paymentVendor) return;
    
    try {
      // Send the payment to the backend to update balances
      await api.post('/transactions/pay', {
        vendorId: paymentVendor._id,
        amount: Number(paymentAmount),
        notes: 'UPI Demo Payment'
      });
      
      alert(`Simulated Payment of ₹${paymentAmount} successful! Balances have been updated.`);
      setIsPayModalOpen(false);
      setPaymentAmount('');
      // Refresh the dashboard data immediately
      fetchDashboardData();
    } catch(err) {
      console.error(err);
      alert('Failed to simulate payment');
    }
  };

  const METRIC_CARDS = [
    { title: 'Total Outstanding Balance', value: `₹${stats.totalOutstanding.toLocaleString()}`, icon: AlertCircleCustom, color: 'text-warning', bg: 'bg-yellow-100' },
    { title: 'Total Credit Taken', value: `₹${stats.totalCreditTaken.toLocaleString()}`, icon: CreditCard, color: 'text-danger', bg: 'bg-red-100' },
    { title: 'Total Amount Paid', value: `₹${stats.totalPaymentsMade.toLocaleString()}`, icon: Wallet, color: 'text-success', bg: 'bg-green-100' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">My Dashboard</h1>
          <p className="text-secondary-500">Track your pending requests and khata balances.</p>
        </div>
        {stats.totalOutstanding > 0 && (
          <button 
            onClick={() => setIsPayModalOpen(true)}
            className="btn btn-primary px-6 py-2.5 flex items-center gap-2 shadow-sm"
          >
            <QrCode className="w-5 h-5" /> Settle Dues
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-secondary-500 animate-pulse">Loading dashboard...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {METRIC_CARDS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="card p-6 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <h3 className="text-secondary-500 text-sm font-medium">{stat.title}</h3>
                      <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Govt e-Mandate Section */}
          <div className="card p-6 mb-8 border-l-4 border-l-primary-500 bg-gradient-to-r from-primary-50 to-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-100 rounded-full text-primary-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-secondary-900 flex items-center gap-2">
                  Govt e-Mandate Active 
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full border border-green-200">VERIFIED</span>
                </h3>
                <p className="text-sm text-secondary-600 mt-1 mb-2">
                  Your PAN Card is linked for automatic EMI deductions. In case of failure to settle dues, legal auto-deduction is authorized.
                </p>
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded border text-sm font-mono text-secondary-800 shadow-sm">
                  PAN: {JSON.parse(localStorage.getItem('lendtrack_user') || '{}').panCard || 'XXXXX1234X'}
                </div>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-secondary-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" /> 
              Pending Approvals
              {pendingRequests.length > 0 && (
                <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </h2>

            {pendingRequests.length === 0 ? (
              <div className="card p-8 text-center flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-success mb-3" />
                <h3 className="text-secondary-900 font-semibold mb-1">All Caught Up!</h3>
                <p className="text-secondary-500 text-sm">You have no pending credit requests to approve.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRequests.map((req) => (
                  <div key={req._id} className="card p-5 border-l-4 border-l-warning">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-secondary-900">{req.vendorId?.name}</h4>
                      <span className="text-xs text-secondary-500 capitalize">{req.type}</span>
                    </div>
                    <p className="text-2xl font-bold text-secondary-900 mb-1">₹{req.amount}</p>
                    {req.notes && (
                      <p className="text-sm text-secondary-500 mb-4 italic">"{req.notes}"</p>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => handleAction(req._id, 'approved')}
                        className="flex-1 btn bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                      >
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </button>
                      <button 
                        onClick={() => handleAction(req._id, 'rejected')}
                        className="flex-1 btn bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary-200 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-secondary-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary-50 border-b border-secondary-200">
                    <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200 bg-white">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-secondary-500">
                        No approved transactions yet.
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((trx: any) => (
                      <tr key={trx._id} className="hover:bg-secondary-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-secondary-500">
                          {trx._id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                          {trx.vendorId?.name || 'Unknown Vendor'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {trx.type === 'credit' ? (
                            <span className="flex items-center gap-1 text-danger"><ArrowDownRight className="w-4 h-4"/> Credit Taken</span>
                          ) : (
                            <span className="flex items-center gap-1 text-success"><ArrowUpRight className="w-4 h-4"/> Payment Made</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary-900">
                          ₹{trx.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {new Date(trx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                          {trx.dueDate ? new Date(trx.dueDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* UPI Demo Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-secondary-900/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm p-6 relative flex flex-col items-center">
            <button 
              onClick={() => setIsPayModalOpen(false)}
              className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-900"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-secondary-900 mb-1">Settle Your Dues</h2>
            <p className="text-sm text-secondary-500 mb-6 text-center">Scan this code with any UPI app to pay your outstanding balance.</p>

            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-secondary-700 mb-1">Amount to Pay (₹)</label>
              <input 
                type="number" 
                className="input px-4 py-2 border w-full text-center text-lg font-bold"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="e.g. 500"
              />
            </div>

            {paymentAmount && Number(paymentAmount) > 0 ? (
              <div className="border p-2 rounded-xl bg-white mb-6">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=demo@upi&pn=Vendor&am=${paymentAmount}&cu=INR`} 
                  alt="UPI QR Code" 
                  className="w-[200px] h-[200px]"
                />
              </div>
            ) : (
              <div className="w-[200px] h-[200px] bg-secondary-100 border border-secondary-200 rounded-xl mb-6 flex items-center justify-center text-secondary-400 text-sm">
                Enter amount to generate QR
              </div>
            )}

            <button 
              onClick={handleSendPaymentDemo}
              disabled={!paymentAmount || Number(paymentAmount) <= 0}
              className="btn btn-primary w-full py-3"
            >
              Simulate Successful Payment
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// Just a quick wrapper for the AlertCircle icon since it wasn't strictly imported earlier
function AlertCircleCustom(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
}
