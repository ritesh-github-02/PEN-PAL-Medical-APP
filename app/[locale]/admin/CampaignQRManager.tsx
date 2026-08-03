'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { createCampaign, toggleCampaignStatus, getCampaigns } from './actions';
import {
  QrCode,
  Plus,
  Copy,
  Download,
  Check,
  X,
  ExternalLink,
  Power,
  ShieldCheck,
  Smartphone,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface CampaignItem {
  id: string;
  name: string;
  slug: string;
  arm: string;
  status: string;
  createdAt: Date | string;
  totalScans: number;
}

export function CampaignQRManager({ initialCampaigns }: { initialCampaigns?: CampaignItem[] }) {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [arm, setArm] = useState<'INTERVENTION' | 'CONTROL'>('INTERVENTION');

  // Preview & Generated Item State inside modal
  const [generatedLink, setGeneratedLink] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Derive origin safely on client
  const [origin, setOrigin] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const refreshCampaigns = async () => {
    const res = await getCampaigns();
    if (res.success && res.campaigns) {
      setCampaigns(res.campaigns);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createCampaign(name, arm);
      if (!res.success || !res.campaign) {
        setError(res.error || 'Failed to create campaign');
        setLoading(false);
        return;
      }

      const campaign = res.campaign;
      const armParam = campaign.arm.toLowerCase();
      const link = `${origin || 'https://domain.com'}/join?arm=${armParam}&campaign=${encodeURIComponent(campaign.slug)}`;

      const qrUrl = await QRCode.toDataURL(link, {
        width: 400,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      setGeneratedLink(link);
      setQrDataUrl(qrUrl);
      await refreshCampaigns();
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating QR code.');
    } finally {
      setLoading(false);
    }
  };

  const generateQrForLink = async (link: string): Promise<string> => {
    return QRCode.toDataURL(link, {
      width: 600,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = async (link: string, filename: string) => {
    const dataUrl = await generateQrForLink(link);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${filename}_QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    await toggleCampaignStatus(id, nextStatus);
    await refreshCampaigns();
  };

  const resetForm = () => {
    setName('');
    setArm('INTERVENTION');
    setGeneratedLink('');
    setQrDataUrl('');
    setError(null);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <QrCode className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Study QR Codes & Campaign Manager
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-light pl-9">
            Generate poster QR codes and general self-service links for automatic passwordless access.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Campaign QR & Link
        </button>
      </div>

      {/* Roster Table / Campaign Cards */}
      {campaigns.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl">
          <QrCode className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">No campaigns generated yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-light">
            Click the button above to generate a new campaign poster QR code or general invitation link.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 rounded-l-lg font-bold">Campaign Name</th>
                <th className="py-3 px-4 font-bold">Study Arm</th>
                <th className="py-3 px-4 font-bold text-center">Total Participant Scans</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 text-right rounded-r-lg font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((item) => {
                const link = `${origin || 'https://domain.com'}/join?arm=${item.arm.toLowerCase()}&campaign=${encodeURIComponent(item.slug)}`;
                const isActive = item.status === 'ACTIVE';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{item.name}</div>
                      <div className="text-[10px] font-mono font-normal text-slate-400 mt-0.5">
                        slug: {item.slug}
                      </div>
                    </td>

                    {/* Study Arm */}
                    <td className="py-3.5 px-4">
                      {item.arm === 'INTERVENTION' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60 font-mono">
                          <Smartphone className="w-3 h-3" />
                          Intervention App
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          <BookOpen className="w-3 h-3 text-slate-500" />
                          Control Handout
                        </span>
                      )}
                    </td>

                    {/* Total Scans */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 text-sm">
                      {item.totalScans}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                          Deactivated
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopy(link, item.id)}
                          title="Copy Direct Link"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDownload(link, item.slug)}
                          title="Download QR Code (PNG)"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggle(item.id, item.status)}
                          title={isActive ? 'Deactivate Campaign' : 'Activate Campaign'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isActive
                              ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Popup Workflow */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600/30 border border-indigo-400/30 rounded-xl text-indigo-300">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight">Create Campaign QR & Link</h3>
                  <p className="text-[11px] text-slate-400 font-light">Generate passwordless scan access</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Campaign Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Waiting Room A Poster or Email Campaign 1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>

                {/* Study Arm Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Study Arm Selection
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex flex-col p-3.5 border rounded-xl cursor-pointer transition-all ${
                        arm === 'INTERVENTION'
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="arm"
                          value="INTERVENTION"
                          checked={arm === 'INTERVENTION'}
                          onChange={() => setArm('INTERVENTION')}
                          className="accent-indigo-600"
                        />
                        <span className="text-xs font-bold text-slate-900">Intervention App</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 pl-5">
                        Interactive clinical wizard (/join?arm=intervention)
                      </span>
                    </label>

                    <label
                      className={`flex flex-col p-3.5 border rounded-xl cursor-pointer transition-all ${
                        arm === 'CONTROL'
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="arm"
                          value="CONTROL"
                          checked={arm === 'CONTROL'}
                          onChange={() => setArm('CONTROL')}
                          className="accent-indigo-600"
                        />
                        <span className="text-xs font-bold text-slate-900">Control Handout</span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 pl-5">
                        Baseline info portal (/join?arm=control)
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Generating QR Code & Link...' : 'Generate Campaign Link & QR Code'}
                </button>
              </form>

              {/* Output Display & Instant Actions */}
              {generatedLink && qrDataUrl && (
                <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                  <div className="text-center space-y-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      QR Code & Link Ready
                    </span>
                  </div>

                  {/* QR Image Preview */}
                  <div className="flex justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <img src={qrDataUrl} alt="QR Code Preview" className="w-48 h-48 rounded-lg shadow-xs" />
                  </div>

                  {/* Link Preview */}
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">General Link</span>
                    <p className="text-xs font-mono text-slate-800 break-all">{generatedLink}</p>
                  </div>

                  {/* Instant Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleCopy(generatedLink, 'modal')}
                      className="inline-flex justify-center items-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      {copiedId === 'modal' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          Link Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Direct Link
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDownload(generatedLink, name.toLowerCase().replace(/\s+/g, '_'))}
                      className="inline-flex justify-center items-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download QR Code (PNG)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
