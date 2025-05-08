import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { Toaster } from 'sonner';

// Import protected route components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';

// Lazy load components
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
const AdminLogin = lazy(() => import('./Login/admin_login'));
const AdminDashboard = lazy(() => import('./Dashboard/Admin_Dashboard'));
const OrderList = lazy(() => import('./Dashboard/Order_List'));
const OrderDetails = lazy(() => import('./Dashboard/Order_Details'));

function App() {
  const location = useLocation();
  
  // Paths that don't need the sidebar
  const publicRoutes = ['/signup', '/login', '/otp', '/admin-login'];
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <Suspense fallback={<div className="text-white text-center p-4">Loading...</div>}>
      <Toaster />
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        {/* Protected User Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/form" element={
          <ProtectedRoute>
            <Form />
          </ProtectedRoute>
        } />
        <Route path="/fuel-delivery" element={
          <ProtectedRoute>
            <FuelDeliveryForm />
          </ProtectedRoute>
        } />
        <Route path="/car-washing" element={
          <ProtectedRoute>
            <CarWashingForm />
          </ProtectedRoute>
        } />
        <Route path="/tire-services" element={
          <ProtectedRoute>
            <TireServicesForm />
          </ProtectedRoute>
        } />
        <Route path="/emergency-rescue" element={
          <ProtectedRoute>
            <EmergencyRescueForm />
          </ProtectedRoute>
        } />
        <Route path="/battery-services" element={
          <ProtectedRoute>
            <BatteryServicesForm />
          </ProtectedRoute>
        } />
        <Route path="/engine-oil-services" element={
          <ProtectedRoute>
            <EngineOilServicesForm />
          </ProtectedRoute>
        } />
        <Route path="/services" element={
          <ProtectedRoute>
            <ServiceListPage />
          </ProtectedRoute>
        } />
        <Route path="/vehicles" element={
          <ProtectedRoute>
            <CardDisplay />
          </ProtectedRoute>
        } />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <AdminProtectedRoute>
            <OrderList />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/orders/:orderId" element={
          <AdminProtectedRoute>
            <OrderDetails />
          </AdminProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
}

export default App;