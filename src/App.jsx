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
const FuelDeliveryForm = lazy(() => import('./components/Service Components/FuelDeliveryForm'));
const CarWashingForm = lazy(() => import('./components/Service Components/CarWashingForm'));
const TireServicesForm = lazy(() => import('./components/Service Components/TireServicesForm'));
const EmergencyRescueForm = lazy(() => import('./components/Service Components/EmergencyRescueForm'));
const BatteryServicesForm = lazy(() => import('./components/Service Components/BatteryServicesForm'));
const EngineOilServicesForm = lazy(() => import('./components/Service Components/EngineOilServicesForm'));
const ServiceListPage = lazy(() => import('./components/Service Page/ServiceListPage'));
const CardDisplay = lazy(() => import('./carddisplay/page'));
import { Toaster } from 'sonner';
const AdminLogin = lazy(() => import('./Login/admin_login'));
const AdminDashboard = lazy(() => import('./Dashboard/Admin_Dashboard'));
const OrderList = lazy(() => import('./Dashboard/Order_List'));
const OrderDetails = lazy(() => import('./Dashboard/Order_Details'));

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const showSidebar = location.pathname !== '/signup' && location.pathname !== '/login' && location.pathname !== '/otp';

  useEffect(() => {
    const token = Cookies.get('token');
    const allowedPaths = ['/signup', '/login', '/otp', '/admin-login'];
    const isAdminPath = location.pathname.startsWith('/admin');

    if (!token && !allowedPaths.includes(location.pathname) && !isAdminPath) {
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
        <Route path="/fuel-delivery" element={<FuelDeliveryForm />} />
        <Route path="/car-washing" element={<CarWashingForm />} />
        <Route path="/tire-services" element={<TireServicesForm />} />
        <Route path="/emergency-rescue" element={<EmergencyRescueForm />} />
        <Route path="/battery-services" element={<BatteryServicesForm />} />
        <Route path="/engine-oil-services" element={<EngineOilServicesForm />} />
        <Route path="/services" element={<ServiceListPage />} />
        <Route path="/vehicles" element={<CardDisplay />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<OrderList />} />
        <Route path="/admin/orders/:orderId" element={<OrderDetails />} />
      </Routes>
    </Suspense>
  );
}

export default App;