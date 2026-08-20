'use client';

import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Plus,
  Copy,
  Download,
  Check,
  X,
  ExternalLink,
  Power,
  Smartphone,
  BookOpen,
  Search,
  Filter,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Share2,
} from 'lucide-react';

export interface CampaignItem {
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
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DEACTIVATED'>('ALL');
  const [armFilter, setArmFilter] = useState<'ALL' | 'INTERVENTION' | 'CONTROL'>('ALL');

  // Form State inside Modal
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

  // Escape key handler for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Toast timer
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
  };

  const refreshCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch (err) {
      console.error('Failed to reload campaigns:', err);
    }
  };

  // Optimistic & 100% Reliable Toggle Status Function via API
  const handleToggle = async (id: string, currentStatus: string, campaignName: string) => {
    const nextStatus: 'ACTIVE' | 'DEACTIVATED' = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    setTogglingId(id);

    // 1. Instant Optimistic State Update
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
    );

    try {
      const res = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Rollback on failure
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: currentStatus } : c))
        );
        showToast(data.error || 'Failed to update campaign status.', 'error');
      } else {
        showToast(
          `Campaign "${campaignName}" is now ${nextStatus === 'ACTIVE' ? 'Active' : 'Deactivated'}.`,
          'success'
        );
      }
    } catch (err: any) {
      // Rollback on exception
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: currentStatus } : c))
      );
      showToast(err.message || 'Error updating status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, arm }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.campaign) {
        setError(data.error || 'Failed to create campaign');
        setLoading(false);
        return;
      }

      const campaign = data.campaign;
      const armParam = campaign.arm.toLowerCase();
      const link = `${origin || 'https://domain.com'}/join?arm=${armParam}&campaign=${encodeURIComponent(campaign.slug)}`;

      const qrUrl = await QRCode.toDataURL(link, {
        width: 500,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      setGeneratedLink(link);
      setQrDataUrl(qrUrl);
      showToast(`Campaign "${campaign.name}" created successfully!`, 'success');
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
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast('Campaign invitation link copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownload = async (link: string, filename: string) => {
    try {
      const dataUrl = await generateQrForLink(link);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${filename}_QR_Poster.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloaded QR Poster for ${filename}`);
    } catch (err) {
      console.error('Download QR failed', err);
    }
  };

  const resetForm = () => {
    setName('');
    setArm('INTERVENTION');
    setGeneratedLink('');
    setQrDataUrl('');
    setError(null);
  };

  // Filtered list
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        !searchTerm ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesArm = armFilter === 'ALL' || c.arm === armFilter;

      return matchesSearch && matchesStatus && matchesArm;
    });
  }, [campaigns, searchTerm, statusFilter, armFilter]);

  // Statistics
  const totalCount = campaigns.length;
  const activeCount = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const deactivatedCount = campaigns.filter((c) => c.status === 'DEACTIVATED').length;
  const totalScans = campaigns.reduce((acc, c) => acc + (c.totalScans || 0), 0);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden space-y-0">
      
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-50 border-emerald-700'
              : 'bg-rose-900 text-rose-50 border-rose-700'
          }`}
          role="alert"
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header & Creation Trigger */}
      <div className="p-6 border-b border-slate-100 bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300 shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                Study QR Codes & Campaign Manager
              </h2>
              <p className="text-xs text-slate-300 font-light">
                Generate and control self-enrollment poster QR codes and direct links with instant active/deactivated toggling.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Campaign QR
        </button>
      </div>

      {/* Summary KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-slate-50/70 border-b border-slate-100">
        <div className="p-4 flex items-center gap-3">
          <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700 shadow-2xs">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Campaigns</p>
            <p className="text-lg font-extrabold font-mono text-slate-900">{totalCount}</p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Posters</p>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold font-mono text-emerald-700">{activeCount}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3">
          <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 shadow-2xs">
            <Power className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deactivated</p>
            <p className="text-lg font-extrabold font-mono text-slate-600">{deactivatedCount}</p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 shadow-2xs">
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Participant Scans</p>
            <p className="text-lg font-extrabold font-mono text-indigo-900">{totalScans}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-slate-100 bg-white flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns by name or slug (e.g. clinic_poster)..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All ({campaigns.length})</option>
              <option value="ACTIVE">Active ({activeCount})</option>
              <option value="DEACTIVATED">Deactivated ({deactivatedCount})</option>
            </select>
          </div>

          {/* Arm Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">Arm:</span>
            <select
              value={armFilter}
              onChange={(e) => setArmFilter(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Arms</option>
              <option value="INTERVENTION">Intervention</option>
              <option value="CONTROL">Control</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/50">
          <QrCode className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No campaigns found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-light">
            {searchTerm || statusFilter !== 'ALL' || armFilter !== 'ALL'
              ? 'Try clearing your filters or search keywords.'
              : 'Click "Create New Campaign QR" to generate your first study campaign.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-500 font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-5 font-bold">Campaign Name & Slug</th>
                <th className="py-3 px-5 font-bold">Study Arm</th>
                <th className="py-3 px-5 font-bold text-center">Total Scans</th>
                <th className="py-3 px-5 font-bold text-center">Access Status</th>
                <th className="py-3 px-5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.map((item) => {
                const link = `${origin || 'https://domain.com'}/join?arm=${item.arm.toLowerCase()}&campaign=${encodeURIComponent(item.slug)}`;
                const isActive = item.status === 'ACTIVE';
                const isToggling = togglingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
                    {/* Name & Slug */}
                    <td className="py-4 px-5">
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        {item.name}
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active"></span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">slug</span>
                        <span>{item.slug}</span>
                      </div>
                    </td>

                    {/* Study Arm */}
                    <td className="py-4 px-5">
                      {item.arm === 'INTERVENTION' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80 font-mono">
                          <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                          Intervention App
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200/90 font-mono">
                          <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                          Control Handout
                        </span>
                      )}
                    </td>

                    {/* Total Scans */}
                    <td className="py-4 px-5 text-center font-mono font-extrabold text-slate-900 text-sm">
                      <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                        {item.totalScans}
                      </span>
                    </td>

                    {/* Status & Interactive Toggle Pill */}
                    <td className="py-4 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(item.id, item.status, item.name)}
                        disabled={isToggling}
                        title={`Click to ${isActive ? 'Deactivate' : 'Activate'} campaign`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                          isActive
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                        } ${isToggling ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
                        ) : (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          ></span>
                        )}
                        <span>{isActive ? 'Active' : 'Deactivated'}</span>
                      </button>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Copy Link Button */}
                        <button
                          type="button"
                          onClick={() => handleCopy(link, item.id)}
                          title="Copy Direct Invitation Link"
                          className="flex items-center gap-1 px-2.5 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-600" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        {/* Download QR Poster Button */}
                        <button
                          type="button"
                          onClick={() => handleDownload(link, item.slug)}
                          title="Download High-Res QR Code Poster (PNG)"
                          className="flex items-center gap-1 px-2.5 py-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-600" />
                          <span>QR Poster</span>
                        </button>

                        {/* Direct Toggle Action Button */}
                        <button
                          type="button"
                          onClick={() => handleToggle(item.id, item.status, item.name)}
                          disabled={isToggling}
                          title={isActive ? 'Deactivate this campaign access' : 'Activate this campaign access'}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border active:scale-95 ${
                            isActive
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                          } ${isToggling ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Power className="w-3.5 h-3.5" />
                          )}
                          <span>{isActive ? 'Deactivate' : 'Activate'}</span>
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

      {/* ================= MODAL: CREATE CAMPAIGN QR ================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="campaign-modal-title"
        >
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600/30 border border-indigo-400/30 rounded-xl text-indigo-300" aria-hidden="true">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="campaign-modal-title" className="font-extrabold text-sm tracking-tight text-white">
                    Create Campaign QR & Link
                  </h3>
                  <p className="text-[11px] text-slate-300 font-light">
                    Generate passwordless access for clinic posters and study flyers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close create campaign dialog"
                className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Campaign Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Campaign / Poster Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clinic Room A Poster, General Pediatric Flyer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    A unique web slug will automatically be derived from this name.
                  </p>
                </div>

                {/* Study Arm Selector Cards */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Target Study Arm
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Intervention Option */}
                    <button
                      type="button"
                      onClick={() => setArm('INTERVENTION')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        arm === 'INTERVENTION'
                          ? 'border-teal-500 bg-teal-50/80 ring-2 ring-teal-500/20 text-teal-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Smartphone className={`w-4 h-4 ${arm === 'INTERVENTION' ? 'text-teal-700' : 'text-slate-500'}`} />
                        <span className="font-bold text-xs">Intervention App</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-light">
                        Interactive delabeling curriculum & risk calculator
                      </p>
                    </button>

                    {/* Control Option */}
                    <button
                      type="button"
                      onClick={() => setArm('CONTROL')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        arm === 'CONTROL'
                          ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/20 text-indigo-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className={`w-4 h-4 ${arm === 'CONTROL' ? 'text-indigo-700' : 'text-slate-500'}`} />
                        <span className="font-bold text-xs">Control Handout</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-light">
                        Baseline educational brochure & infographic
                      </p>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating QR & Link...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Generate Campaign QR Code</span>
                    </>
                  )}
                </button>
              </form>

              {/* QR Preview & Download Section */}
              {generatedLink && qrDataUrl && (
                <div className="mt-5 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>QR Code Generated Successfully</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 border border-slate-200 rounded-xl">
                    <div className="bg-white p-2 border border-slate-200 rounded-xl shadow-xs shrink-0">
                      <img src={qrDataUrl} alt="Campaign QR Code" className="w-28 h-28 object-contain" />
                    </div>

                    <div className="space-y-2 w-full text-left">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Access Link</p>
                      <p className="text-xs font-mono font-bold text-slate-800 break-all bg-slate-50 p-2 rounded-lg border border-slate-200 select-all">
                        {generatedLink}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedLink, 'modal-link')}
                      className="py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {copiedId === 'modal-link' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-600" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(generatedLink, name)}
                      className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Poster</span>
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
