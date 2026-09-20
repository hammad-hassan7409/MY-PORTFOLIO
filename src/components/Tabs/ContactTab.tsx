import React, { useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  MapPin,
  Linkedin,
  Github,
  Twitter,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";

export const ContactTab: React.FC = () => {
  const { profile, sendMessage, showToast } = usePortfolio();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await sendMessage({ name, email, subject, message });
    setSubmitting(false);

    if (res.success) {
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } else {
      setError(res.message || "Failed to send message. Please try again or email directly.");
    }
  };

  const handleCopyEmail = () => {
    if (profile?.email) {
      navigator.clipboard.writeText(profile.email);
      setCopied(true);
      showToast(`Copied ${profile.email} to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Working Contact Form */}
        <div className="lg:col-span-2 border border-[#30363d] rounded-lg p-6 sm:p-8 bg-[#161b22] space-y-6">
          <div className="border-b border-[#30363d] pb-4">
            <h2 className="text-lg font-bold text-[#f0f6fc] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#58a6ff]" />
              <span>Send a Message / Inquire</span>
            </h2>
            <p className="text-xs text-[#8b949e] mt-1">
              Have an opening, a freelance project, or an architecture consultation in mind? Drop a message below and I will get back to you promptly.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-lg bg-[#0e2a1b] border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#39d353] mx-auto animate-bounce" />
              <h3 className="text-base font-bold text-[#f0f6fc]">
                Message Delivered Successfully!
              </h3>
              <p className="text-xs text-[#c9d1d9] max-w-md mx-auto leading-relaxed">
                Thank you for reaching out. Your inquiry has been securely routed to my inbox and admin notifications. I typically reply within 12-24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 px-4 py-2 text-xs font-semibold text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#c9d1d9]">
                    Your Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="contact-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3.5 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#c9d1d9]">
                    Your Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="contact-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full px-3.5 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#c9d1d9]">
                  Subject
                </label>
                <input
                  id="contact-subject-input"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Full Stack Role / MVP Project Inquiry"
                  className="w-full px-3.5 py-2 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#c9d1d9]">
                  Message <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="contact-message-input"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me a bit about your project, timeline, tech requirements, or role details..."
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded-md text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none transition-colors resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#8b949e]">
                  <Clock className="w-3.5 h-3.5 text-[#39d353]" />
                  <span>Typically responds within ~12 hours</span>
                </div>

                <button
                  id="contact-submit-btn"
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 rounded-md transition-colors shadow-sm cursor-pointer"
                >
                  {submitting ? (
                    <span>Sending message...</span>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right 1 Col: Direct Contact Cards & Status */}
        <div className="space-y-4">
          {/* Availability Card */}
          <div className="border border-[#30363d] rounded-lg p-5 bg-[#161b22] space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f0f6fc]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#39d353] animate-ping" />
              <span>Current Availability</span>
            </div>
            <p className="text-xs text-[#c9d1d9] leading-relaxed">
              Open to high-impact <strong className="text-[#f0f6fc]">Full-Time Web Developer Positions</strong> and select <strong className="text-[#f0f6fc]">Contract/Consulting</strong> projects.
            </p>
            <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]/60 text-[11px] text-[#8b949e] font-mono">
              Timezone: UTC+5 (Overlap with US & EU hours)
            </div>
          </div>

          {/* Direct Email Card */}
          <div className="border border-[#30363d] rounded-lg p-5 bg-[#161b22] space-y-3">
            <div className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
              Direct Contact
            </div>

            <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d]/60 flex items-center justify-between">
              <div className="truncate pr-2">
                <div className="text-[10px] text-[#8b949e]">Email Address</div>
                <div className="text-xs font-medium text-[#58a6ff] truncate">
                  {profile?.email || "hammadhassan7409@gmail.com"}
                </div>
              </div>
              <button
                onClick={handleCopyEmail}
                className="p-1.5 text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] rounded border border-[#30363d] hover:border-[#8b949e]"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#39d353]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <a
                id="contact-whatsapp-direct-link"
                href={`https://wa.me/${(profile?.whatsapp || "+923004236885").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello Hammad, I saw your portfolio and would like to discuss hiring you for a project!")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded bg-[#0d1117] hover:bg-[#25D366]/15 text-xs text-[#c9d1d9] hover:text-[#25D366] border border-[#30363d]/60 hover:border-[#25D366]/40 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                    <MessageCircle className="w-3 h-3 fill-current" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#f0f6fc] group-hover:text-[#25D366]">WhatsApp Direct Chat</span>
                    <span className="text-[10px] text-[#8b949e] block">+92 300 4236885</span>
                  </div>
                </div>
                <span className="text-[#25D366] text-[10px] font-medium">Chat Now →</span>
              </a>

              <a
                href={profile?.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded bg-[#0d1117] hover:bg-[#21262d] text-xs text-[#c9d1d9] border border-[#30363d]/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-[#0a66c2]" />
                  <span>LinkedIn Profile</span>
                </div>
                <span className="text-[#8b949e] text-[10px]">Connect →</span>
              </a>

              <a
                href={profile?.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded bg-[#0d1117] hover:bg-[#21262d] text-xs text-[#c9d1d9] border border-[#30363d]/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-[#f0f6fc]" />
                  <span>GitHub Profile</span>
                </div>
                <span className="text-[#8b949e] text-[10px]">Follow →</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
