import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';
import { Smartphone, CheckCircle2, AlertCircle, Copy, Send, HelpCircle, ShieldCheck } from 'lucide-react';

export const AdminWhatsAppPage: React.FC = () => {
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Simulator state
  const [simPhone, setSimPhone] = useState('+15552223333');
  const [simMsg, setSimMsg] = useState('What are the undergraduate admission requirements?');
  const [simOutcome, setSimOutcome] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getConfigs();
        const cfg = res.configs || {};
        setPhoneNumberId(cfg.WHATSAPP_PHONE_ID || '109827364529101');
        setVerifyToken(cfg.WHATSAPP_VERIFY_TOKEN || 'uniassist_whatsapp_verify_token_2026');
        setAccessToken(cfg.WHATSAPP_ACCESS_TOKEN || '');
      } catch {
        // Ignore load error
      }
    }
    load();
  }, []);

  const handleSaveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateConfigs({
        WHATSAPP_PHONE_ID: phoneNumberId,
        WHATSAPP_VERIFY_TOKEN: verifyToken,
        WHATSAPP_ACCESS_TOKEN: accessToken,
      });
      setSuccessMsg('WhatsApp integration configuration saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      // Ignore save error
    } finally {
      setSaving(false);
    }
  };

  const handleSimulateInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setSimOutcome(null);
    try {
      const res = await api.simulateWhatsApp(simPhone, simMsg);
      setSimOutcome(res.simulationResult);
    } catch (err: any) {
      setSimOutcome({ error: err.message });
    } finally {
      setSimulating(false);
    }
  };

  const webhookUrl = `${window.location.origin}/api/whatsapp/webhook`;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">WhatsApp Business Cloud API Settings</h1>
            <p className="text-xs text-slate-500 mt-1">Configure Meta Developer Portal webhooks and credentials</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Official Webhook Handler Active</span>
          </div>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* WhatsApp Credentials & Webhook URL Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Smartphone className="w-5 h-5 text-emerald-500" />
              <span>Meta API Credentials</span>
            </h2>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Webhook Endpoint URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(webhookUrl)}
                  className="p-2 text-slate-600 hover:text-brand-600 bg-white border border-slate-300 rounded-lg"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveConfigs} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Webhook Verify Token</label>
                <input
                  type="text"
                  required
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Phone Number ID</label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="e.g. 109827364529101"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Graph API Access Token</label>
                <textarea
                  rows={3}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="EAAG..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md"
              >
                {saving ? 'Saving...' : 'Save WhatsApp Configuration'}
              </button>
            </form>
          </div>

          {/* Interactive Webhook Simulator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Send className="w-5 h-5 text-brand-500" />
              <span>Interactive Webhook Simulator</span>
            </h2>

            <p className="text-xs text-slate-600">
              Test sending mock student WhatsApp messages directly to the grounded RAG AI engine and verify response payload.
            </p>

            <form onSubmit={handleSimulateInbound} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sender WhatsApp Phone #</label>
                <input
                  type="text"
                  required
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Incoming Student Text Body</label>
                <textarea
                  rows={3}
                  required
                  value={simMsg}
                  onChange={(e) => setSimMsg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={simulating}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                <span>{simulating ? 'Processing...' : 'Simulate Webhook Message'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {simOutcome && (
              <div className="bg-navy-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto space-y-2">
                <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">Simulation Outcome:</div>
                <pre>{JSON.stringify(simOutcome, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
