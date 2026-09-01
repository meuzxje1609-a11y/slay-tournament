import React, { useState } from 'react';
import { Lock, Shield, KeyRound, User, AlertCircle, CheckCircle2, X, Sparkles, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (trimmedUser === 'admin' && trimmedPass === 'admin') {
      setIsSuccess(true);
      setErrorMessage('');
      setTimeout(() => {
        onLoginSuccess();
        onClose();
      }, 700);
    } else {
      setErrorMessage('Tên đăng nhập hoặc mật khẩu không chính xác! (Tài khoản mặc định: admin / admin)');
    }
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="login-modal-container"
        className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl shadow-2xl shadow-indigo-950/60 overflow-hidden"
      >
        {/* Decorative glow header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Đăng Nhập Quản Trị Viên (Admin)
              </h3>
              <p className="text-xs text-slate-400">
                Chỉ dành cho Ban Tổ Chức & Admin giải đấu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {/* Informational banner */}
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-300 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Người xem / khách tự do xem tất cả các giải đấu và bảng đấu. Đăng nhập Admin để tạo giải, xếp lịch và cập nhật tỉ số.
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Đăng nhập Admin thành công! Đang chuyển hướng...</span>
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Tên tài khoản (Username):
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="input-login-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="admin"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 transition-all font-mono"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Mật khẩu (Password):
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="input-login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/50 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Fill Preset Helper */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              id="btn-login-quick-fill"
              onClick={handleQuickFill}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Điền nhanh tài khoản (admin / admin)
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              id="btn-submit-admin-login"
              disabled={isSuccess}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Shield className="w-4 h-4" /> Đăng Nhập Quản Trị
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
