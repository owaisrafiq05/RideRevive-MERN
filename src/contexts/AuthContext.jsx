import { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, isAdminAuthenticated, getUserData, getAdminData, logoutUser, logoutAdmin } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Create the context
const AuthContext = createContext(null);

// Hook for using the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    try {
      if (isAuthenticated()) {
        setUser(getUserData());
      }
      
      if (isAdminAuthenticated()) {
        setAdmin(getAdminData());
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // User authentication functions
  const login = (userData, token, role = 'user') => {
    if (role === 'admin') {
      setAdmin(userData);
      navigate('/admin');
    } else {
      setUser(userData);
      navigate('/');
    }
  };

  const logout = (role = 'user') => {
    if (role === 'admin') {
      logoutAdmin();
      setAdmin(null);
      navigate('/admin-login');
    } else {
      logoutUser();
      setUser(null);
      navigate('/login');
    }
    toast.success(`${role === 'admin' ? 'Admin' : 'User'} logged out successfully`);
  };

  // Values provided to consuming components
  const value = {
    user,
    admin,
    isAuthenticated: !!user,
    isAdminAuthenticated: !!admin,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 