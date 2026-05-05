import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/forms/FormInput';
import SocialAuthButton from '../components/common/SocialAuthButton';

export default function Login() {
  const { login, loginWithGoogle, error: authError, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    setLocalError('');
  };

  // Handle Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSubmitting(true);

    // 1. Simple Validation
    if (!form.email || !form.password) {
      setLocalError('Please enter both email and password.');
      setSubmitting(false);
      return;
    }

    try {
      // 2. Attempt Login
      await login(form.email, form.password);
      // 3. Redirect on success
      navigate('/');
    } catch (err) {
      console.error('Login Error:', err.code);
      
      // 4. Friendly Error Messages based on Firebase codes
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setLocalError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setLocalError('No account found with this email. Please sign up.');
      } else if (err.code === 'auth/too-many-requests') {
        setLocalError('Too many failed attempts. Please try again later or reset password.');
      } else if (err.code === 'auth/invalid-email') {
        setLocalError('Invalid email address format.');
      } else {
        setLocalError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setLocalError('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      console.error('Google Login Error:', err.code);

      if (err.code === 'auth/popup-closed-by-user') {
        setLocalError('Sign-in cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setLocalError('Popup blocked. Please allow popups for this site.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setLocalError('Google login is not enabled for this domain. Try email/password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setLocalError('Google login is not enabled. Please contact support.');
      } else {
        setLocalError(err.message || 'Google sign-in failed. Try email/password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Sign in to access your dashboard</p>
        </div>

        {/* Google Login Button */}
        <SocialAuthButton onClick={handleGoogleLogin} label="Continue with Google" />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput 
            label="Email Address" 
            type="email" 
            value={form.email} 
            onChange={(e) => handleInputChange('email', e.target.value)} 
            error={localError && !form.email ? 'Email is required' : ''} 
            placeholder="you@example.com" 
          />

          <FormInput 
            label="Password" 
            type="password" 
            value={form.password} 
            onChange={(e) => handleInputChange('password', e.target.value)} 
            error={localError && !form.password ? 'Password is required' : ''} 
            placeholder="••••••••" 
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-500 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Forgot password?
            </Link>
          </div>

          {/* Error Alert */}
          {(authError || localError) && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg text-center animate-pulse">
              {authError || localError}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={submitting || authLoading} 
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting || authLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
