import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowRightLeft, CreditCard, ShieldCheck } from 'lucide-react';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import VendorDashboard from './pages/VendorDashboard';
import VendorCustomers from './pages/VendorCustomers';
import VendorProducts from './pages/VendorProducts';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerCatalog from './pages/CustomerCatalog';
import PlaceholderPage from './pages/PlaceholderPage';

const queryClient = new QueryClient();

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 p-6">
      <div className="text-center max-w-3xl">
        <div className="flex justify-center mb-6">
          <div className="bg-primary-600 p-4 rounded-2xl shadow-lg shadow-primary-500/30">
            <CreditCard className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold text-secondary-900 tracking-tight mb-4">
          Welcome to <span className="text-primary-600">LendTrack</span>
        </h1>
        <p className="text-xl text-secondary-600 mb-10 leading-relaxed">
          The modern digital credit ledger replacing your copy-pen khata.
          Manage credit safely with mutual approval and complete transparency.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          <div className="card p-6 text-left hover:shadow-md transition-shadow">
            <ArrowRightLeft className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">Mutual Confirmation</h3>
            <p className="text-secondary-600 text-sm">Every credit transaction requires customer approval before being permanently recorded.</p>
          </div>
          <div className="card p-6 text-left hover:shadow-md transition-shadow">
            <ShieldCheck className="w-8 h-8 text-success mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">Secure & Transparent</h3>
            <p className="text-secondary-600 text-sm">Maintains a complete audit trail for zero disputes and complete peace of mind.</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => navigate('/login?role=vendor')}
            className="btn btn-primary px-8 py-3 text-base rounded-xl"
          >
            Get Started as Vendor
          </button>
          <button 
            onClick={() => navigate('/login?role=customer')}
            className="btn btn-secondary px-8 py-3 text-base rounded-xl"
          >
            Customer Login
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Vendor Routes */}
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/vendor/customers" element={<VendorCustomers />} />
          <Route path="/vendor/products" element={<VendorProducts />} />
          <Route path="/vendor/transactions" element={<PlaceholderPage title="Complete Ledger" description="View and filter all historical transactions." />} />
          <Route path="/vendor/settings" element={<PlaceholderPage title="Store Settings" description="Update your vendor profile and store details." />} />
          
          {/* Customer Routes */}
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/customer/catalog" element={<CustomerCatalog />} />
          <Route path="/customer/transactions" element={<PlaceholderPage title="My Ledger" description="Detailed view of your transactions with all vendors." />} />
          <Route path="/customer/settings" element={<PlaceholderPage title="Profile Settings" description="Manage your customer account and notifications." />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
