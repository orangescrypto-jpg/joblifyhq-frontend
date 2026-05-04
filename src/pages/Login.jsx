import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/forms/FormInput';
import SocialAuthButton from '../components/common/SocialAuthButton';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Call Firebase Login
      await login(form.email, form.password);
      
      // AuthContext handles fetching user data and role.
      // We use a small timeout to let onAuthStateChanged update, 
      // OR we can rely on navigate('/') and let ProtectedRoute handle it.
      // However, for a smoother UX, we can try to navigate immediately.
      // A safer bet with Firebase is to wait for the Auth state or let the app rerender.
      
      // Since our AuthContext is async, let's navigate to home or check role if we have it locally
      // Ideally, we just navigate to a page that requires auth, and ProtectedRoute handles it.
      // But for specific routing based on role immediately:
      
      // We will navigate to root, and the router handles the rest based on loaded user.
      navigate('/'); 
      
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrors({ submit: 'Invalid email or password. Please try again.' });
      } else if (err.code === 'auth/too-many-requests') {
        setErrors({ submit: 'Too many attempts. Please try again later.' });
      } else {
        setErrors({ submit: 'Login failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setErrors({ submit: 'Google sign-in failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Sign in to access your dashboard</p>
        </div>

        <SocialAuthButton onClick={handleGoogle} />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput 
            label="Email Address" 
            type="email" 
            value={form.email} 
            onChange={(e) => handleInputChange('email', e.target.value)} 
            error={errors.email} 
            placeholder="you@example.com"
          />

          <FormInput 
            label="Password" 
            type="password" 
            value={form.password} 
            onChange={(e) => handleInputChange('password', e.target.value)} 
            error={errors.password} 
            placeholder="••••••••"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-500 dark:text-gray-400">
              <input type="checkbox" className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              Remember me
            </label>
            <Link to="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Forgot password?
            </Link>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg text-center">
              {errors.submit}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

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
