import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/forms/FormInput';
import SocialAuthButton from '../components/common/SocialAuthButton';

export default function Signup() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Mock signup → auto-login
      await loginWithGoogle();
      const userStr = localStorage.getItem('joblify_user');
      const role = userStr ? JSON.parse(userStr).role : 'user';
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      const userStr = localStorage.getItem('joblify_user');
      const role = userStr ? JSON.parse(userStr).role : 'user';
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      setErrors({ submit: 'Google signup failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Create Account</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Join JoblifyHQ to save opportunities & track applications.</p>
      
      <SocialAuthButton onClick={handleGoogle} />
      
      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
        <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
        <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput 
          label="Full Name" 
          value={form.name} 
          onChange={(e) => setForm({...form, name: e.target.value})} 
          error={errors.name} 
          placeholder="John Doe" 
        />
        <FormInput 
          label="Email" 
          type="email" 
          value={form.email} 
          onChange={(e) => setForm({...form, email: e.target.value})} 
          error={errors.email} 
          placeholder="you@example.com" 
        />
        <FormInput 
          label="Password" 
          type="password" 
          value={form.password} 
          onChange={(e) => setForm({...form, password: e.target.value})} 
          error={errors.password} 
          placeholder="••••••••" 
        />
        <FormInput 
          label="Confirm Password" 
          type="password" 
          value={form.confirmPassword} 
          onChange={(e) => setForm({...form, confirmPassword: e.target.value})} 
          error={errors.confirmPassword} 
          placeholder="••••••••" 
        />
        
        {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}
        
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
        Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
