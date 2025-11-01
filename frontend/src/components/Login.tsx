import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export function Login({ onNavigate }: Readonly<LoginProps>) {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate required fields for registration
      if (!isLogin) {
        if (!name || !email || !password) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }
      }

      // Validate email
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Validate password for login
        if (!password) {
          setError('Please enter your password');
          setLoading(false);
          return;
        }

        // For login, use password (no OTP)
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            login({ user: data.data.user, token: data.data.token });
            onNavigate('home');
          } else {
            setError(data.message || 'Login failed');
            setLoading(false);
          }
        } else {
          const errorData = await response.json();
          console.error('Login error:', errorData);
          setError(errorData.message || 'Login failed');
          setLoading(false);
        }
        return;
      } else {
        // For registration, create user and send OTP
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name, 
            email, 
            password, 
            ...(phone && phone.trim() && { phone: phone.trim() })
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setShowOTP(true);
          setSuccess(`Registration successful! OTP sent to ${email}. Please check your email and enter the verification code.`);
        } else {
          const errorData = await response.json();
          console.error('Registration error:', errorData);
          setError(errorData.message || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!otp || otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        setLoading(false);
        return;
      }

      // Verify OTP with backend
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Store token and user data
          login({ user: data.data.user, token: data.data.token });
          onNavigate('home');
        } else {
          setError(data.message || 'OTP verification failed');
        }
      } else {
        const data = await response.json();
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate email
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Request password reset OTP
      const response = await fetch('http://localhost:5000/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(`Password reset OTP sent to ${email}. Please check your email and enter the verification code.`);
        setShowOTP(true);
        setShowForgotPassword(true);
      } else {
        const errorData = await response.json();
        console.error('Password reset error:', errorData);
        setError(errorData.message || 'Failed to send password reset OTP');
      }
    } catch (err) {
      console.error('Password reset request error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!otp || otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        setLoading(false);
        return;
      }

      if (!newPassword || newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      // Reset password with OTP
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuccess('Password reset successfully! You can now login with your new password.');
          setTimeout(() => {
            setShowForgotPassword(false);
            setShowOTP(false);
            setIsLogin(true);
            setOtp('');
            setNewPassword('');
            setSuccess('');
          }, 2000);
        } else {
          setError(data.message || 'Password reset failed');
        }
      } else {
        const data = await response.json();
        setError(data.message || 'Password reset failed');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Back button */}
        <button
          onClick={() => onNavigate('home')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Login/Signup Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? 'Sign in to continue booking' : 'Join ShowSewa today'}
            </p>
          </div>

          {/* Toggle Login/Signup */}
          <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => {
                setIsLogin(true);
                setShowOTP(false);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                isLogin
                  ? 'bg-white dark:bg-gray-800 text-red-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setShowOTP(false);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                !isLogin
                  ? 'bg-white dark:bg-gray-800 text-red-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* OTP Form */}
          {showOTP ? (
            <form onSubmit={showForgotPassword ? handleResetPassword : handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Sent to {email}
                </p>
              </div>

              {showForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {showForgotPassword ? 'Resetting...' : 'Verifying...'}
                  </>
                ) : (
                  showForgotPassword ? 'Reset Password' : 'Verify OTP'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowOTP(false);
                  setOtp('');
                  setNewPassword('');
                  setSuccess('');
                  setShowForgotPassword(false);
                }}
                className="w-full text-red-600 hover:text-red-700 font-medium"
              >
                Change Email
              </button>
            </form>
          ) : (
            /* Main Login/Signup Form */
            <form onSubmit={handleSendOTP} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+977 98-00000000"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Sending OTP...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Continue with OTP'
                )}
              </button>

              {isLogin && (
                <div className="flex justify-end">
                  <button type="button" onClick={handleForgotPassword} className="text-sm text-red-600 hover:text-red-700 font-medium">
                    Forgot password?
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Divider */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setShowOTP(false);
                setError('');
                setSuccess('');
              }}
              className="ml-2 text-red-600 hover:text-red-700 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
