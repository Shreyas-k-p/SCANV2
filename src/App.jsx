import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import PWAInstall from './components/PWAInstall';
import Login from './pages/Login';
import Menu from './pages/Menu';
import CustomerMenu from './pages/CustomerMenu';
import WaiterDashboard from './pages/WaiterDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import SubManagerDashboard from './pages/SubManagerDashboard';
import CustomerScreen from './pages/CustomerScreen';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SubscriptionExpired from './pages/SubscriptionExpired';
import { useEffect } from 'react';
import { testConnection } from './services/dbTest';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/" />;

  if (allowedRoles && !allowedRoles.map(r => r.toUpperCase()).includes(user.role?.toUpperCase())) {
    console.warn(`[AUTH] Access denied. User role: ${user.role}, Allowed for: ${allowedRoles.join(',')}`);
    // Redirect based on their actual role to a safe place
    const role = user.role?.toUpperCase();
    if (role === 'WAITER') return <Navigate to="/waiter" />;
    if (role === 'KITCHEN') return <Navigate to="/kitchen" />;
    if (role === 'SUB_MANAGER') return <Navigate to="/sub-manager" />;
    if (role === 'MANAGER' || role === 'SUPER ADMIN' || role === 'SUPERADMIN') return <Navigate to="/manager" />;
    return <Navigate to="/menu" />;
  }
  return children;
}

function App() {
  useEffect(() => {
    testConnection();
  }, []);

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
              <ProtectedRoute allowedRoles={['KITCHEN']}>
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

            <Route path="/super-admin" element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'MANAGER']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/expired" element={<SubscriptionExpired />} />

            {/* /table/:tableNo — customer ordering menu (QR code destination) */}
            <Route path="/table/:tableNo" element={<CustomerMenu />} />

            {/* /screen/:tableNo — MQTT status display for restaurant screens */}
            <Route path="/screen/:tableNo" element={<CustomerScreen />} />

            {/* Legacy /menu route */}
            <Route path="/menu" element={<Menu />} />

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
