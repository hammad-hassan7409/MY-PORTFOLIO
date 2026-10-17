import React, { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { ShieldCheck, Lock, Mail, AlertCircle, X, CheckCircle2, ArrowRight } from "lucide-react";

export const AdminLoginModal: React.FC = () => {
  const { isAdminLoginOpen, setIsAdminLoginOpen, loginAdmin, setActiveTab } = usePortfolio();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAdminLoginOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await loginAdmin(password, email);
    setLoading(false);

    if (result.success) {
      setIsAdminLoginOpen(false);
      setPassword("");
      setEmail("");
      setActiveTab("admin");
    } else {
      setError(result.error || "Authentication failed. Check your password.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setIsAdminLoginOpen(false)}
    >
      <div
        id="admin-login-dialog"
        className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center gap-2 text-[#f0f6fc]">
            <ShieldCheck className="w-5 h-5 text-[#58a6ff]" />
            <h3 className="font-semibold text-sm">Admin Control Suite</h3>
          </div>
          <button
            onClick={() => setIsAdminLoginOpen(false)}
            className="p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded hover:bg-[#21262d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-[#8b949e] leading-relaxed">
            Enter your administrative credentials to manage projects, skills, profile information, and incoming client inquiries.
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#c9d1d9] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#8b949e]" />
              <span>Admin Email</span>
            </label>
            <input
              id="admin-email-input"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin or email"
              autoComplete="username"
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#c9d1d9] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#8b949e]" />
              <span>Admin Password</span>
            </label>
            <input
              id="admin-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAdminLoginOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 rounded-md transition-colors shadow-sm cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
