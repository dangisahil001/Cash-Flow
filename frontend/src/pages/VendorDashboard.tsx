import DashboardLayout from '../layouts/DashboardLayout';
import { Users, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function VendorDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>({
    totalOutstanding: 0,
    totalCreditGiven: 0,
    totalPaymentsReceived: 0,
    recentTransactions: []
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/vendor');
      setStats({
        totalOutstanding: res.data.stats.totalOutstanding || 0,
        totalCreditGiven: res.data.stats.totalCreditGiven || 0,
        totalPaymentsReceived: res.data.stats.totalPaymentsReceived || 0,
        recentTransactions: res.data.recentTransactions || []
      });
      
      // If no chart data, provide a dummy point so the chart doesn't break
      if (res.data.chartData && res.data.chartData.length > 0) {
        setChartData(res.data.chartData);
      } else {
        setChartData([{ name: new Date().toISOString().split('T')[0], credit: 0, payment: 0 }]);
      }
    } catch (err) {
      console.error('Failed to fetch vendor analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  const METRIC_CARDS = [
    {
      title: 'Total Outstanding Balance',
      value: `₹${stats.totalOutstanding.toLocaleString()}`,
      trend: '+12.5%',
      trendUp: true,
      icon: IndianRupee,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      title: 'Total Credit Given',
      value: `₹${stats.totalCreditGiven.toLocaleString()}`,
      trend: '+8.2%',
      trendUp: true,
      icon: TrendingUp,
      color: 'text-danger',
      bg: 'bg-red-50',
    },
    {
      title: 'Total Payments Received',
      value: `₹${stats.totalPaymentsReceived.toLocaleString()}`,
      trend: '+2.4%',
      trendUp: true,
      icon: CreditCard,
      color: 'text-success',
      bg: 'bg-green-50',
    }
  ];

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Welcome back, {user?.name || 'Vendor'}</h1>
          <p className="text-secondary-500">Here's what's happening with your khata today.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-secondary-500 animate-pulse">
          Loading your khata analytics...
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {METRIC_CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="card p-6 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${card.bg}`}>
                      <Icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-500 mb-1">{card.title}</p>
                    <h3 className="text-3xl font-bold text-secondary-900">{card.value}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-secondary-900">Cash Flow Overview</h3>
                  <p className="text-sm text-secondary-500">Credit given vs Payments received</p>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPayment" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`₹${value}`, undefined]}
                    />
                    <Area type="monotone" dataKey="credit" name="Credit Given" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCredit)" />
                    <Area type="monotone" dataKey="payment" name="Payment Received" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorPayment)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-bold text-secondary-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <a href="/vendor/customers" className="btn btn-primary w-full justify-center">
                  Go to Customers
                </a>
              </div>
            </div>
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
                    <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200 bg-white">
                  {!stats.recentTransactions || stats.recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-secondary-500">
                        No approved transactions yet.
                      </td>
                    </tr>
                  ) : (
                    stats.recentTransactions.map((trx: any) => (
                      <tr key={trx._id} className="hover:bg-secondary-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-secondary-500">
                          {trx._id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                          {trx.customerId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {trx.type === 'credit' ? (
                            <span className="flex items-center gap-1 text-danger"><ArrowUpRight className="w-4 h-4"/> Credit Given</span>
                          ) : (
                            <span className="flex items-center gap-1 text-success"><ArrowDownRight className="w-4 h-4"/> Payment Rcvd</span>
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
    </DashboardLayout>
  );
}
