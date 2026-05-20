import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Transactions from './pages/Transactions';
import ShopSettings from './pages/ShopSettings';
import Users from './pages/Users';
import './styles/index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>} />
      <Route path="/customers/:id" element={<ProtectedRoute><Layout><CustomerDetail /></Layout></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><ShopSettings /></Layout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
