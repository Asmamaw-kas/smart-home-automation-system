import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { AppProviders } from './context';

// Layout Component
import Layout from './components/Layout';

// Auth Components
import { Login, Register, ForgotPassword, ProtectedRoute } from './components/Auth';

// Main Components
import Dashboard from './components/Dashboard';
import Devices from './components/Devices';
import Automation from './components/Automation';
import Security from './components/Security';
import Logs from './components/Logs';
//import Settings from './components/Settings';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppProviders>
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
              loading: {
                duration: 3000,
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/devices" element={
              <ProtectedRoute>
                <Layout>
                  <Devices />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/automation" element={
              <ProtectedRoute>
                <Layout>
                  <Automation />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/security" element={
              <ProtectedRoute>
                <Layout>
                  <Security />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/logs" element={
              <ProtectedRoute>
                <Layout>
                  <Logs />
                </Layout>
              </ProtectedRoute>
            } />
            {/*
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
*/}
            {/* 404 - Not Found */}
            <Route path="*" element={
              <ProtectedRoute>
                <Layout>
                  <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-9xl font-bold text-primary-600">404</h1>
                      <h2 className="text-2xl font-semibold mt-4 dark:text-white text-gray-900">
                        Page Not Found
                      </h2>
                      <p className="mt-2 dark:text-gray-400 text-gray-600">
                        The page you're looking for doesn't exist or has been moved.
                      </p>
                      <a
                        href="/dashboard"
                        className="inline-block mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Go to Dashboard
                      </a>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </AppProviders>
      </Router>
    </QueryClientProvider>
  );
}

export default App;