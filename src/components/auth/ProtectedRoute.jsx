import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAuthenticated, isAdminAuthenticated } from '../../utils/auth';
import { toast } from 'sonner';
import Sidebar from '../global components/sideBar';

// Protected route for regular users
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { loading } = useAuth();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      toast.error("Please log in to access this page");
      navigate('/login');
      return;
    }
    
    // If admin is trying to access user routes, redirect to admin dashboard
    if (isAdminAuthenticated()) {
      navigate('/admin');
    }
  }, [navigate]);

  // Show loading state or return children with sidebar if authenticated
  if (loading) {
    return <div className="text-white text-center p-4">Loading...</div>;
  }

  return isAuthenticated() ? (
    <>
      <Sidebar />
      {children}
    </>
  ) : null;
};

export default ProtectedRoute; 