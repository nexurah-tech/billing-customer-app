'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, CheckCircle2, ShieldCheck, Play, Smartphone, Key } from 'lucide-react';

export default function WhatsAppPage() {
  const setupSteps = [
    { num: '01', title: 'Twilio Keys', desc: 'Secure Account SID & Auth Token credentials' },
    { num: '02', title: 'Sender Profile', desc: 'Acquire WhatsApp sandbox or business sender number' },
    { num: '03', title: 'Webhook Link', desc: 'Configure instant inbound message delivery callback' },
    { num: '04', title: 'Deploy Portal', desc: 'Activate automatic receipt dispatching at checkout' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageCircle className="text-emerald-500 size-5.5" />
            WhatsApp Notification Gateway
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch automated receipts, low stock alerts, and seasonal offers
            instantly to customer devices
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-slate-600 bg-slate-100 border border-slate-200/40 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs">
          Gateway Offline
        </span>
      </div>

      {/* Visual Roadmap Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {setupSteps.map((step) => (
          <Card
            key={step.num}
            className="p-5 border-slate-200/80 shadow-2xs flex flex-col justify-between gap-4 relative group">
            <div className="flex justify-between items-start">
              <span className="text-2xl font-black text-slate-200 group-hover:text-indigo-500/20 transition-colors">
                {step.num}
              </span>
              <CheckCircle2 size={16} className="text-slate-300" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 leading-snug">
                {step.title}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Configuration Details & Live Chat Mockup preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Twilio mask credentials card */}
        <Card className="p-6 border-slate-200/80 shadow-xs lg:col-span-7 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-2">
              <Key className="text-indigo-500 size-4.5" />
              Twilio API Keys
            </h3>
            <p className="text-[11px] text-slate-500">
              Gateway credentials loaded from environment variables
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Account SID
              </label>
              <input
                type="text"
                value="AC••••••••••••••••••••••••••••••••"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 text-xs font-mono text-slate-500 cursor-not-allowed select-none"
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Auth Token
              </label>
              <input
                type="password"
                value="••••••••••••••••••••••••••••••••"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 text-xs font-mono text-slate-500 cursor-not-allowed select-none"
                disabled
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                WhatsApp Sender Phone
              </label>
              <input
                type="text"
                value="+1 (415) 523-8886 (Twilio Sandbox)"
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 text-xs font-mono text-slate-500 cursor-not-allowed select-none"
                disabled
              />
            </div>
          </div>

          {/* Secure details footer */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200/40 rounded-xl">
            <ShieldCheck className="text-indigo-500 size-5 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-slate-800">
                Connection Security
              </h5>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                Credentials can only be adjusted directly inside the secure
                system environment file (`.env.local`). Please contact your
                terminal system administrator to unlock settings.
              </p>
            </div>
          </div>
        </Card>

        {/* Live Mobile Chat mockup preview */}
        <Card className="p-6 border-slate-200/80 shadow-xs lg:col-span-5 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Smartphone className="text-indigo-500 size-4.5" />
              Receipt Notification Preview
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time mock preview on consumer devices
            </p>
          </div>

          {/* Mobile phone outline frame */}
          <div className="flex-1 border-4 border-slate-900 bg-slate-900 rounded-[32px] p-2.5 shadow-xl max-w-[280px] mx-auto min-h-[360px] flex flex-col">
            {/* Phone Speaker notch */}
            <div className="w-20 h-4.5 bg-slate-900 rounded-full mx-auto mb-2.5 relative flex items-center justify-center shrink-0">
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Chat Screen inside phone */}
            <div className="flex-1 bg-[#efeae2] rounded-[22px] overflow-hidden p-3.5 flex flex-col justify-between relative font-sans">
              {/* WhatsApp Sender Header bar */}
              <div className="absolute top-0 inset-x-0 bg-[#075e54] text-white py-1.5 px-3 flex items-center gap-2 select-none z-10">
                <div className="size-5 rounded-full bg-emerald-600 border border-emerald-400 flex items-center justify-center text-[8px] font-black tracking-wider">
                  NB
                </div>
                <div>
                  <h6 className="text-[9px] font-bold leading-none">
                    NexBill Receipts
                  </h6>
                  <p className="text-[6px] text-emerald-300 font-medium leading-none mt-0.5">
                    Official POS Terminal
                  </p>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-end pt-8 gap-3">
                {/* Chat Timestamp */}
                <span className="text-[7px] bg-slate-25 bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md font-bold self-center shadow-3xs uppercase tracking-wider select-none">
                  Today
                </span>

                {/* WhatsApp Chat Bubble */}
                <div className="bg-white p-3 rounded-2xl rounded-tl-xs text-[9px] max-w-[90%] shadow-2xs leading-relaxed text-slate-800 self-start">
                  <p className="font-extrabold text-indigo-700 select-none">
                    NexBill Receipt 🧾
                  </p>
                  <p className="mt-1">
                    Hello <span className="font-bold">John Doe</span>, thanks
                    for shopping with us!
                  </p>
                  <p className="mt-1">
                    Your invoice{" "}
                    <span className="font-bold">#INV-2026-004</span> is ready.
                  </p>
                  <div className="mt-2 p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[8px] space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Items Count:</span>
                      <span className="font-semibold">3 units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Bill:</span>
                      <span className="font-bold text-slate-900">
                        ₹1,480.00
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-slate-400 select-none text-[7px]">
                    View full PDF receipt link: https://nex.bi/r/7f2a
                  </p>
                  <span className="text-[6px] text-slate-400 text-right block mt-1.5 select-none font-mono">
                    10:18 AM ✓✓
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

