import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const Signup = lazy(() => import('./Sign-up/page'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="text-white text-center p-4">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Signup />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
