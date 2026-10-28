import { useAuthStore } from '../store/authStore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Settings,
  Bell,
  Menu,
  X,
  ShoppingBag,
  Receipt
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const vendorLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/vendor' },
    { name: 'Customers', icon: Users, path: '/vendor/customers' },
    { name: 'Products', icon: ShoppingBag, path: '/vendor/products' },
    { name: 'Transactions', icon: Receipt, path: '/vendor/transactions' },
    { name: 'Settings', icon: Settings, path: '/vendor/settings' },
  ];

  const customerLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/customer' },
    { name: 'Catalog', icon: ShoppingBag, path: '/customer/catalog' },
    { name: 'Transactions', icon: Receipt, path: '/customer/transactions' },
    { name: 'Settings', icon: Settings, path: '/customer/settings' },
  ];

  const links = user?.role === 'vendor' ? vendorLinks : customerLinks;

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-secondary-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-secondary-200 
        transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-secondary-200">
          <Link to="/" className="text-xl font-bold text-primary-600 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            LendTrack
          </Link>
          <button className="lg:hidden text-secondary-500" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-secondary-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-secondary-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-secondary-900 truncate">{user?.name}</p>
              <p className="text-xs text-secondary-500 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-danger hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-4 lg:px-8">
          <button 
            className="lg:hidden text-secondary-500 hover:text-secondary-900 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-secondary-400 hover:text-secondary-500 transition-colors">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white"></span>
              <Bell className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
