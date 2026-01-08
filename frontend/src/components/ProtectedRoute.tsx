import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Protected Route Component
 * Redirects to login if no auth token is present
 * Uses Outlet pattern for nested routes
 */
export default function ProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem('admin_token');

  console.log('🔒 ProtectedRoute Check:');
  console.log('  - Path:', location.pathname);
  console.log('  - Has Token:', !!token);

  if (!token) {
    console.log('  ❌ No token, redirecting to login');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  console.log('  ✅ Token found, allowing access');
  return <Outlet />;
}
