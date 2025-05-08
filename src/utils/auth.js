import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = Cookies.get('token');
  return !!token;
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const adminToken = Cookies.get('adminToken');
  return !!adminToken;
};

// Get user data from localStorage or token
export const getUserData = () => {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    
    const token = Cookies.get('token');
    if (token) {
      const decoded = jwtDecode(token);
      return decoded;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Get admin data from localStorage or token
export const getAdminData = () => {
  try {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      return JSON.parse(adminData);
    }
    
    const adminToken = Cookies.get('adminToken');
    if (adminToken) {
      const decoded = jwtDecode(adminToken);
      return decoded;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting admin data:", error);
    return null;
  }
};

// Logout user
export const logoutUser = () => {
  Cookies.remove('token');
  localStorage.removeItem('userData');
};

// Logout admin
export const logoutAdmin = () => {
  Cookies.remove('adminToken');
  localStorage.removeItem('adminData');
}; 