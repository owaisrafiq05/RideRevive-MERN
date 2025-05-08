import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import Cookies from 'js-cookie';
import { Shield, Lock } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Password validation (at least 6 characters)
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if form is valid
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/admin/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.status) {
        toast.success(response.data.message || "Admin login successful!");
        
        // Save admin token and data 
        Cookies.set('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.data));
        
        // Use the login function from context with admin role
        login(response.data.data, response.data.token, 'admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        toast.error(error.response.data.message || 'Admin login failed');
      } else if (error.request) {
        toast.error('No response from server. Please try again later.');
      } else {
        toast.error('An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="w-full lg:w-1/2 hidden lg:block relative">
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex flex-col justify-center items-center">
          <div className="text-center p-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-500 mr-2" />
              <h1 className="text-5xl font-bold text-white">RideRevive</h1>
            </div>
            <p className="text-2xl text-white mb-8">Admin Management Portal</p>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-white">Manage user service requests</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-white">Track service providers</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-white">Access system analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-white">Manage system configurations</span>
              </div>
            </div>
          </div>
        </div>
        <img
          src="/images/admin-dashboard.jpg"
          alt="RideRevive Admin Portal"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-blue-700 via-blue-900 to-[#1a1a1a] p-4">
        <div 
          className="w-full max-w-[500px] p-8 bg-[#242424] rounded-lg shadow-2xl"
        >
          <div className="mobile-logo block lg:hidden mb-4 text-center">
            <div className="flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-500 mr-2" />
              <h1 className="text-3xl font-bold text-white">RideRevive</h1>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Email Address</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white 
                         focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white 
                         focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                        transition-colors duration-200 font-medium flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Admin Access
                  </>
                )}
              </button>
            </div>

            <div className="pt-4 text-xs text-center text-gray-500">
              This portal is restricted to authorized RideRevive administrators only.
              <br />
              For customer services, please visit the 
              <a href="/" className="text-blue-500 hover:text-blue-400 ml-1">main website</a>.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;