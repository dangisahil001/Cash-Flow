import DashboardLayout from '../layouts/DashboardLayout';
import { Search, UserPlus, MoreVertical, ShieldCheck, AlertCircle, CheckCircle2, PlusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { AxiosError } from 'axios';

export default function VendorCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  
  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUser, setSearchedUser] = useState<any | null>(null);
  const [searchError, setSearchError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Transaction state
  const [trxAmount, setTrxAmount] = useState('');
  const [trxType, setTrxType] = useState<'credit' | 'payment'>('credit');
  const [trxNotes, setTrxNotes] = useState('');
  const [trxDueDate, setTrxDueDate] = useState('');
  const [isTrxSubmitting, setIsTrxSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers/list');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsLoading(true);
    setSearchError('');
    setSearchedUser(null);

    try {
      const res = await api.get(`/customers/search?query=${searchQuery}`);
      setSearchedUser(res.data);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 404) {
        setSearchError('Customer not found on LendTrack.');
      } else {
        setSearchError('An error occurred while searching.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (searchedUser) {
      try {
        await api.post('/customers/link', { customerId: searchedUser._id });
        alert('Customer successfully added to your Khata!');
        closeAddCustomerModal();
        fetchCustomers();
      } catch (err) {
        if (err instanceof AxiosError) {
          alert(err.response?.data?.message || 'Failed to link customer');
        }
      }
    }
  };

  const closeAddCustomerModal = () => {
    setIsAddCustomerOpen(false);
    setSearchedUser(null);
    setSearchQuery('');
    setSearchError('');
  };

  const openTransactionModal = (customer: any) => {
    setSelectedCustomer(customer);
    setIsTransactionOpen(true);
  };

  const closeTransactionModal = () => {
    setIsTransactionOpen(false);
    setSelectedCustomer(null);
    setTrxAmount('');
    setTrxNotes('');
    setTrxDueDate('');
    setTrxType('credit');
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !trxAmount) return;

    setIsTrxSubmitting(true);
    try {
      await api.post('/transactions/request', {
        customerId: selectedCustomer.userId,
        amount: trxAmount,
        type: trxType,
        notes: trxNotes,
        dueDate: trxDueDate || undefined
      });
      alert('Transaction request sent! It is pending customer approval.');
      closeTransactionModal();
    } catch (err) {
      if (err instanceof AxiosError) {
        console.error('Transaction Error Response:', err.response?.data);
        alert(err.response?.data?.message || 'Failed to create transaction');
      } else {
        console.error('Unknown Error:', err);
        alert('An unexpected error occurred');
      }
    } finally {
      setIsTrxSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Customers</h1>
          <p className="text-secondary-500">Manage your connected customers and khata.</p>
        </div>
        <button 
          onClick={() => setIsAddCustomerOpen(true)}
          className="btn btn-primary px-4 py-2 flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" /> Add Customer
        </button>
      </div>

      {/* Customers Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-secondary-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input 
              type="text" 
              placeholder="Search your khata..." 
              className="input pl-10 py-2 border w-full"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-50 border-b border-secondary-200">
                <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Outstanding Balance</th>
                <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200 bg-white">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-secondary-500">
                    No customers linked yet. Click "Add Customer" to start your khata.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-secondary-900">{cust.name}</p>
                          <p className="text-xs text-secondary-500">ID: {cust.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-secondary-900">{cust.phone || 'N/A'}</p>
                      <p className="text-xs text-secondary-500">{cust.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-secondary-900">
                      ₹{cust.balance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => openTransactionModal(cust)}
                          className="btn btn-primary px-3 py-1.5 text-xs flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <PlusCircle className="w-4 h-4" /> Add Amount
                        </button>
                        <button className="text-secondary-400 hover:text-secondary-900">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 bg-secondary-900/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 relative">
            <button 
              onClick={closeAddCustomerModal}
              className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-900"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-secondary-900 mb-2">Add Customer</h2>
            <p className="text-sm text-secondary-500 mb-6">Search by Email to link them to your khata.</p>

            <form onSubmit={handleSearch} className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-1">Customer Email</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  required
                  placeholder="e.g. user@example.com"
                  className="input px-4 py-2 border flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" disabled={isLoading} className="btn btn-secondary px-4 py-2">
                  {isLoading ? '...' : 'Search'}
                </button>
              </div>
              {searchError && <p className="text-danger text-sm mt-2">{searchError}</p>}
            </form>

            {searchedUser && (
              <div className="border border-green-200 bg-green-50 rounded-xl p-4 mb-6 text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl relative">
                    {searchedUser.name.charAt(0)}
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                      <ShieldCheck className="w-5 h-5 text-success" />
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-secondary-900">{searchedUser.name}</h3>
                <p className="text-sm text-secondary-600 mb-4">{searchedUser.email}</p>
                <div className="flex items-center justify-center gap-2 text-xs text-green-700 bg-green-100 rounded-lg p-2 mb-4">
                  <CheckCircle2 className="w-4 h-4" /> User Verified on LendTrack
                </div>
                <button 
                  onClick={handleAddCustomer}
                  className="btn btn-primary w-full py-2.5"
                >
                  Start Trading (Add to Khata)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Amount (Transaction) Modal */}
      {isTransactionOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-secondary-900/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 relative">
            <button 
              onClick={closeTransactionModal}
              className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-900"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-secondary-900 mb-1">Add Amount</h2>
            <p className="text-sm text-secondary-500 mb-6">Create a request for <span className="font-semibold text-secondary-900">{selectedCustomer.name}</span></p>

            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Transaction Type</label>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="trxType"
                      value="credit"
                      checked={trxType === 'credit'}
                      onChange={() => setTrxType('credit')}
                      className="peer hidden"
                    />
                    <div className="text-center py-2 border rounded-lg cursor-pointer peer-checked:border-danger peer-checked:bg-red-50 peer-checked:text-red-700 transition-colors">
                      Give Credit
                    </div>
                  </label>
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="trxType"
                      value="payment"
                      checked={trxType === 'payment'}
                      onChange={() => setTrxType('payment')}
                      className="peer hidden"
                    />
                    <div className="text-center py-2 border rounded-lg cursor-pointer peer-checked:border-success peer-checked:bg-green-50 peer-checked:text-green-700 transition-colors">
                      Receive Payment
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  placeholder="e.g. 500"
                  className="input px-4 py-2 border w-full text-lg font-bold"
                  value={trxAmount}
                  onChange={(e) => setTrxAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Notes (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 2kg Rice, 1L Oil"
                  className="input px-4 py-2 border w-full"
                  value={trxNotes}
                  onChange={(e) => setTrxNotes(e.target.value)}
                />
              </div>

              {trxType === 'credit' && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Due Date (Optional)</label>
                  <input 
                    type="date" 
                    className="input px-4 py-2 border w-full"
                    value={trxDueDate}
                    onChange={(e) => setTrxDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-secondary-500 mt-1">Set a deadline for the customer to pay this amount.</p>
                </div>
              )}

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isTrxSubmitting}
                  className="btn btn-primary w-full py-2.5"
                >
                  {isTrxSubmitting ? 'Sending Request...' : 'Send Request to Customer'}
                </button>
                <p className="text-xs text-center text-secondary-500 mt-3">
                  This transaction will remain <span className="font-semibold text-warning">Pending</span> until {selectedCustomer.name} approves it.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
