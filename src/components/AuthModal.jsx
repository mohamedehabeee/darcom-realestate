import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  loginUser,
  registerUser,
  signInWithGoogle,
  sendPasswordReset,
  updateUserPassword,
} from '../services/realEstateService';

const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/;

export default function AuthModal({ initialMode = 'login', onSuccess, onClose }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const inputStyle =
    'w-full px-3 py-2.5 text-sm bg-white dark:bg-[#111111] border border-black/15 dark:border-white/15 text-[#111111] dark:text-white focus:outline-none focus:border-[#C59B27]';

  const handleGoogleAuth = async () => {
    setError('');
    setMessage('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google authentication failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (mode === 'register' && !EGYPT_PHONE_REGEX.test(phone.trim())) {
      setError('Please enter a valid 11-digit Egyptian mobile number (e.g. 010xxxxxxxx).');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'forgot') {
        await sendPasswordReset(email);
        setMessage('Password reset link sent! Check your email inbox.');
      } else if (mode === 'reset') {
        await updateUserPassword(password);
        setMessage('Password updated successfully. You can now continue.');
        setTimeout(() => onClose(), 1200);
      } else if (mode === 'login') {
        const user = await loginUser({ email, password });
        onSuccess(user);
      } else {
        const user = await registerUser({ name, email, phone, password });
        onSuccess(user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: 'Sign In',
    register: 'Create Account',
    forgot: 'Reset Password',
    reset: 'Set New Password',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161616] border border-black/15 dark:border-white/15 max-w-md w-full p-6 animate-modal-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
              DarCom Account
            </p>
            <h2 className="text-xl font-semibold text-[#111111] dark:text-white mt-0.5">
              {titles[mode]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {(mode === 'login' || mode === 'register') && (
          <div className="grid grid-cols-2 border border-black/15 dark:border-white/15 mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setMessage(''); }}
              className={`py-2.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#111111] text-white dark:bg-[#C59B27] dark:text-[#111111]'
                  : 'text-[#111111]/70 dark:text-white/70'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setMessage(''); }}
              className={`py-2.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#111111] text-white dark:bg-[#C59B27] dark:text-[#111111]'
                  : 'text-[#111111]/70 dark:text-white/70'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 text-xs bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            {message}
          </div>
        )}

        {(mode === 'login' || mode === 'register') && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-black/15 dark:border-white/15 bg-white dark:bg-[#111111] text-[#111111] dark:text-white text-sm font-medium hover:border-[#C59B27] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z" />
                <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" />
                <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
              </svg>
              <span>
                {googleLoading
                  ? 'Redirecting to Google...'
                  : mode === 'register'
                  ? 'Sign up with Google'
                  : 'Continue with Google'}
              </span>
            </button>

            <div className="relative my-5 flex items-center justify-center">
              <div className="w-full border-t border-black/10 dark:border-white/10" />
              <span className="absolute bg-white dark:bg-[#161616] px-3 text-[11px] uppercase tracking-wider text-[#111111]/45 dark:text-white/45">
                or with email
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1 text-[#111111]/75 dark:text-white/75">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-[#111111]/75 dark:text-white/75">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="01012345678"
                  className={inputStyle}
                />
              </div>
            </>
          )}

          {mode !== 'reset' && (
            <div>
              <label className="block text-xs font-medium mb-1 text-[#111111]/75 dark:text-white/75">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={inputStyle}
              />
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#111111]/75 dark:text-white/75">
                  {mode === 'reset' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}
                    className="text-xs text-[#C59B27] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={inputStyle}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
          >
            {loading
              ? 'Please wait...'
              : mode === 'forgot'
              ? 'Send Reset Link'
              : mode === 'reset'
              ? 'Update Password'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setMessage(''); }}
              className="w-full text-xs text-center text-[#111111]/60 dark:text-white/60 hover:text-[#C59B27] cursor-pointer"
            >
              ← Back to Sign In
            </button>
          )}
        </form>
      </div>
    </div>
  );
}