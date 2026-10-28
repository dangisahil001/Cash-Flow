import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { KeyRound, LogIn, UserPlus } from 'lucide-react';
import api from '../services/api';
import { AxiosError } from 'axios';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const initialRole = (searchParams.get('role') as 'vendor' | 'customer') || 'customer';
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [role, setRole] = useState<'vendor' | 'customer'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [panCard, setPanCard] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isForgotPassword) {
        await api.post('/auth/forgot-password', { email });
        setError('If an account exists for that email, a password reset link has been sent.');
      } else if (isRegistering) {
        const res = await api.post('/auth/register', { name, email, password, role, panCard });
        login(res.data.user, res.data.token);
      } else {
        const res = await api.post('/auth/login', { email, password, role });
        login(res.data.user, res.data.token);
      }

      if (isForgotPassword) {
        return;
      }

      if (role === 'vendor') {
        navigate('/vendor');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Authentication failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-100 p-4">
      <div className="card w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-primary-100 p-3 rounded-full">
            {isForgotPassword ? <KeyRound className="w-8 h-8 text-primary-600" /> : isRegistering ? <UserPlus className="w-8 h-8 text-primary-600" /> : <LogIn className="w-8 h-8 text-primary-600" />}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-secondary-900 mb-2">
          {isForgotPassword ? 'Forgot Password' : isRegistering ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <p className="text-center text-secondary-500 mb-6">
          {isForgotPassword ? 'Enter your email to receive a password reset link.' : isRegistering ? 'Join LendTrack to manage your khata.' : 'Log in to your LendTrack account'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isForgotPassword && <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">I am a...</label>
            <div className="flex gap-4">
              <label className="flex-1">
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === 'customer'}
                  onChange={() => setRole('customer')}
                  className="peer hidden"
                />
                <div className="text-center py-2 border rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 transition-colors">
                  Customer
                </div>
              </label>
              <label className="flex-1">
                <input
                  type="radio"
                  name="role"
                  value="vendor"
                  checked={role === 'vendor'}
                  onChange={() => setRole('vendor')}
                  className="peer hidden"
                />
                <div className="text-center py-2 border rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 transition-colors">
                  Vendor
                </div>
              </label>
            </div>
          </div>}

          {!isForgotPassword && isRegistering && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="input px-4 py-2 border w-full"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          {!isForgotPassword && isRegistering && role === 'customer' && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">PAN Card (For e-Mandate)</label>
              <input
                type="text"
                required
                className="input px-4 py-2 border w-full uppercase"
                placeholder="ABCDE1234F"
                maxLength={10}
                value={panCard}
                onChange={(e) => setPanCard(e.target.value.toUpperCase())}
              />
              <p className="text-xs text-secondary-500 mt-1">Legally required for Govt Auto-Pay (EMI) setup.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="input px-4 py-2 border w-full"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {!isForgotPassword && <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="input px-4 py-2 border w-full"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>}

          <button type="submit" disabled={isLoading} className="btn btn-primary w-full mt-6 py-2.5">
            {isLoading ? 'Processing...' : isForgotPassword ? 'Send Reset Link' : isRegistering ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-secondary-600 mt-6">
          {isForgotPassword ? 'Remembered your password? ' : isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <button 
            type="button" 
            className="text-primary-600 font-semibold hover:underline"
            onClick={() => {
              setError('');
              setIsForgotPassword(false);
              setIsRegistering(!isRegistering);
            }}
          >
            {isForgotPassword ? 'Log In' : isRegistering ? 'Log In' : 'Sign Up'}
          </button>
        </p>
        {!isRegistering && !isForgotPassword && (
          <button type="button" className="block mx-auto text-sm text-primary-600 font-semibold hover:underline mt-3" onClick={() => { setError(''); setIsForgotPassword(true); }}>
            Forgot password?
          </button>
        )}
      </div>
    </div>
  );
}
