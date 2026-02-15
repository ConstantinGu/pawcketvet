import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ClientLayout from './components/ClientLayout';

// Pages login
import LoginPage from './pages/LoginPage';

// Pages vétérinaire
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import AppointmentsPagePremium from './pages/AppointmentsPagePremium';
import InventoryPage from './pages/InventoryPage';
import InvoicesPage from './pages/InvoicesPage';
import MessagesPage from './pages/MessagesPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import CertificatesPage from './pages/CertificatesPage';
import StaffPage from './pages/StaffPage';
import ClinicSettingsPage from './pages/ClinicSettingsPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Pages client/propriétaire
import ClientDashboard from './pages/ClientDashboard';
import ClientBookAppointment from './pages/ClientBookAppointment';
import ClientAnimalDetail from './pages/ClientAnimalDetail';
import ClientMyPets from './pages/ClientMyPets';
import ClientAppointments from './pages/ClientAppointments';
import ClientMessages from './pages/ClientMessages';
import ClientDocuments from './pages/ClientDocuments';
import ClientReminders from './pages/ClientReminders';
import ClientPayments from './pages/ClientPayments';
import SOSTriagePage from './pages/SOSTriagePage';
import ClientHealthBook from './pages/ClientHealthBook';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Composant pour protéger les routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐾</div>
          <div style={{ fontSize: '1.2rem', color: '#B8704F' }}>Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Vérifier si le rôle de l'utilisateur est autorisé
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'OWNER') {
      return <Navigate to="/client/dashboard" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Route de login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Routes vétérinaire (ADMIN, VETERINARIAN, ASSISTANT) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'VETERINARIAN', 'ASSISTANT']}>
              <Layout><DashboardPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'VETERINARIAN', 'ASSISTANT']}>
              <Layout><PatientsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'VETERINARIAN', 'ASSISTANT']}>
              <Layout><AppointmentsPagePremium /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'VETERINARIAN', 'ASSISTANT']}>
              <Layout><MessagesPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'VETERINARIAN', 'ASSISTANT']}>
              <Layout><InventoryPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'VETERINARIAN', 'ASSISTANT']}>
              <Layout><InvoicesPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'VETERINARIAN', 'ASSISTANT']}>
              <Layout><PatientDetailPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescriptions"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'VETERINARIAN', 'ASSISTANT']}>
              <Layout><PrescriptionsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'VETERINARIAN', 'ASSISTANT']}>
              <Layout><CertificatesPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'VETERINARIAN']}>
              <Layout><StaffPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'VETERINARIAN']}>
              <Layout><AnalyticsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clinic-settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Layout><ClinicSettingsPage /></Layout>
            </ProtectedRoute>
          }
        />

        {/* Routes client/propriétaire (OWNER) - avec ClientLayout */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <ClientLayout><ClientDashboard /></ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/my-pets"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <ClientLayout><ClientMyPets /></ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/appointments"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <ClientLayout><ClientAppointments /></ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/messages"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <ClientLayout><ClientMessages /></ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/documents"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <ClientLayout><ClientDocuments /></ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/reminders"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <ClientLayout><ClientReminders /></ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/payments"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <ClientLayout><ClientPayments /></ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/book-appointment"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <ClientLayout><ClientBookAppointment /></ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/health-book"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <ClientLayout><ClientHealthBook /></ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/sos"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <ClientLayout><SOSTriagePage /></ClientLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/animal/:id"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <ClientLayout><ClientAnimalDetail /></ClientLayout>
            </ProtectedRoute>
          }
        />

        {/* Route par défaut - redirection intelligente selon le rôle */}
        <Route
          path="/"
          element={
            user?.role === 'OWNER'
              ? <Navigate to="/client/dashboard" />
              : <Navigate to="/dashboard" />
          }
        />

        {/* Route 404 */}
        <Route
          path="*"
          element={
            <div style={{
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}>
              <div style={{
                background: '#fff',
                borderRadius: '28px',
                padding: '3rem',
                maxWidth: '600px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🐾</div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#3E2723' }}>
                  Page non trouvée
                </h2>
                <p style={{ color: '#A1887F', fontSize: '1.1rem', marginBottom: '2rem' }}>
                  Oups ! Cette page n'existe pas.
                </p>
                <button
                  onClick={() => window.location.href = user?.role === 'OWNER' ? '/client/dashboard' : '/dashboard'}
                  style={{
                    background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
