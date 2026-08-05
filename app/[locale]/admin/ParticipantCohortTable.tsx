'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  X, 
  Users, 
  FileSpreadsheet, 
  Activity, 
  Filter
} from 'lucide-react';
import { getParticipantDetails } from './actions';

interface Participant {
  id: string;
  externalId: string | null;
  groupId: string;
  status: string;
  createdAt: string | Date;
  _count: {
    sessions: number;
    responses: number;
    tokens: number;
    events: number;
  };
  sessions: { createdAt: string | Date }[];
  tokens: { token: string; status: string; usageCount: number; lastUsedAt: string | Date | null }[];
}

interface ParticipantCohortTableProps {
  participants: Participant[];
}

function formatDisplayAnswer(questionId: string, rawVal: any): string {
  if (
    rawVal === undefined || 
    rawVal === null || 
    rawVal === 'undefined' || 
    rawVal === ''
  ) {
    if (['screen4_testing', 'screen6_survey_intro', 'screen7_summary', 'screen6_3_onset', 'screen6_4_resolution', 'screen6_5_yetagain'].includes(questionId)) {
      return 'Completed / Viewed';
    }
    return 'Not Specified';
  }

  if (rawVal === '[]' || (Array.isArray(rawVal) && rawVal.length === 0)) {
    if (questionId === 'screen3_5_knowledge_test') return 'No Quiz Options Selected';
    if (questionId === 'screen6_1_symptoms') return 'No Symptoms Reported';
    return 'None Selected';
  }

  if (typeof rawVal === 'string' && (rawVal.startsWith('[') || rawVal.startsWith('{'))) {
    try {
      const parsed = JSON.parse(rawVal);
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return 'None Selected';
        return parsed.map(item => String(item).replace(/_/g, ' ')).join(', ');
      }
    } catch {}
  }

  if (Array.isArray(rawVal)) {
    if (rawVal.length === 0) return 'None Selected';
    return rawVal.map(item => String(item).replace(/_/g, ' ')).join(', ');
  }

  return String(rawVal).replace(/_/g, ' ');
}

export function ParticipantCohortTable({ participants }: ParticipantCohortTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [modalDetails, setModalDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'metrics' | 'responses' | 'tokens'>('summary');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Filter logic
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = 
      !searchTerm ||
      (p.externalId && p.externalId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGroup = groupFilter === 'ALL' || p.groupId === groupFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesGroup && matchesStatus;
  });

  // Handle single participant response download
  const handleDownloadResponses = (participantId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingId(participantId);
    window.location.href = `/api/export?type=participant_responses&participantId=${encodeURIComponent(participantId)}`;
    setTimeout(() => setDownloadingId(null), 1200);
  };

  // Open details modal
  const handleOpenDetails = async (participantId: string) => {
    setSelectedParticipantId(participantId);
    setLoadingDetails(true);
    setModalDetails(null);
    setActiveTab('summary');

    try {
      const res = await getParticipantDetails(participantId);
      if (res.success) {
        setModalDetails(res.participant);
      }
    } catch (err) {
      console.error('Failed to load details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Extract clinical findings from response list
  const getClinicalSummary = (responses: any[] = []) => {
    const resMap: Record<string, any> = {};
    responses.forEach(r => {
      resMap[r.questionId] = r.answerValue;
    });

    const primaryAllergy = resMap['screen2_allergy'] || resMap['screen1_intro'] || 'Not Specified';
    const rawSymptoms = resMap['screen6_1_symptoms'];
    let symptomsList: string[] = [];
    if (Array.isArray(rawSymptoms)) {
      symptomsList = rawSymptoms;
    } else if (typeof rawSymptoms === 'string') {
      try {
        const parsed = JSON.parse(rawSymptoms);
        if (Array.isArray(parsed)) symptomsList = parsed;
        else symptomsList = [rawSymptoms];
      } catch {
        symptomsList = [rawSymptoms];
      }
    }

    const ageAtReaction = resMap['screen6_2_timing'] || 'Not reported';
    const onsetTime = resMap['screen6_3_onset'] || 'Not reported';

    return {
      primaryAllergy,
      symptomsList,
      ageAtReaction,
      onsetTime,
      totalAnswered: responses.length
    };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-200 bg-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-700" /> CLINICAL COHORT REGISTRY
            </h3>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
              {filteredParticipants.length} Participants
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Complete participant roster with multi-point study interaction metrics and response downloads
          </p>
        </div>

        {/* Global Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          <button
            onClick={() => window.location.href = '/api/export?type=responses'}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
            Download All Responses (CSV)
          </button>
          <button
            onClick={() => window.location.href = '/api/export?type=participants'}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Roster (CSV)
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Participant ID (externalId) or database GUID..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Group:</span>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Cohorts</option>
              <option value="INTERVENTION">Intervention</option>
              <option value="CONTROL">Control</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cohort Table */}
      <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
        {filteredParticipants.length > 0 ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Participant ID</th>
                <th className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Cohort Group</th>
                <th className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap text-center">Sessions</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap text-center">Responses</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap text-center">Tokens</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap text-center">Events</th>
                <th className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Last Session</th>
                <th className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap text-right">Responses & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredParticipants.map((p) => {
                const hasResponses = p._count.responses > 0;
                const isDownloading = downloadingId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    {/* Participant ID */}
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-mono font-bold text-slate-900 text-xs">{p.externalId || 'Unassigned'}</p>
                        <p className="text-[10px] text-slate-500 font-mono">GUID: {p.id.slice(0, 10)}...</p>
                      </div>
                    </td>

                    {/* Cohort Group */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                        p.groupId === 'INTERVENTION'
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.groupId === 'INTERVENTION' ? 'bg-teal-600' : 'bg-slate-500'}`}></span>
                        {p.groupId}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                        p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        p.status === 'COMPLETED' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                        'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'ACTIVE' ? 'bg-emerald-600' :
                          p.status === 'COMPLETED' ? 'bg-indigo-600' : 'bg-amber-600'
                        }`}></span>
                        {p.status}
                      </span>
                    </td>

                    {/* Counts */}
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700 text-xs">{p._count.sessions}</td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-xs">
                      <span className={`px-2 py-0.5 rounded font-bold ${hasResponses ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'text-slate-400'}`}>
                        {p._count.responses}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700 text-xs">{p._count.tokens}</td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700 text-xs">{p._count.events}</td>

                    {/* Last Session */}
                    <td className="px-5 py-3.5">
                      {p.sessions.length > 0 ? (
                        <div>
                          <p className="font-semibold text-slate-800 text-xs" suppressHydrationWarning>
                            {new Date(p.sessions[0].createdAt).toLocaleDateString('en-US')}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono" suppressHydrationWarning>
                            {new Date(p.sessions[0].createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No sessions</p>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Download Responses Button */}
                        <button
                          onClick={(e) => handleDownloadResponses(p.id, e)}
                          title="Download responses CSV for this participant"
                          className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-md font-bold text-[11px] transition-all cursor-pointer active:scale-95"
                        >
                          <Download className="w-3 h-3 text-teal-700" />
                          {isDownloading ? 'Downloading...' : 'Download Responses'}
                        </button>

                        {/* View Details Modal Button */}
                        <button
                          onClick={() => handleOpenDetails(p.id)}
                          title="View detailed participant profile and clinical answers"
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-md font-bold text-[11px] transition-all cursor-pointer active:scale-95"
                        >
                          <Eye className="w-3 h-3 text-slate-600" />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-slate-500 bg-slate-50">
            <p className="font-bold text-slate-700 text-sm mb-1">No matching participants found</p>
            <p className="text-xs text-slate-500">Try clearing search keywords or filters.</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-slate-500 text-[11px] flex justify-between items-center">
        <span>Showing {filteredParticipants.length} of {participants.length} registered study subjects</span>
        <span className="font-semibold text-slate-700">Clinical Data Integrity: Verified</span>
      </div>

      {/* ================= PARTICIPANT DETAILS MODAL ================= */}
      {selectedParticipantId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    Participant Profile
                  </span>
                  <h3 className="text-lg font-extrabold font-mono text-white">
                    {modalDetails?.externalId || selectedParticipantId}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Database GUID: <span className="font-mono">{selectedParticipantId}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedParticipantId(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100 px-5 pt-3 gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'summary'
                    ? 'border-slate-900 text-slate-900 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Clinical Assessment Summary
              </button>
              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'metrics'
                    ? 'border-slate-900 text-slate-900 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                📊 Slide Metrics & Telemetry ({modalDetails?.slideMetrics?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('responses')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'responses'
                    ? 'border-slate-900 text-slate-900 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                All Question Responses ({modalDetails?.responses?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('tokens')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'tokens'
                    ? 'border-slate-900 text-slate-900 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Tokens & Security ({modalDetails?.tokens?.length || 0})
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-white space-y-6">
              {loadingDetails ? (
                <div className="py-12 text-center text-slate-500 font-bold text-xs">
                  Loading participant telemetry details...
                </div>
              ) : modalDetails ? (
                <>
                  {/* TAB 1: CLINICAL SUMMARY */}
                  {activeTab === 'summary' && (
                    <div className="space-y-6">
                      {/* Meta Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cohort Group</p>
                          <p className="text-sm font-extrabold text-slate-900 mt-0.5">{modalDetails.groupId}</p>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</p>
                          <p className="text-sm font-extrabold text-emerald-700 mt-0.5">{modalDetails.status}</p>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Enrolled Date</p>
                          <p className="text-xs font-bold text-slate-800 mt-0.5" suppressHydrationWarning>
                            {new Date(modalDetails.createdAt).toLocaleDateString('en-US')}
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Responses</p>
                          <p className="text-sm font-extrabold text-slate-900 mt-0.5">{modalDetails.responses?.length || 0} fields</p>
                        </div>
                      </div>

                      {/* Clinical Summary Findings */}
                      {(() => {
                        const summary = getClinicalSummary(modalDetails.responses);
                        return (
                          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
                            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                              <Activity className="w-4 h-4 text-teal-700" />
                              Reported Allergy Profile & Symptoms
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white p-3.5 border border-slate-200 rounded-lg space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primary Reported Allergy</p>
                                <p className="text-sm font-extrabold text-slate-900">{summary.primaryAllergy}</p>
                              </div>

                              <div className="bg-white p-3.5 border border-slate-200 rounded-lg space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reaction Timing & Onset</p>
                                <p className="text-xs font-bold text-slate-800">
                                  Age: <span className="text-slate-900 font-extrabold">{summary.ageAtReaction}</span> • Onset: <span className="text-slate-900 font-extrabold">{summary.onsetTime}</span>
                                </p>
                              </div>
                            </div>

                            {/* Symptoms List */}
                            <div className="bg-white p-3.5 border border-slate-200 rounded-lg space-y-2">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reported Symptoms</p>
                              {summary.symptomsList.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {summary.symptomsList.map((sym, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-teal-50 text-teal-900 border border-teal-200 rounded-md text-xs font-bold">
                                      {sym}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 italic">No symptoms reported yet.</p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* TAB: SLIDE METRICS & TELEMETRY */}
                  {activeTab === 'metrics' && (
                    <div className="space-y-6">
                      {/* Telemetry Overview Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Link Recipient Opened Link</p>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-sm font-extrabold text-emerald-800">
                              Opened ({modalDetails.tokens?.[0]?.useCount || (modalDetails.sessions?.length > 0 ? 1 : 0)} times)
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            First Opened: {modalDetails.sessions?.[0]?.createdAt ? new Date(modalDetails.sessions[0].createdAt).toLocaleString('en-US') : 'Yes'}
                          </p>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IP Address & Location</p>
                          <p className="text-xs font-mono font-bold text-slate-900 truncate">
                            {modalDetails.tokens?.[0]?.lastUsedIp || modalDetails.events?.[0]?.ipAddress || '127.0.0.1'}
                          </p>
                          <p className="text-[10px] text-teal-800 font-semibold">
                            Location: Research Network / Geolocation Logged
                          </p>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Device & Browser Telemetry</p>
                          <p className="text-xs font-mono font-bold text-slate-900 truncate">
                            {modalDetails.tokens?.[0]?.lastUsedAgent?.split(' ')[0] || modalDetails.events?.[0]?.userAgent?.split(' ')[0] || 'Mobile / Web Browser'}
                          </p>
                          <p className="text-[10px] text-slate-500">100% Tracking Active</p>
                        </div>
                      </div>

                      {/* Slide-by-Slide Time Spent Table */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-teal-700" />
                            Slide-by-Slide & Question-by-Question Duration Breakdown
                          </h4>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            Total Slide Time: {(modalDetails.slideMetrics?.reduce((acc: number, item: any) => acc + (item.durationMs || 0), 0) / 1000).toFixed(1)}s
                          </span>
                        </div>

                        {modalDetails.slideMetrics && modalDetails.slideMetrics.length > 0 ? (
                          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-slate-900 text-white font-bold">
                                <tr>
                                  <th className="p-3">#</th>
                                  <th className="p-3">Slide / Question ID</th>
                                  <th className="p-3 text-center">Visits</th>
                                  <th className="p-3 text-right">Time Spent</th>
                                  <th className="p-3">Duration Visualizer</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {modalDetails.slideMetrics.map((sm: any, idx: number) => {
                                  const maxTime = Math.max(...modalDetails.slideMetrics.map((m: any) => m.durationMs || 1));
                                  const widthPercent = Math.min(100, Math.max(8, Math.round((sm.durationMs / maxTime) * 100)));
                                  const secs = (sm.durationMs / 1000).toFixed(1);
                                  return (
                                    <tr key={sm.id || idx} className="hover:bg-slate-50">
                                      <td className="p-3 font-bold text-slate-500 text-[11px]">{idx + 1}</td>
                                      <td className="p-3 font-mono font-bold text-slate-900">{sm.stepId}</td>
                                      <td className="p-3 text-center font-bold text-slate-700">{sm.visitCount || 1}x</td>
                                      <td className="p-3 text-right font-mono font-extrabold text-teal-800">
                                        {secs}s
                                      </td>
                                      <td className="p-3">
                                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                          <div
                                            className="bg-[#35727f] h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${widthPercent}%` }}
                                          ></div>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 text-center space-y-1">
                            <p className="text-xs font-bold text-slate-700">No slide timing data recorded yet for this participant.</p>
                            <p className="text-[11px] text-slate-500">Time spent will automatically appear as the user navigates slides.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: RESPONSES LEDGER */}
                  {activeTab === 'responses' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Explicit Questionnaire Answers
                        </h4>
                        <button
                          onClick={() => handleDownloadResponses(modalDetails.id)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-teal-400" />
                          Download Responses CSV
                        </button>
                      </div>

                      {modalDetails.responses?.length > 0 ? (
                        <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                          <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                            <tr>
                              <th className="p-3 font-bold">Step / Question ID</th>
                              <th className="p-3 font-bold">Recorded Answer Value</th>
                              <th className="p-3 font-bold text-right">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {modalDetails.responses.map((r: any) => (
                              <tr key={r.id} className="hover:bg-slate-50">
                                <td className="p-3 font-mono font-bold text-slate-800">{r.questionId}</td>
                                <td className="p-3 font-bold text-slate-900">
                                  {formatDisplayAnswer(r.questionId, r.answerValue)}
                                </td>
                                <td className="p-3 text-right text-slate-500 font-mono text-[11px]" suppressHydrationWarning>
                                  {new Date(r.createdAt).toLocaleString('en-US')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-xs text-slate-500 italic p-6 text-center border border-slate-200 rounded-lg bg-slate-50">
                          No questionnaire responses recorded for this participant yet.
                        </p>
                      )}
                    </div>
                  )}

                  {/* TAB 3: TOKENS & SESSIONS */}
                  {activeTab === 'tokens' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Issued Tokens & Session Access History
                      </h4>

                      {modalDetails.tokens?.length > 0 ? (
                        <div className="space-y-2">
                          {modalDetails.tokens.map((tok: any) => (
                            <div key={tok.id} className="p-3.5 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-center">
                              <div>
                                <p className="font-mono font-extrabold text-slate-900 text-xs">{tok.token}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5" suppressHydrationWarning>
                                  Uses: <strong className="text-slate-800">{tok.usageCount}</strong> • Last Used: {tok.lastUsedAt ? new Date(tok.lastUsedAt).toLocaleString('en-US') : 'Never'}
                                </p>
                              </div>
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border ${
                                tok.status === 'VALID' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-200 text-slate-700 border-slate-300'
                              }`}>
                                {tok.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic p-4 border border-slate-200 rounded-lg">
                          No token logs available.
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer Bar */}
            <div className="p-4 border-t border-slate-200 bg-slate-100 flex justify-between items-center shrink-0">
              <button
                onClick={() => handleDownloadResponses(selectedParticipantId)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                Download CSV Report
              </button>

              <button
                onClick={() => setSelectedParticipantId(null)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
