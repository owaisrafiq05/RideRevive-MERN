import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Sidebar from './components/global components/sideBar';
import Cookies from 'js-cookie';

const Signup = lazy(() => import('./Sign-up/page'));
const Login = lazy(() => import('./Login/page'));
const Otp = lazy(() => import('./Otp/page'));
const Dashboard = lazy(() => import('./Dashboard/page'));
const Form = lazy(() => import('./components/HomeComponents/form'));
const CardDisplay = lazy(() => import('./carddisplay/page'));
import { Toaster } from 'sonner';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const showSidebar = location.pathname !== '/signup' && location.pathname !== '/login' && location.pathname !== '/otp';

  useEffect(() => {
    const token = Cookies.get('token');
    const allowedPaths = ['/signup', '/login', '/otp'];

    if (!token && !allowedPaths.includes(location.pathname)) {
      navigate('/signup');
    }
  }, [location.pathname, navigate]);

  return (
    <Suspense fallback={<div className="text-white text-center p-4">Loading...</div>}>
      {showSidebar && <Sidebar />}
      <Toaster />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/form" element={<Form />} />
        <Route path="/carddisplay" element={<CardDisplay />} /> 
      </Routes>
    </Suspense>
  );
}

export default App;