import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import type { RegisterRequest } from '../../types';

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterRequest & { confirmPassword: string }>();
  const password = watch('password');

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      toast.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h2>
      <p className="text-gray-600 mb-6">Get started with your church management system</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="label">First name</label>
            <input
              type="text"
              id="first_name"
              className={`input ${errors.first_name ? 'input-error' : ''}`}
              placeholder="John"
              {...register('first_name', { required: 'First name is required' })}
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-500">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="last_name" className="label">Last name</label>
            <input
              type="text"
              id="last_name"
              className={`input ${errors.last_name ? 'input-error' : ''}`}
              placeholder="Doe"
              {...register('last_name', { required: 'Last name is required' })}
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-500">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input
            type="email"
            id="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="john@example.com"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="label">Phone number (optional)</label>
          <input
            type="tel"
            id="phone"
            className="input"
            placeholder="+1 (555) 123-4567"
            {...register('phone')}
          />
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            type="password"
            id="password"
            className={`input ${errors.password ? 'input-error' : ''}`}
            placeholder="Create a strong password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">Confirm password</label>
          <input
            type="password"
            id="confirmPassword"
            className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
            placeholder="Confirm your password"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account...
            </span>
          ) : 'Create account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
