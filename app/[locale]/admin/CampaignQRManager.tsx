'use client';

import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import Papa from 'papaparse';
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
  FileSpreadsheet,
  Printer,
  Sparkles,
  Link as LinkIcon,
  Layers,
  ChevronRight,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { CsvDownloadIcon } from '@/components/icons/CsvDownloadIcon';

export interface CampaignItem {
  id: string;
  name: string;
  slug: string;
  arm: string;
  status: string;
  createdAt: Date | string;
  totalScans: number;
}

export interface GeneratedLinkItem {
  index: number;
  participantId: string;
  externalId: string;
  token: string;
  url: string;
  arm: string;
  status: string;
  useCount?: number;
  lastUsedAt?: string | null;
  createdAt: string | Date;
}

export function CampaignQRManager({ initialCampaigns }: { initialCampaigns?: CampaignItem[] }) {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns || []);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewLinksModalOpen, setIsViewLinksModalOpen] = useState(false);
  const [isQrPreviewModalOpen, setIsQrPreviewModalOpen] = useState(false);

  // Edit Campaign State
  const [editCampaign, setEditCampaign] = useState<CampaignItem | null>(null);
  const [editName, setEditName] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Campaign State
  const [deleteCampaign, setDeleteCampaign] = useState<CampaignItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [linksLoading, setLinksLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Search & Filter State for Main Table
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DEACTIVATED'>('ALL');
  const [armFilter, setArmFilter] = useState<'ALL' | 'INTERVENTION' | 'CONTROL'>('ALL');

  // Form State inside Create Modal
  const [name, setName] = useState('');
  const [arm, setArm] = useState<'INTERVENTION' | 'CONTROL'>('INTERVENTION');
  const [quantity, setQuantity] = useState<number>(10);
  const [customQuantity, setCustomQuantity] = useState<string>('10');

  // Generated Batch State (Post Creation)
  const [createdCampaign, setCreatedCampaign] = useState<any | null>(null);
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLinkItem[]>([]);
  const [batchSearchTerm, setBatchSearchTerm] = useState('');

  // Selected Campaign for "View Links & QR Codes" Drawer
  const [activeCampaign, setActiveCampaign] = useState<CampaignItem | null>(null);
  const [activeCampaignLinks, setActiveCampaignLinks] = useState<GeneratedLinkItem[]>([]);
  const [activeLinksSearchTerm, setActiveLinksSearchTerm] = useState('');
  const [addQuantity, setAddQuantity] = useState<number>(10);
  const [addingMore, setAddingMore] = useState(false);

  // Single QR Code Preview State
  const [previewQrItem, setPreviewQrItem] = useState<{
    title: string;
    subtitle: string;
    token: string;
    url: string;
    qrDataUrl: string;
  } | null>(null);

  // Single QR Poster State for Open Campaign (General)
  const [generalPosterQr, setGeneralPosterQr] = useState<{
    campaign: CampaignItem;
    url: string;
    qrDataUrl: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Origin
  const [origin, setOrigin] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

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

  // Optimistic Toggle Status Function
  const handleToggle = async (id: string, currentStatus: string, campaignName: string) => {
    const nextStatus: 'ACTIVE' | 'DEACTIVATED' = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    setTogglingId(id);

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
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: currentStatus } : c))
      );
      showToast(err.message || 'Error updating status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Open Edit Campaign Modal
  const handleOpenEdit = (campaign: CampaignItem) => {
    setEditCampaign(campaign);
    setEditName(campaign.name);
    setIsEditModalOpen(true);
  };

  // Submit Edit Campaign Name
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCampaign) return;
    if (!editName.trim() || editName.trim().length < 2) {
      showToast('Campaign name must be at least 2 characters.', 'error');
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editCampaign.id,
          name: editName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to rename campaign.', 'error');
      } else {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === editCampaign.id ? { ...c, name: editName.trim() } : c))
        );
        showToast(`Campaign renamed to "${editName.trim()}" successfully!`, 'success');
        setIsEditModalOpen(false);
        setEditCampaign(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating campaign name.', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Open Delete Campaign Confirmation Modal
  const handleOpenDelete = (campaign: CampaignItem) => {
    setDeleteCampaign(campaign);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Campaign
  const handleConfirmDelete = async () => {
    if (!deleteCampaign) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/campaigns?id=${encodeURIComponent(deleteCampaign.id)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to delete campaign.', 'error');
      } else {
        setCampaigns((prev) => prev.filter((c) => c.id !== deleteCampaign.id));
        showToast(`Campaign "${deleteCampaign.name}" was permanently deleted.`, 'success');
        setIsDeleteModalOpen(false);
        setDeleteCampaign(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting campaign.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Create Campaign & Generate N Links
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const qty = Math.max(1, Math.min(Number(quantity) || 1, 500));

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          arm,
          quantity: qty,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.campaign) {
        setError(data.error || 'Failed to create campaign');
        setLoading(false);
        return;
      }

      setCreatedCampaign(data.campaign);
      setGeneratedLinks(data.links || []);
      showToast(`🎉 Created "${data.campaign.name}" with ${data.totalGenerated} unique links!`, 'success');
      await refreshCampaigns();
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating campaign links.');
    } finally {
      setLoading(false);
    }
  };

  // Open "View Links & QR Codes" Drawer for an Existing Campaign
  const handleOpenCampaignLinks = async (campaign: CampaignItem) => {
    setActiveCampaign(campaign);
    setIsViewLinksModalOpen(true);
    setLinksLoading(true);
    setActiveLinksSearchTerm('');

    try {
      const res = await fetch(`/api/campaigns?campaignId=${encodeURIComponent(campaign.id)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && data.links) {
        setActiveCampaignLinks(data.links);
      } else {
        setActiveCampaignLinks([]);
      }
    } catch (err) {
      console.error('Failed to load campaign links:', err);
      showToast('Failed to load links for this campaign.', 'error');
    } finally {
      setLinksLoading(false);
    }
  };

  // Append N More Links to an Existing Campaign
  const handleAddMoreLinks = async () => {
    if (!activeCampaign) return;
    setAddingMore(true);

    const qty = Math.max(1, Math.min(Number(addQuantity) || 1, 500));

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: activeCampaign.id,
          quantity: qty,
        }),
      });

      const data = await res.json();
      if (data.success && data.newlyGenerated) {
        setActiveCampaignLinks((prev) => [...prev, ...data.newlyGenerated]);
        showToast(`Added ${data.totalAdded} new links to "${activeCampaign.name}"!`, 'success');
        await refreshCampaigns();
      } else {
        showToast(data.error || 'Failed to add links', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error adding links', 'error');
    } finally {
      setAddingMore(false);
    }
  };

  // Open QR Code Preview Modal for a Single Link
  const handlePreviewQr = async (item: GeneratedLinkItem, campaignTitle: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(item.url, {
        width: 600,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      setPreviewQrItem({
        title: campaignTitle,
        subtitle: `Participant Research ID: ${item.externalId}`,
        token: item.token,
        url: item.url,
        qrDataUrl,
      });
      setIsQrPreviewModalOpen(true);
    } catch (err) {
      console.error('QR generate error:', err);
    }
  };

  // Open General Poster QR Modal
  const handleOpenGeneralPoster = async (campaign: CampaignItem) => {
    const link = `${origin || 'https://domain.com'}/join?arm=${campaign.arm.toLowerCase()}&campaign=${encodeURIComponent(campaign.slug)}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(link, {
        width: 600,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      setGeneralPosterQr({
        campaign,
        url: link,
        qrDataUrl,
      });
    } catch (err) {
      console.error('General QR error:', err);
    }
  };

  // ── CSV & Excel Export Engine (Clean & Formatted with UTF-8 BOM) ───────────────
  const exportLinksToCSV = (links: GeneratedLinkItem[], campaignName: string, campaignSlug: string) => {
    if (!links || links.length === 0) {
      showToast('No links available to export.', 'error');
      return;
    }

    const exportRows = links.map((link, idx) => ({
      Index: idx + 1,
      ParticipantID: link.externalId,
      AccessToken: link.token,
      DirectInvitationURL: link.url,
      StudyArm: link.arm,
      CampaignName: campaignName,
      CampaignSlug: campaignSlug,
      Status: link.status || 'PENDING',
      TimesUsed: link.useCount || 0,
      DateCreated: typeof link.createdAt === 'string' ? link.createdAt : new Date(link.createdAt).toISOString(),
    }));

    const csvContent = '\uFEFF' + Papa.unparse(exportRows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `PEN-PAL_${campaignSlug || 'Campaign'}_Links_${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Downloaded CSV spreadsheet for "${campaignName}"!`, 'success');
  };

  // Download Individual QR Code PNG
  const handleDownloadQrPng = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${filename}_QRCode.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded QR Code PNG for ${filename}`);
  };

  // Copy Single Link
  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast('Copied link to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Copy All Links to Clipboard (Newline-separated)
  const handleCopyAllLinks = (links: GeneratedLinkItem[]) => {
    if (!links || links.length === 0) return;
    const text = links.map((l) => `${l.externalId}\t${l.token}\t${l.url}`).join('\n');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`Copied ${links.length} links to clipboard!`);
    }
  };

  // Reset Create Modal Form
  const resetCreateForm = () => {
    setName('');
    setArm('INTERVENTION');
    setQuantity(10);
    setCustomQuantity('10');
    setCreatedCampaign(null);
    setGeneratedLinks([]);
    setError(null);
  };

  // Filtered Main Campaigns
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
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 ${toastMessage.type === 'success'
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

      {/* Main Header & Creation Trigger - Clinical Sage/Teal Palette */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-[#1d5c64] via-[#236f7a] to-[#2e7d8a] text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 border border-white/25 rounded-xl text-white shadow-xs backdrop-blur-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                Study QR Codes & Campaign Manager
              </h2>
              <p className="text-xs text-teal-100 font-normal">
                Create research campaigns, generate batches of unique participant links & QR codes, and export formatted CSV/Excel lists.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            resetCreateForm();
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#71ad9d] hover:bg-[#609c8d] active:scale-[0.98] text-[#132c27] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Campaign & Batch Links
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
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Campaigns</p>
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
          <div className="p-2 bg-teal-50 border border-teal-200 rounded-lg text-teal-700 shadow-2xs">
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Participants</p>
            <p className="text-lg font-extrabold font-mono text-teal-900">{totalScans}</p>
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
            placeholder="Search campaigns by name or ID (e.g. clinic_poster)..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1d5c64] focus:bg-white focus:ring-1 focus:ring-[#1d5c64] transition-all"
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

      {/* Campaigns Main Table */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/50">
          <QrCode className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No campaigns found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-light">
            {searchTerm || statusFilter !== 'ALL' || armFilter !== 'ALL'
              ? 'Try clearing your filters or search keywords.'
              : 'Click "Create New Campaign & Batch Links" to generate your first study campaign.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-500 font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-5 font-bold">Campaign Name & ID</th>
                <th className="py-3 px-5 font-bold">Study Arm</th>
                <th className="py-3 px-5 font-bold text-center">Participants</th>
                <th className="py-3 px-5 font-bold text-center">Access Status</th>
                <th className="py-3 px-5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.map((item) => {
                const isActive = item.status === 'ACTIVE';
                const isToggling = togglingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
                    {/* Name & ID */}
                    <td className="py-4 px-5">
                      <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <span>{item.name}</span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active"></span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="opacity-60 hover:opacity-100 p-1 text-slate-400 hover:text-[#1d5c64] rounded transition cursor-pointer"
                          title="Rename Campaign"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">ID:</span>
                        <span>{item.slug}</span>
                      </div>
                    </td>

                    {/* Study Arm */}
                    <td className="py-4 px-5">
                      {item.arm === 'INTERVENTION' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          <Smartphone className="w-3 h-3" />
                          Intervention
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <BookOpen className="w-3 h-3" />
                          Control
                        </span>
                      )}
                    </td>

                    {/* Participant / Link Count */}
                    <td className="py-4 px-5 text-center font-mono font-bold text-slate-800">
                      <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-xs">
                        {item.totalScans || 0} links
                      </span>
                    </td>

                    {/* Active / Deactivated Switch */}
                    <td className="py-4 px-5 text-center">
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handleToggle(item.id, item.status, item.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase transition-all shadow-2xs cursor-pointer border ${isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          } ${isToggling ? 'opacity-50 cursor-wait' : 'active:scale-95'}`}
                        title={isActive ? 'Click to deactivate campaign (pause access)' : 'Click to activate campaign (enable access)'}
                      >
                        {isToggling ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                              }`}
                          />
                        )}
                        <span>{isActive ? 'Active' : 'Deactivated'}</span>
                      </button>
                    </td>

                    {/* Row Actions */}
                    <td className="py-4 px-5 text-right space-x-1.5 whitespace-nowrap">
                      {/* View & Manage Links */}
                      <button
                        type="button"
                        onClick={() => handleOpenCampaignLinks(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold rounded-lg border border-teal-200 transition-colors shadow-2xs cursor-pointer"
                        title="View and manage unique links & QR codes"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Manage Links</span>
                      </button>

                      {/* Export CSV Direct (Icon Button) */}
                      <a
                        href={`/api/export?type=campaign_links&campaignId=${item.id}`}
                        download
                        className="p-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors shadow-2xs cursor-pointer inline-flex items-center justify-center"
                        title="Export CSV spreadsheet of all unique links"
                        aria-label="Export CSV spreadsheet"
                      >
                        <CsvDownloadIcon className="w-4 h-4" />
                      </a>

                      {/* Delete Campaign (Icon Only) */}
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(item)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors shadow-2xs cursor-pointer inline-flex items-center justify-center"
                        title="Permanently delete campaign"
                        aria-label="Permanently delete campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: Create New Campaign & Generate N Links
          ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1d5c64]/20 bg-gradient-to-r from-[#1d5c64] via-[#236f7a] to-[#2e7d8a] text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl text-white backdrop-blur-xs shadow-xs border border-white/25">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-white text-base tracking-tight">
                  {createdCampaign ? 'Batch Links Generated Successfully' : 'Create Campaign & Generate Links'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!createdCampaign ? (
                /* Step 1: Form to Create Campaign & Specify N Quantity */
                <form onSubmit={handleCreate} className="space-y-5">
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Campaign Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Campaign / Site Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Children's Hospital Waiting Room A, Clinic B Flyer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1d5c64] focus:bg-white focus:ring-1 focus:ring-[#1d5c64] font-medium transition"
                    />
                    <p className="text-[11px] text-slate-400">
                      A descriptive title to track where these links and QR codes will be distributed.
                    </p>
                  </div>

                  {/* Study Arm Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Study Arm Destination
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setArm('INTERVENTION')}
                        className={`p-3.5 border rounded-xl flex items-center gap-3 text-left transition cursor-pointer ${arm === 'INTERVENTION'
                            ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20 text-teal-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <Smartphone className={`w-5 h-5 ${arm === 'INTERVENTION' ? 'text-teal-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-xs font-extrabold">Intervention Arm</p>
                          <p className="text-[10px] text-slate-500">PEN-PAL Interactive Wizard</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setArm('CONTROL')}
                        className={`p-3.5 border rounded-xl flex items-center gap-3 text-left transition cursor-pointer ${arm === 'CONTROL'
                            ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 text-amber-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <BookOpen className={`w-5 h-5 ${arm === 'CONTROL' ? 'text-amber-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-xs font-extrabold">Control Arm</p>
                          <p className="text-[10px] text-slate-500">Standard Educational Site</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Number of Unique Links to Generate (N) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Number of Unique Links & QR Codes to Generate (N)
                      </label>
                      <span className="text-xs font-bold font-mono text-[#1d5c64] bg-[#f4f8e8] border border-[#1d5c64]/30 px-2.5 py-0.5 rounded-full">
                        {quantity} links
                      </span>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {[5, 10, 25, 50, 100, 250].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setQuantity(num);
                            setCustomQuantity(String(num));
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${quantity === num
                              ? 'bg-[#1d5c64] text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                          {num} links
                        </button>
                      ))}
                    </div>

                    {/* Custom Number Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-slate-500">Or custom quantity:</span>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={customQuantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomQuantity(val);
                          const num = parseInt(val, 10);
                          if (!isNaN(num) && num > 0) {
                            setQuantity(num);
                          }
                        }}
                        className="w-24 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:border-[#1d5c64]"
                      />
                      <span className="text-[11px] text-slate-400">(Max 500 per batch)</span>
                    </div>
                  </div>

                  {/* Explanatory Note */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600 text-xs leading-relaxed space-y-1">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-[#1d5c64]" />
                      What will be generated:
                    </p>
                    <p className="text-[11px]">
                      Each participant link will receive a unique clean Research ID (<span className="font-mono text-slate-800 font-bold">PEN-XXX-001</span>), a cryptographically secure access token (<span className="font-mono text-slate-800 font-bold">PEN-4K9L2M</span>), and a direct high-res QR code. You can immediately download all links as a CSV/Excel spreadsheet.
                    </p>
                  </div>

                  {/* Submit Action Button */}
                  <div className="pt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !name.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1d5c64] hover:bg-[#16484e] active:scale-[0.98] text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating {quantity} Unique Links...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate {quantity} Links & QR Codes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Batch Generated Success & Download Actions */
                <div className="space-y-6">
                  {/* Success Banner */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-emerald-950 text-sm">
                          {generatedLinks.length} Unique Links & QR Codes Created!
                        </h4>
                        <p className="text-xs text-emerald-700 font-medium">
                          Campaign: <span className="font-bold font-mono">{createdCampaign.name}</span> ({createdCampaign.arm})
                        </p>
                      </div>
                    </div>

                    {/* Big Download CSV Button */}
                    <button
                      type="button"
                      onClick={() =>
                        exportLinksToCSV(generatedLinks, createdCampaign.name, createdCampaign.slug)
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 active:scale-[0.98] text-white text-xs font-extrabold rounded-xl transition shadow-md cursor-pointer shrink-0"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Download CSV / Excel</span>
                    </button>
                  </div>

                  {/* Action Bar & Prominent Search Bar */}
                  <div className="space-y-3 pt-1 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyAllLinks(generatedLinks)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy All URLs</span>
                        </button>
                      </div>

                      <span className="text-xs font-bold text-slate-500 font-mono">
                        {(() => {
                          const count = generatedLinks.filter((item) => {
                            if (!batchSearchTerm.trim()) return true;
                            const q = batchSearchTerm.toLowerCase().trim();
                            return (
                              item.externalId.toLowerCase().includes(q) ||
                              item.token.toLowerCase().includes(q) ||
                              item.url.toLowerCase().includes(q) ||
                              `#${item.index}`.includes(q) ||
                              String(item.index) === q
                            );
                          }).length;
                          return `Showing ${count} of ${generatedLinks.length} links`;
                        })()}
                      </span>
                    </div>

                    {/* Dedicated Prominent Link Search Bar */}
                    <div className="relative w-full">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={batchSearchTerm}
                        onChange={(e) => setBatchSearchTerm(e.target.value)}
                        placeholder="Search generated links by ID (e.g. PEN-CAMP-001 or #1), Access Code (e.g. PEN-4K9L2M), or URL..."
                        className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1d5c64] focus:bg-white focus:ring-1 focus:ring-[#1d5c64] font-medium transition"
                      />
                      {batchSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setBatchSearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold text-xs cursor-pointer px-1 py-0.5"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Generated Links Scrollable Table */}
                  {(() => {
                    const filtered = generatedLinks.filter((item) => {
                      if (!batchSearchTerm.trim()) return true;
                      const q = batchSearchTerm.toLowerCase().trim();
                      return (
                        item.externalId.toLowerCase().includes(q) ||
                        item.token.toLowerCase().includes(q) ||
                        item.url.toLowerCase().includes(q) ||
                        `#${item.index}`.includes(q) ||
                        String(item.index) === q
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <p className="text-xs font-bold text-slate-700">No links found matching &quot;{batchSearchTerm}&quot;</p>
                          <button
                            type="button"
                            onClick={() => setBatchSearchTerm('')}
                            className="text-xs text-[#1d5c64] font-bold hover:underline cursor-pointer"
                          >
                            Clear Search Filter
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                        {filtered.map((item) => (
                          <div
                            key={item.participantId}
                            className="p-3 bg-white hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-6 h-6 rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-600 flex items-center justify-center shrink-0">
                                #{item.index}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900 font-mono">{item.externalId}</span>
                                  <span className="bg-[#f4f8e8] text-[#1d5c64] border border-[#1d5c64]/30 font-mono px-2 py-0.5 rounded-md text-[10px] font-bold">
                                    {item.token}
                                  </span>
                                </div>
                                <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs sm:max-w-sm mt-0.5">
                                  {item.url}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Copy Link */}
                              <button
                                type="button"
                                onClick={() => handleCopy(item.url, item.participantId)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition cursor-pointer"
                                title="Copy URL"
                              >
                                {copiedId === item.participantId ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Open Direct */}
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition"
                                title="Open link in new tab"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              {/* Preview QR */}
                              <button
                                type="button"
                                onClick={() => handlePreviewQr(item, createdCampaign.name)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-[10px] font-bold border border-teal-200 transition cursor-pointer"
                              >
                                <QrCode className="w-3 h-3" />
                                <span>QR</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Modal Footer */}
                  <div className="pt-2 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => resetCreateForm()}
                      className="text-xs font-bold text-[#1d5c64] hover:text-[#236f7a] transition cursor-pointer"
                    >
                      + Create Another Batch
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-5 py-2 bg-[#1d5c64] hover:bg-[#16484e] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-[0.98]"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: View & Manage Existing Campaign Links (With Add More & Export)
          ========================================================================= */}
      {isViewLinksModalOpen && activeCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1d5c64]/20 bg-gradient-to-r from-[#1d5c64] via-[#236f7a] to-[#2e7d8a] text-white">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-base tracking-tight">
                    {activeCampaign.name}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/25">
                    {activeCampaign.arm}
                  </span>
                </div>
                <p className="text-xs text-teal-100 font-mono mt-0.5">
                  Campaign ID: {activeCampaign.slug} &middot; Total Links: {activeCampaignLinks.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsViewLinksModalOpen(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  {/* Export CSV Button */}
                  <button
                    type="button"
                    onClick={() =>
                      exportLinksToCSV(activeCampaignLinks, activeCampaign.name, activeCampaign.slug)
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Download CSV / Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyAllLinks(activeCampaignLinks)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All URLs</span>
                  </button>
                </div>

                {/* Add More Links Form */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Add more:</span>
                  <select
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value={5}>+5 links</option>
                    <option value={10}>+10 links</option>
                    <option value={25}>+25 links</option>
                    <option value={50}>+50 links</option>
                    <option value={100}>+100 links</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddMoreLinks}
                    disabled={addingMore}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#1d5c64] hover:bg-[#16484e] text-white text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                  >
                    {addingMore ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    <span>Generate</span>
                  </button>
                </div>
              </div>

              {/* Dedicated Search Bar for Existing Campaign Links */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Filter Links in this Campaign</span>
                  <span className="font-mono font-bold">
                    {(() => {
                      const count = activeCampaignLinks.filter((item) => {
                        if (!activeLinksSearchTerm.trim()) return true;
                        const q = activeLinksSearchTerm.toLowerCase().trim();
                        return (
                          item.externalId.toLowerCase().includes(q) ||
                          item.token.toLowerCase().includes(q) ||
                          item.url.toLowerCase().includes(q) ||
                          `#${item.index}`.includes(q) ||
                          String(item.index) === q
                        );
                      }).length;
                      return `Showing ${count} of ${activeCampaignLinks.length} links`;
                    })()}
                  </span>
                </div>

                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={activeLinksSearchTerm}
                    onChange={(e) => setActiveLinksSearchTerm(e.target.value)}
                    placeholder="Search campaign links by ID (e.g. PEN-CAMP-001 or #1), Access Code (e.g. PEN-4K9L2M), or URL..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1d5c64] focus:bg-white focus:ring-1 focus:ring-[#1d5c64] font-medium transition"
                  />
                  {activeLinksSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setActiveLinksSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold text-xs cursor-pointer px-1 py-0.5"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Links Table */}
              {linksLoading ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1d5c64]" />
                  <p className="text-xs">Loading campaign links and QR tokens...</p>
                </div>
              ) : activeCampaignLinks.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs">No unique links generated for this campaign yet.</p>
                  <button
                    type="button"
                    onClick={handleAddMoreLinks}
                    className="mt-2 text-xs font-bold text-[#1d5c64] hover:underline cursor-pointer"
                  >
                    + Generate first batch of links now
                  </button>
                </div>
              ) : (() => {
                const filtered = activeCampaignLinks.filter((item) => {
                  if (!activeLinksSearchTerm.trim()) return true;
                  const q = activeLinksSearchTerm.toLowerCase().trim();
                  return (
                    item.externalId.toLowerCase().includes(q) ||
                    item.token.toLowerCase().includes(q) ||
                    item.url.toLowerCase().includes(q) ||
                    `#${item.index}`.includes(q) ||
                    String(item.index) === q
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-slate-700">No links found matching &quot;{activeLinksSearchTerm}&quot;</p>
                      <button
                        type="button"
                        onClick={() => setActiveLinksSearchTerm('')}
                        className="text-xs text-[#1d5c64] font-bold hover:underline cursor-pointer"
                      >
                        Clear Search Filter
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                    {filtered.map((item) => (
                      <div
                        key={item.participantId}
                        className="p-3 hover:bg-slate-50 transition flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-600 flex items-center justify-center shrink-0">
                            #{item.index}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 font-mono">{item.externalId}</span>
                              <span className="bg-[#f4f8e8] text-[#1d5c64] border border-[#1d5c64]/30 font-mono px-2 py-0.5 rounded-md text-[10px] font-bold">
                                {item.token}
                              </span>
                              {item.useCount && item.useCount > 0 ? (
                                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                                  Used {item.useCount}x
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.2 rounded">
                                  Unused
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs sm:max-w-md mt-0.5">
                              {item.url}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Copy Link */}
                          <button
                            type="button"
                            onClick={() => handleCopy(item.url, item.participantId)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition cursor-pointer"
                            title="Copy URL"
                          >
                            {copiedId === item.participantId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Open Direct */}
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition"
                            title="Open link in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Preview QR */}
                          <button
                            type="button"
                            onClick={() => handlePreviewQr(item, activeCampaign.name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-[10px] font-bold border border-teal-200 transition cursor-pointer"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>QR</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: Individual QR Code Preview & High-Res PNG Download
          ========================================================================= */}
      {isQrPreviewModalOpen && previewQrItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 text-center space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-left">
                <h4 className="font-extrabold text-slate-900 text-sm">{previewQrItem.title}</h4>
                <p className="text-[11px] font-mono text-slate-500">{previewQrItem.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQrPreviewModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Image Card */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-inner inline-block mx-auto">
              <img
                src={previewQrItem.qrDataUrl}
                alt="Participant QR Code"
                className="w-48 h-48 mx-auto object-contain"
              />
              <div className="mt-2 text-center">
                <span className="font-mono text-xs font-black tracking-wider text-teal-950 bg-[#f4f8e8] border border-[#1d5c64]/30 px-2.5 py-0.5 rounded-full">
                  {previewQrItem.token}
                </span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-slate-500 break-all px-2 bg-slate-50 py-1.5 rounded-lg border border-slate-200">
              {previewQrItem.url}
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopy(previewQrItem.url, 'preview')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer active:scale-[0.98]"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleDownloadQrPng(previewQrItem.qrDataUrl, `${previewQrItem.token}_Flyer`)
                }
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1d5c64] hover:bg-[#16484e] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: General Campaign Open Poster QR
          ========================================================================= */}
      {generalPosterQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 text-center space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-left">
                <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Open Poster QR
                </span>
                <h4 className="font-extrabold text-slate-900 text-base mt-1">{generalPosterQr.campaign.name}</h4>
                <p className="text-xs text-slate-500">Self-enrollment QR code for waiting room flyers & posters</p>
              </div>
              <button
                type="button"
                onClick={() => setGeneralPosterQr(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Poster QR Card */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
              <img
                src={generalPosterQr.qrDataUrl}
                alt="Campaign Poster QR Code"
                className="w-56 h-56 mx-auto object-contain bg-white p-3 rounded-xl border border-slate-200 shadow-sm"
              />
              <p className="text-xs font-bold text-slate-800">Scan to Participate in Study</p>
              <p className="text-[10px] font-mono text-slate-400 break-all">{generalPosterQr.url}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopy(generalPosterQr.url, 'poster')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer active:scale-[0.98]"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleDownloadQrPng(generalPosterQr.qrDataUrl, `${generalPosterQr.campaign.slug}_Poster`)
                }
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1d5c64] hover:bg-[#16484e] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Poster PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: Edit Campaign Name
          ========================================================================= */}
      {isEditModalOpen && editCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  Campaign Settings
                </span>
                <h4 className="font-extrabold text-slate-900 text-base mt-1">Edit Campaign Name</h4>
                <p className="text-xs text-slate-500 font-mono">ID: {editCampaign.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditCampaign(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Campaign Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Campaign- Intervention-1"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#1d5c64] focus:bg-white focus:ring-1 focus:ring-[#1d5c64] font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Changing the display name will update reports without altering unique URLs.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditCampaign(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit || !editName.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1d5c64] hover:bg-[#16484e] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: Delete Campaign Confirmation Modal (Explicit Warning)
          ========================================================================= */}
      {isDeleteModalOpen && deleteCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                  Irreversible Action
                </span>
                <h4 className="font-extrabold text-slate-900 text-base mt-1">
                  Delete &ldquo;{deleteCampaign.name}&rdquo;?
                </h4>
                <p className="text-xs text-slate-500 font-mono">ID: {deleteCampaign.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteCampaign(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Callout Box */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-left space-y-1.5">
              <p className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>This campaign cannot be recovered once deleted</span>
              </p>
              <p className="text-[11px] text-rose-700 leading-relaxed font-normal">
                Deleting this campaign will permanently remove all associated <strong>{deleteCampaign.totalScans || 0} participant access links</strong>, generated QR codes, and related records from the database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteCampaign(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Permanently...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Campaign</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
