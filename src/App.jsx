import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Sidebar from './components/global components/sideBar';

const Signup = lazy(() => import('./Sign-up/page'));
const Login = lazy(() => import('./Login/page'));
const Dashboard = lazy(() => import('./Dashboard/page'));

function App() {
  const location = useLocation();

  const showSidebar = location.pathname !== '/' && location.pathname !== '/login';

  return (
    <Suspense fallback={<div className="text-white text-center p-4">Loading...</div>}>
      {showSidebar && <Sidebar />}
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}

export default App;
