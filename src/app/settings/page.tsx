"use client";

import { useState, useEffect } from "react";
import { getLocalSettings, saveLocalSettings, Settings, DEFAULT_SETTINGS } from "@/lib/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [testResult, setTestResult] = useState<{ ok?: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSettings(getLocalSettings());
    setMounted(true);
  }, []);

  const handleSave = (newSettings: Settings) => {
    setSettings(newSettings);
    saveLocalSettings(newSettings);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const resp = await fetch("/api/ai/test", {
        method: "POST",
        body: JSON.stringify({
          mode: settings.ai.mode,
          apiKey: settings.ai.apiKey,
        }),
      });
      const data = await resp.json();
      setTestResult(data);
    } catch (e) {
      setTestResult({ ok: false, message: "Request failed." });
    } finally {
      setTesting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-12 pb-20 max-w-4xl">
      <section className="vv-card p-10">
        <header className="mb-10">
          <div className="text-[11px] tracking-[0.26em] uppercase text-black/50">Preferences</div>
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl text-black">Settings</h1>
          <p className="mt-2 text-black/50 italic font-serif">Local preferences. AI optional.</p>
        </header>

        {/* SECTION 1: AI */}
        <div className="space-y-10">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-6 border-b border-black/5 pb-2">Intelligence (AI)</h3>
            
            <div className="space-y-8">
              {/* AI Mode Selector */}
              <div className="space-y-3">
                 <label className="text-sm font-medium text-black/80">AI Mode</label>
                 <div className="flex bg-black/[0.03] p-1 rounded-xl w-fit border border-black/5">
                    {(['OFF', 'DEMO', 'BYOK'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => handleSave({ ...settings, ai: { ...settings.ai, mode: m } })}
                        className={`px-6 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${
                          settings.ai.mode === m 
                            ? 'bg-white text-black shadow-sm' 
                            : 'text-black/40 hover:text-black/70'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                 </div>
              </div>

              {settings.ai.mode !== 'OFF' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest text-black/40 pl-1">Provider</label>
                       <select
                        disabled
                        className="w-full rounded-xl border border-black/10 bg-white/50 px-5 py-3 outline-none opacity-50 cursor-not-allowed"
                       >
                         <option>Gemini</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest text-black/40 pl-1">API Key</label>
                       <input
                         type="password"
                         value={settings.ai.apiKey}
                         onChange={(e) => handleSave({ ...settings, ai: { ...settings.ai, apiKey: e.target.value } })}
                         placeholder={settings.ai.mode === 'DEMO' ? 'Not required for demo' : 'Enter your key...'}
                         disabled={settings.ai.mode === 'DEMO'}
                         className="w-full rounded-xl border border-black/10 bg-white px-5 py-3 outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50"
                       />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <button
                      onClick={testConnection}
                      disabled={testing}
                      className="vv-btn px-8 py-3 text-sm"
                    >
                      {testing ? 'Testing...' : 'Test connection'}
                    </button>
                    
                    {testResult && (
                      <div className={`text-sm flex items-center gap-2 animate-in zoom-in duration-200 ${testResult.ok ? 'text-emerald-700' : 'text-red-700'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${testResult.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {testResult.message}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: UI */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-6 border-b border-black/5 pb-2">Interface (UI)</h3>
            
            <div className="space-y-6">
               <label className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm font-medium text-black/80">Compact layout</span>
                  <input
                    type="checkbox"
                    checked={settings.ui.compactLayout}
                    onChange={(e) => handleSave({ ...settings, ui: { ...settings.ui, compactLayout: e.target.checked } })}
                    className="h-5 w-5 rounded border-black/10 text-black focus:ring-black/10 transition-colors"
                  />
               </label>

               <label className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm font-medium text-black/80">Reduced motion</span>
                  <input
                    type="checkbox"
                    checked={settings.ui.reducedMotion}
                    onChange={(e) => handleSave({ ...settings, ui: { ...settings.ui, reducedMotion: e.target.checked } })}
                    className="h-5 w-5 rounded border-black/10 text-black focus:ring-black/10 transition-colors"
                  />
               </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
