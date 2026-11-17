import { useState } from 'react';
import { X, User, Lock, CheckCircle2, LogOut } from 'lucide-react';
import { updateUserPassword, updateUserProfile } from '../services/realEstateService';

const EGYPT_PHONE_REGEX = /^01[0125][0-9]{8}$/;

export default function AccountModal({
  currentUser,
  savedCount,
  onUpdateUser,
  onLogout,
  onClose,
}) {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const inputStyle =
    'w-full px-3 py-2.5 text-sm bg-white dark:bg-[#111111] border border-black/15 dark:border-white/15 text-[#111111] dark:text-white focus:outline-none focus:border-[#C59B27]';

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (phone.trim() && !EGYPT_PHONE_REGEX.test(phone.trim())) {
      setError('Please enter a valid 11-digit Egyptian mobile number (e.g. 010xxxxxxxx).');
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await updateUserProfile({ name, phone });
      onUpdateUser(updated);
      setSuccess('Profile details updated.');
    } catch (err) {
      setError(err.message || 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSavingPass(true);
    try {
      await updateUserPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully.');
    } catch (err) {
      setError(err.message || 'Could not update password.');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#161616] border border-black/15 dark:border-white/15 max-w-lg w-full p-6 space-y-6 animate-modal-in">
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C59B27] font-semibold">
              DarCom Profile
            </p>
            <h2 className="text-xl font-semibold text-[#111111] dark:text-white mt-0.5">
              My Account
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-black/15 dark:border-white/15 text-[#111111] dark:text-white hover:border-[#C59B27] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-[#FAF8F5] dark:bg-[#111111] border border-black/10 dark:border-white/10 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-[#111111]/55 dark:text-white/55">Email</p>
            <p className="font-semibold text-[#111111] dark:text-white mt-0.5 truncate">
              {currentUser.email}
            </p>
          </div>
          <div>
            <p className="text-[#111111]/55 dark:text-white/55">Account Type</p>
            <p className="font-semibold text-[#C59B27] uppercase mt-0.5">
              {currentUser.role} • {savedCount} Saved
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[#111111] dark:text-white flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Personal Details</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className={inputStyle}
            />
            <input
              type="tel"
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Mobile (010xxxxxxxx)"
              className={inputStyle}
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="w-full py-2.5 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-xs font-semibold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {savingProfile ? 'Saving...' : 'Save Personal Details'}
          </button>
        </form>

        <form
          onSubmit={handleChangePassword}
          className="space-y-3 pt-4 border-t border-black/10 dark:border-white/10"
        >
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[#111111] dark:text-white flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Change Password</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (6+ chars)"
              className={inputStyle}
            />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={inputStyle}
            />
          </div>
          <button
            type="submit"
            disabled={savingPass}
            className="w-full py-2.5 bg-[#111111] dark:bg-[#C59B27] text-white dark:text-[#111111] text-xs font-semibold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {savingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="pt-3 border-t border-black/10 dark:border-white/10 flex justify-end">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}