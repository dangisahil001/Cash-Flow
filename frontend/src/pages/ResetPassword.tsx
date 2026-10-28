import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { KeyRound } from 'lucide-react';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        token: searchParams.get('token'),
        password,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err instanceof AxiosError ? err.response?.data?.message || 'Unable to reset password' : 'Unable to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-100 p-4">
      <div className="card w-full max-w-md p-8">
        <div className="flex justify-center mb-6"><div className="bg-primary-100 p-3 rounded-full"><KeyRound className="w-8 h-8 text-primary-600" /></div></div>
        <h2 className="text-2xl font-bold text-center text-secondary-900 mb-2">Set a new password</h2>
        <p className="text-center text-secondary-500 mb-6">Choose a new password for your LendTrack account.</p>
        {(error || message) && <div className={`${error ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'} text-sm p-3 rounded-lg mb-4 border`}>{error || message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" required minLength={8} className="input px-4 py-2 border w-full" placeholder="New password (8+ characters)" value={password} onChange={(event) => setPassword(event.target.value)} />
          <input type="password" required minLength={8} className="input px-4 py-2 border w-full" placeholder="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          <button type="submit" disabled={isLoading || Boolean(message)} className="btn btn-primary w-full py-2.5">{isLoading ? 'Updating...' : 'Update Password'}</button>
        </form>
      </div>
    </div>
  );
}