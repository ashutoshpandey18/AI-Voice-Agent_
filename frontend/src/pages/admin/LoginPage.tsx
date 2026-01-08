import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminLogin } from '../../hooks/useAdminApi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const mutation = useAdminLogin();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('🔐 [LoginPage] Attempting login with:', email);

    try {
      const result = await mutation.mutateAsync({ email, password });
      console.log('✅ [LoginPage] Login successful:', result);
      console.log('🔍 [LoginPage] Result structure:', JSON.stringify(result, null, 2));

      // ✅ CRITICAL: Store token BEFORE navigation to avoid race condition
      // Check both result.token and result.data.token
      const token = result?.token || result?.data?.token;

      if (token) {
        localStorage.setItem('admin_token', token);
        console.log('💾 [LoginPage] Token stored in localStorage');
        console.log('🔍 [LoginPage] Token verification:', !!localStorage.getItem('admin_token'));
        console.log('📝 [LoginPage] Token preview:', token.substring(0, 50) + '...');
      } else {
        console.error('❌ [LoginPage] No token in response:', result);
        setError('Login failed: No token received from server');
        return;
      }

      console.log('🚀 [LoginPage] Navigating to /admin/dashboard');
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('❌ [LoginPage] Login error:', err);
      setError(err?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6">Admin Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <label className="block mb-3">
          <span className="text-sm text-gray-600">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
            required
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-gray-600">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded border px-3 py-2"
            required
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Default: admin@restaurant.com / admin123
        </div>
      </form>
    </div>
  );
}
