import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { MailCheck } from 'lucide-react';
import api from '../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Verification token is missing');
      return;
    }

    api.post('/auth/verify-email', { token })
      .then((response) => {
        setMessage(response.data.message);
        setTimeout(() => navigate('/login'), 1500);
      })
      .catch((err: unknown) => {
        setError(err instanceof AxiosError ? err.response?.data?.message || 'Unable to verify email' : 'Unable to verify email');
      });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-100 p-4">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-6"><div className="bg-primary-100 p-3 rounded-full"><MailCheck className="w-8 h-8 text-primary-600" /></div></div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Email verification</h2>
        <p className={error ? 'text-red-600' : 'text-secondary-600'}>{error || message}</p>
      </div>
    </div>
  );
}