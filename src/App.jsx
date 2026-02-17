import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import PWAInstall from './components/PWAInstall';
import Login from './pages/Login';
import Menu from './pages/Menu';
import WaiterDashboard from './pages/WaiterDashboard';
import KitchenDashboard from './pages/KitchenDashboard';

import ManagerDashboard from './pages/ManagerDashboard';
import SubManagerDashboard from './pages/SubManagerDashboard';
import CustomerScreen from './pages/CustomerScreen';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on their actual role to a safe place
    if (user.role === 'WAITER') return <Navigate to="/waiter" />;
    if (user.role === 'KITCHEN') return <Navigate to="/kitchen" />;
    if (user.role === 'SUB_MANAGER') return <Navigate to="/sub-manager" />;
    if (user.role === 'MANAGER') return <Navigate to="/manager" />;
    return <Navigate to="/menu" />;
  }
  return children;
}

function App() {
  return (
    <AppProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/menu" element={<Menu />} />

            <Route path="/waiter" element={
              <ProtectedRoute allowedRoles={['WAITER']}>
                <WaiterDashboard />
              </ProtectedRoute>
            } />

            <Route path="/kitchen" element={
              <ProtectedRoute allowedRoles={['KITCHEN', 'WAITER']}>
                <KitchenDashboard />
              </ProtectedRoute>
            } />

            <Route path="/sub-manager" element={
              <ProtectedRoute allowedRoles={['SUB_MANAGER']}>
                <SubManagerDashboard />
              </ProtectedRoute>
            } />

            <Route path="/manager" element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } />

            <Route path="/table/:id" element={<CustomerScreen />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <PWAInstall />
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
