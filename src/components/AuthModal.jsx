import { useState } from 'react';
import { X } from 'lucide-react';
import { loginUser, registerUser } from '../services/realEstateService';

export default function AuthModal({ onSuccess, onClose }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const inputStyle =
    'w-full px-3 py-2.5 text-sm bg-white dark:bg-[#111111] border border-black/15 dark:border-white/15 text-[#111111] dark:text-white focus:outline-none focus:border-[#C59B27]';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      const user =
        mode === 'login'
          ? loginUser({ email, password })
          : registerUser({ name, email, password });
      onSuccess(user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161616] border border-black/15 dark:border-white/15 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
              DarCom Account
            </p>
            <h2 className="text-xl font-semibold text-[#111111] dark:text-white mt-0.5">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 border border-black/15 dark:border-white/15 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
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
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-2.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-[#111111] text-white dark:bg-[#C59B27] dark:text-[#111111]'
                : 'text-[#111111]/70 dark:text-white/70'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 text-xs bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
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
          )}

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

          <div>
            <label className="block text-xs font-medium mb-1 text-[#111111]/75 dark:text-white/75">
              Password
            </label>
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

          <button
            type="submit"
            className="w-full py-3 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}