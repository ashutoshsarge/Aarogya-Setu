import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  ExternalLink,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
  Radio,
  Check,
} from 'lucide-react';
import { checkBackendHealth, BackendStatus, SUPABASE_PROJECT_ID, SUPABASE_URL } from '../lib/supabase';
import { Language } from '../types';

interface BackendStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}

export const BackendStatusModal: React.FC<BackendStatusModalProps> = ({
  isOpen,
  onClose,
  language = 'en',
}) => {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);

  const performCheck = async () => {
    setIsChecking(true);
    try {
      const res = await checkBackendHealth();
      setStatus(res);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      performCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySchemaPath = () => {
    navigator.clipboard.writeText('supabase/schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-700">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Supabase Backend Architecture</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  Cloud PostgreSQL
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Aarogya-Setu clinical data layer & real-time sync service
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connectivity Status Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-600" />
              Live Health Status
            </span>
            <button
              onClick={performCheck}
              disabled={isChecking}
              className="text-xs text-teal-700 font-semibold hover:text-teal-900 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
              <span className="text-slate-500 text-[11px]">Supabase Project ID</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{SUPABASE_PROJECT_ID}</span>
              <span className="text-[10px] text-teal-600 truncate mt-1">{SUPABASE_URL}</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
              <span className="text-slate-500 text-[11px]">Connection & Ping</span>
              <div className="flex items-center gap-2 mt-0.5">
                {status?.isConnected ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Connecting...
                  </span>
                )}
                {status?.latencyMs !== undefined && (
                  <span className="text-[10px] text-slate-400 font-mono">({status.latencyMs}ms)</span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">
                {status?.hasTables
                  ? 'All 7 PostgreSQL tables live & synced'
                  : 'Tables pending migration in SQL Editor'}
              </span>
            </div>
          </div>

          {/* Status Message Alert */}
          {status && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                status.hasTables
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              {status.hasTables ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <span className="font-semibold block">{status.message}</span>
                {!status.hasTables && (
                  <span className="text-[11px] text-amber-700 block">
                    Execute the generated migration script in the Supabase SQL Editor to activate PostgreSQL storage. The app is currently using offline-first resilient mode.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Database Tables & Schema Overview */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            Configured Public Schema Tables
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { name: 'patients', desc: 'Rural health registry & ABHA', live: status?.hasTables },
              { name: 'referrals', desc: 'Digital slips & triage scoring', live: status?.hasTables },
              { name: 'hospitals', desc: 'Facilities, beds & stock', live: status?.hasTables },
              { name: 'mch_records', desc: 'Antenatal care & high-risk', live: status?.hasTables },
              { name: 'chronic_records', desc: 'NCD tracking & refills', live: status?.hasTables },
              { name: 'audit_logs', desc: 'Clinical compliance audit', live: status?.hasTables },
            ].map((tbl) => (
              <div
                key={tbl.name}
                className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-800 text-[11px]">
                    {tbl.name}
                  </span>
                  {tbl.live ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1">{tbl.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Setup / Migration Guide */}
        <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-3 text-xs text-teal-950">
          <div className="flex items-center gap-2 font-bold text-teal-900">
            <Zap className="w-4 h-4 text-teal-600" />
            <span>How to Run the Migration (1-Minute Setup)</span>
          </div>

          <ol className="list-decimal list-inside space-y-1.5 text-teal-900/90 leading-relaxed text-[11px]">
            <li>
              Open your Supabase dashboard at{' '}
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline text-teal-800 hover:text-teal-950 inline-flex items-center gap-1"
              >
                <span>Supabase SQL Editor</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              Open the migration files:
              <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-teal-300 ml-1">
                supabase/auth_profiles.sql
              </span>{' '}
              and{' '}
              <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-teal-300">
                supabase/schema.sql
              </span>.
            </li>
            <li>Copy and paste the SQL into the Supabase SQL Editor and click <strong>Run</strong>.</li>
            <li>
              Click <strong>Test Connection</strong> above to verify all tables and seed data are active!
            </li>
          </ol>

          <div className="flex items-center gap-2 pt-1">
            <a
              href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold flex items-center gap-1.5 transition text-xs shadow-xs"
            >
              <span>Open Supabase SQL Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleCopySchemaPath}
              className="px-3 py-2 rounded-xl bg-white border border-teal-300 hover:bg-teal-100/50 text-teal-900 font-semibold flex items-center gap-1.5 transition text-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Path Copied!' : 'Copy File Path'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
