import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useForm } from '../hooks/useForm';
import * as yup from 'yup';
import toast from 'react-hot-toast';

// Login Component
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const from = location.state?.from?.pathname || '/dashboard';

  // Validation schema
  const validationSchema = yup.object({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
  });

  // Form handling
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    { username: '', password: '' },
    validationSchema
  );

  const onSubmit = async (formValues) => {
    const result = await login(formValues.username, formValues.password);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-3 rounded-lg ${
          isDark 
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
            : 'bg-white text-gray-600 hover:bg-gray-100'
        } shadow-lg transition-colors duration-200`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className={`max-w-md w-full space-y-8 p-10 rounded-xl shadow-2xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div>
          <div className="flex justify-center">
            <span className="text-6xl">🏠</span>
          </div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Smart Home System
          </h2>
          <p className={`mt-2 text-center text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Sign in to control your home
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit);
        }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } ${touched.username && errors.username ? 'border-red-500' : ''}`}
                placeholder="Enter your username"
              />
              {touched.username && errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } ${touched.password && errors.password ? 'border-red-500' : ''}`}
                placeholder="Enter your password"
              />
              {touched.password && errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className={`ml-2 block text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-900'
              }`}>
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Demo Credentials:
            </p>
            <p className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Username: admin | Password: admin123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Register Component
const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Validation schema
  const validationSchema = yup.object({
    username: yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must be at most 20 characters'),
    email: yup.string()
      .required('Email is required')
      .email('Invalid email format'),
    first_name: yup.string().required('First name is required'),
    last_name: yup.string().required('Last name is required'),
    phone_number: yup.string()
      .matches(/^\+?[\d\s-]{10,}$/, 'Invalid phone number'),
    password: yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number'),
    password2: yup.string()
      .required('Please confirm your password')
      .oneOf([yup.ref('password')], 'Passwords must match'),
  });

  // Form handling
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
    {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      password: '',
      password2: '',
    },
    validationSchema
  );

  const onSubmit = async (formValues) => {
    const { password2, ...userData } = formValues;
    const result = await register(userData);
    if (result.success) {
      navigate('/dashboard');
      toast.success('Registration successful! Welcome to SmartHome.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-3 rounded-lg ${
          isDark 
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
            : 'bg-white text-gray-600 hover:bg-gray-100'
        } shadow-lg transition-colors duration-200`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className={`max-w-2xl w-full space-y-8 p-10 rounded-xl shadow-2xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div>
          <div className="flex justify-center">
            <span className="text-6xl">🏠</span>
          </div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Create Account
          </h2>
          <p className={`mt-2 text-center text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Join the Smart Home revolution
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit);
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div className="md:col-span-2">
              <label htmlFor="username" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Username *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } ${touched.username && errors.username ? 'border-red-500' : ''}`}
                placeholder="Choose a username"
              />
              {touched.username && errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } ${touched.email && errors.email ? 'border-red-500' : ''}`}
                placeholder="your@email.com"
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="first_name" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                First Name *
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                required
                value={values.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } ${touched.first_name && errors.first_name ? 'border-red-500' : ''}`}
                placeholder="John"
              />
              {touched.first_name && errors.first_name && (
                <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Last Name *
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                required
                value={values.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } ${touched.last_name && errors.last_name ? 'border-red-500' : ''}`}
                placeholder="Doe"
              />
              {touched.last_name && errors.last_name && (
                <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="md:col-span-2">
              <label htmlFor="phone_number" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                autoComplete="tel"
                value={values.phone_number}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } ${touched.phone_number && errors.phone_number ? 'border-red-500' : ''}`}
                placeholder="+1234567890"
              />
              {touched.phone_number && errors.phone_number && (
                <p className="mt-1 text-sm text-red-500">{errors.phone_number}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } ${touched.password && errors.password ? 'border-red-500' : ''}`}
                placeholder="********"
              />
              {touched.password && errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="password2" className={`block text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Confirm Password *
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                required
                value={values.password2}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } ${touched.password2 && errors.password2 ? 'border-red-500' : ''}`}
                placeholder="********"
              />
              {touched.password2 && errors.password2 && (
                <p className="mt-1 text-sm text-red-500">{errors.password2}</p>
              )}
            </div>
          </div>

          {/* Password requirements */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Password requirements:
            </p>
            <ul className="text-xs space-y-1">
              <li className={values.password.length >= 8 ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-500'}>
                ✓ At least 8 characters
              </li>
              <li className={/[A-Z]/.test(values.password) ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-500'}>
                ✓ At least one uppercase letter
              </li>
              <li className={/[a-z]/.test(values.password) ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-500'}>
                ✓ At least one lowercase letter
              </li>
              <li className={/[0-9]/.test(values.password) ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-500'}>
                ✓ At least one number
              </li>
            </ul>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Forgot Password Component
const ForgotPassword = () => {
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Password reset email sent!');
    }, 1500);
  };

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <button
          onClick={toggleTheme}
          className={`absolute top-4 right-4 p-3 rounded-lg ${
            isDark 
              ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          } shadow-lg transition-colors duration-200`}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <div className={`max-w-md w-full space-y-8 p-10 rounded-xl shadow-2xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div>
            <div className="flex justify-center">
              <span className="text-6xl">✉️</span>
            </div>
            <h2 className={`mt-6 text-center text-3xl font-extrabold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Check Your Email
            </h2>
            <p className={`mt-2 text-center text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Return to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <button
        onClick={toggleTheme}
        className={`absolute top-4 right-4 p-3 rounded-lg ${
          isDark 
            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
            : 'bg-white text-gray-600 hover:bg-gray-100'
        } shadow-lg transition-colors duration-200`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className={`max-w-md w-full space-y-8 p-10 rounded-xl shadow-2xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div>
          <div className="flex justify-center">
            <span className="text-6xl">🔐</span>
          </div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Forgot Password?
          </h2>
          <p className={`mt-2 text-center text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Send Reset Link'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              ← Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// Protected Route Component
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Export all auth components
export { Login, Register, ForgotPassword };