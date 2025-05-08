import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdminAuthenticated } from '../../utils/auth';
import { toast } from 'sonner';
import AdminSidebar from '../global components/AdminSidebar';

// Protected route for admin users
const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { loading } = useAuth();

  useEffect(() => {
    // Check if admin is authenticated
    if (!isAdminAuthenticated()) {
      toast.error("Please log in to access admin panel");
      navigate('/admin-login');
    }
  }, [navigate]);

  // Show loading state or return children with admin sidebar if authenticated
  if (loading) {
    return <div className="text-white text-center p-4">Loading...</div>;
  }

  // Return children with admin sidebar if authenticated
  return isAdminAuthenticated() ? (
    <>
      <AdminSidebar />
      {children}
    </>
  ) : null;
};

export default AdminProtectedRoute; 