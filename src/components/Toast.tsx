import React from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const Toast: React.FC = () => {
  const { toast } = usePortfolio();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-500/30 bg-[#0e2a1b]",
    error: "border-rose-500/30 bg-[#2d1217]",
    info: "border-blue-500/30 bg-[#10243e]",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div
        id="notification-toast"
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm font-medium text-[#f0f6fc] max-w-md ${
          borders[toast.type]
        }`}
      >
        {icons[toast.type]}
        <span className="flex-1">{toast.message}</span>
      </div>
    </div>
  );
};
