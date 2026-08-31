'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  X, 
  Users, 
  FileSpreadsheet, 
  Activity, 
  Filter,
  CheckCircle2,
  Clock,
  Timer,
  AlertCircle,
  Smartphone,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  BarChart3,
  Check,
  ChevronRight,
  ExternalLink
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
  sessions: { createdAt: string | Date; durationSeconds?: number | null }[];
  tokens: { token: string; status: string; usageCount: number; lastUsedAt: string | Date | null }[];
}

interface ParticipantCohortTableProps {
  participants: Participant[];
}

// Complete sequential curriculum of study slides
const STUDY_SLIDES_CONFIG = [
  { id: 'screen1_intro', slideNumber: 1, title: 'Introduction & Consent Briefing', subtitle: 'Nurse Anna Penicillin Intro', type: 'Intro' },
  { id: 'screen2_statistics', slideNumber: 2, title: 'Safety Statistics (100 Kids)', subtitle: 'Pediatric Allergy Epidemiology', type: 'Statistics' },
  { id: 'screen3_5_knowledge_test', slideNumber: 3, title: 'Penicillin Knowledge Quiz', subtitle: 'Interactive Knowledge Check', type: 'Quiz' },
  { id: 'screen4_testing', slideNumber: 4, title: 'Allergy Testing Education', subtitle: 'Oral Challenge & Skin Testing Info', type: 'Education' },
  { id: 'screen6_survey_intro', slideNumber: 5, title: 'Clinical Survey Overview', subtitle: 'Assessment Introduction Transition', type: 'Info' },
  { id: 'screen6_1_symptoms', slideNumber: 6, title: 'Reported Symptoms Assessment', subtitle: 'Multi-choice symptom checklist', type: 'Question' },
  { id: 'screen6_2_timing', slideNumber: 7, title: 'Age at Reaction', subtitle: 'Interactive Milestone Slider (1-26 yrs)', type: 'Question' },
  { id: 'screen6_3_onset', slideNumber: 8, title: 'Time to Symptom Onset', subtitle: '<1 hr, 1-24 hrs, or 24+ hrs onset', type: 'Question' },
  { id: 'screen6_4_resolution', slideNumber: 9, title: 'Medical Care Received', subtitle: 'Provider / Emergency Treatment', type: 'Question' },
  { id: 'screen6_4b_resolution_type', slideNumber: 10, title: 'Reaction Resolution Method', subtitle: 'Medication vs spontaneous resolution', type: 'Question' },
  { id: 'screen6_5_yetagain', slideNumber: 11, title: 'Subsequent Penicillin Exposure', subtitle: 'Re-exposure history since reaction', type: 'Question' },
  { id: 'screen7_summary', slideNumber: 12, title: 'Action Steps & Clinical Summary', subtitle: 'Printable report & Doctor Talking Points', type: 'Summary' },
];

const STEP_LABELS_MAP: Record<string, { slideNumber: number; title: string; subtitle: string; type: string }> = Object.fromEntries(
  STUDY_SLIDES_CONFIG.map(s => [s.id, s])
);

// Format date into Eastern Standard Time (EST / EDT)
function formatEST(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(d);
  } catch {
    return String(date);
  }
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

  if (rawVal === 'none_selected') {
    return 'None Selected / Not Provided';
  }

  if (rawVal === 'acknowledged') {
    return 'Viewed & Acknowledged';
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

  if (questionId === 'screen6_2_timing') {
    return `${rawVal} years old`;
  }

  return String(rawVal).replace(/_/g, ' ');
}

function formatDuration(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds <= 0) return '< 1s';
  if (totalSeconds < 60) return `${Math.round(totalSeconds * 10) / 10}s`;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.round(totalSeconds % 60);
  return `${mins}m ${secs}s`;
}

function formatDisplayId(rawId?: string | null): string {
  if (!rawId) return 'Unassigned';
  if (rawId.includes('token=') || rawId.includes('TOKEN=')) {
    const match = rawId.match(/[?&](?:token|TOKEN)=([^&#\s]+)/i);
    if (match && match[1]) return decodeURIComponent(match[1]).trim();
  }
  if (rawId.startsWith('http://') || rawId.startsWith('https://')) {
    try {
      const url = new URL(rawId);
      const t = url.searchParams.get('token') || url.searchParams.get('TOKEN');
      if (t) return t.trim();
    } catch {}
  }
  return rawId;
}

export function ParticipantCohortTable({ participants }: ParticipantCohortTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [modalDetails, setModalDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'metrics' | 'responses' | 'tokens'>('metrics');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Escape key handler for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedParticipantId) {
        setSelectedParticipantId(null);
      }
    };
    if (selectedParticipantId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedParticipantId]);

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

  // Handle single participant slide telemetry download (EST)
  const handleDownloadSlideTelemetry = (participantId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadingId(participantId);
    window.location.href = `/api/export?type=slide_metrics&participantId=${encodeURIComponent(participantId)}`;
    setTimeout(() => setDownloadingId(null), 1200);
  };

  // Open details modal
  const handleOpenDetails = async (participantId: string, initialTab: 'summary' | 'metrics' | 'responses' | 'tokens' = 'metrics') => {
    setSelectedParticipantId(participantId);
    setLoadingDetails(true);
    setModalDetails(null);
    setActiveTab(initialTab);

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

  // Extract comprehensive clinical findings from response list
  const getClinicalSummary = (responses: any[] = [], slideMetrics: any[] = []) => {
    const resMap: Record<string, any> = {};
    responses.forEach(r => {
      resMap[r.questionId] = r.answerValue;
    });

    const metricMap: Record<string, number> = {};
    slideMetrics.forEach(m => {
      metricMap[m.stepId] = m.durationMs || 0;
    });

    const primaryAllergy = resMap['screen2_allergy'] || resMap['screen1_intro'] || 'Penicillin (Amoxicillin)';
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

    return {
      primaryAllergy,
      symptomsList,
      ageAtReaction: resMap['screen6_2_timing'] ? `${resMap['screen6_2_timing']} years old` : 'Not reported',
      ageTime: metricMap['screen6_2_timing'] ? (metricMap['screen6_2_timing'] / 1000).toFixed(1) : null,
      onsetTime: resMap['screen6_3_onset'] ? formatDisplayAnswer('screen6_3_onset', resMap['screen6_3_onset']) : 'Not reported',
      onsetTimeSec: metricMap['screen6_3_onset'] ? (metricMap['screen6_3_onset'] / 1000).toFixed(1) : null,
      careReceived: resMap['screen6_4_resolution'] ? formatDisplayAnswer('screen6_4_resolution', resMap['screen6_4_resolution']) : 'Not reported',
      careTimeSec: metricMap['screen6_4_resolution'] ? (metricMap['screen6_4_resolution'] / 1000).toFixed(1) : null,
      resolutionType: resMap['screen6_4b_resolution_type'] ? formatDisplayAnswer('screen6_4b_resolution_type', resMap['screen6_4b_resolution_type']) : 'Not reported',
      resolutionTimeSec: metricMap['screen6_4b_resolution_type'] ? (metricMap['screen6_4b_resolution_type'] / 1000).toFixed(1) : null,
      reexposure: resMap['screen6_5_yetagain'] ? formatDisplayAnswer('screen6_5_yetagain', resMap['screen6_5_yetagain']) : 'Not reported',
      reexposureTimeSec: metricMap['screen6_5_yetagain'] ? (metricMap['screen6_5_yetagain'] / 1000).toFixed(1) : null,
      quizAnswer: resMap['screen3_5_knowledge_test'] ? formatDisplayAnswer('screen3_5_knowledge_test', resMap['screen3_5_knowledge_test']) : 'None Selected',
      quizTimeSec: metricMap['screen3_5_knowledge_test'] ? (metricMap['screen3_5_knowledge_test'] / 1000).toFixed(1) : null,
      symptomsTimeSec: metricMap['screen6_1_symptoms'] ? (metricMap['screen6_1_symptoms'] / 1000).toFixed(1) : null,
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
              <Users className="w-4 h-4 text-[#1d5c64]" /> CLINICAL COHORT REGISTRY
            </h3>
            <span className="text-xs font-bold text-[#1d5c64] bg-[#f4f8e8] border border-[#1d5c64]/25 px-2.5 py-0.5 rounded-full">
              {filteredParticipants.length} Participants
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Real-time study data tracking slide-by-slide open timestamps (EST), dwell times, and submitted answers.
          </p>
        </div>

        {/* Global Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          <button
            onClick={() => window.location.href = '/api/export?type=slide_metrics'}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#236f7a] hover:bg-[#1d5c64] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-teal-200" />
            Slide Timings CSV (EST)
          </button>
          <button
            onClick={() => window.location.href = '/api/export?type=responses'}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1d5c64] hover:bg-[#16484e] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-200" />
            All Answers (CSV)
          </button>
          <button
            onClick={() => window.location.href = '/api/export?type=participants'}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Cohort Roster (CSV)
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
            placeholder="Search by Participant ID (e.g. PEN-CAMP-001) or GUID..."
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
                <th className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Participant ID / Email</th>
                <th className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Study Arm</th>
                <th className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap text-center">Answers</th>
                <th className="px-4 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap text-center">Sessions</th>
                <th className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Last Session (EST)</th>
                <th className="px-5 py-3 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap text-right">Study Data & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredParticipants.map((p) => {
                const hasResponses = p._count.responses > 0;
                const isDownloading = downloadingId === p.id;
                const isCompleted = p.status === 'COMPLETED';

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    {/* Participant ID */}
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-mono font-bold text-slate-900 text-xs">
                          {formatDisplayId(p.externalId)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">GUID: {p.id.slice(0, 10)}...</p>
                      </div>
                    </td>

                    {/* Cohort Group */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                        p.groupId === 'INTERVENTION'
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.groupId === 'INTERVENTION' ? 'bg-teal-600' : 'bg-amber-600'}`}></span>
                        {p.groupId}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                        isCompleted ? 'bg-teal-50 text-teal-800 border-teal-200' :
                        p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isCompleted ? 'bg-teal-600' :
                          p.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-amber-600'
                        }`}></span>
                        {isCompleted ? 'Completed' : p.status}
                      </span>
                    </td>

                    {/* Responses Count */}
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-xs">
                      <span className={`px-2.5 py-0.5 rounded font-bold ${hasResponses ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'text-slate-400'}`}>
                        {p._count.responses} answers
                      </span>
                    </td>

                    {/* Sessions Count */}
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700 text-xs">
                      {p._count.sessions}
                    </td>

                    {/* Last Session in EST */}
                    <td className="px-5 py-3.5">
                      {p.sessions.length > 0 ? (
                        <div>
                          <p className="font-semibold text-slate-800 text-xs font-mono" suppressHydrationWarning>
                            {formatEST(p.sessions[0].createdAt)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">No sessions</p>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Slide Timing Button */}
                        <button
                          onClick={() => handleOpenDetails(p.id, 'metrics')}
                          title="View time spent and open timestamps on each slide"
                          className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-md font-bold text-[11px] transition-all cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <Timer className="w-3 h-3 text-teal-700" />
                          Slide Timings
                        </button>

                        {/* Export Slide Activity CSV Button */}
                        <button
                          onClick={(e) => handleDownloadSlideTelemetry(p.id, e)}
                          title="Download slide timing & activity CSV for this participant (EST)"
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-md font-bold text-[11px] transition-all cursor-pointer active:scale-95"
                        >
                          <Download className="w-3 h-3 text-slate-600" />
                          {isDownloading ? '...' : 'CSV'}
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
        <span className="font-semibold text-slate-700">Study Activity Timestamps: Eastern Standard Time (EST)</span>
      </div>

      {/* ================= PARTICIPANT DETAILS MODAL ================= */}
      {selectedParticipantId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="participant-modal-title">
          <div className="bg-white border border-slate-300 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Soft Clinical Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#1d5c64] via-[#236f7a] to-[#2e7d8a] text-white flex justify-between items-center shrink-0 border-b border-[#1d5c64]/30">
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-100 bg-white/20 px-2.5 py-0.5 rounded-full border border-white/25">
                    Participant Clinical Record
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-teal-800/80 px-2.5 py-0.5 rounded-full border border-white/20">
                    Arm: {modalDetails?.groupId || 'INTERVENTION'}
                  </span>
                </div>
                <h3 id="participant-modal-title" className="text-xl font-extrabold font-mono text-white tracking-wide truncate">
                  {formatDisplayId(modalDetails?.externalId || selectedParticipantId)}
                </h3>
                <p className="text-[11px] text-teal-100/90 mt-1 font-mono flex flex-wrap items-center gap-2 truncate">
                  <span>GUID: {selectedParticipantId}</span>
                  {modalDetails?.externalId && (modalDetails.externalId.startsWith('http') || modalDetails.externalId.includes('token=')) && (
                    <>
                      <span>&middot;</span>
                      <a 
                        href={modalDetails.externalId} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-white hover:underline inline-flex items-center gap-1 opacity-90 hover:opacity-100"
                        title={modalDetails.externalId}
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open Participant Link</span>
                      </a>
                    </>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedParticipantId(null)}
                aria-label="Close participant details dialog"
                className="p-2 bg-white/15 hover:bg-white/25 text-white rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100/80 px-5 pt-3 gap-2 shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'metrics'
                    ? 'border-[#1d5c64] text-[#1d5c64] bg-white rounded-t-xl shadow-xs font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Timer className="w-3.5 h-3.5 text-[#1d5c64]" />
                ⏱️ Slide-by-Slide Timing (EST)
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'summary'
                    ? 'border-[#1d5c64] text-[#1d5c64] bg-white rounded-t-xl shadow-xs font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                📋 Clinical Assessment Summary
              </button>
              <button
                onClick={() => setActiveTab('responses')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'responses'
                    ? 'border-[#1d5c64] text-[#1d5c64] bg-white rounded-t-xl shadow-xs font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                📝 All Submitted Answers ({modalDetails?.responses?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('tokens')}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'tokens'
                    ? 'border-[#1d5c64] text-[#1d5c64] bg-white rounded-t-xl shadow-xs font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                🔑 Access Codes & Sessions
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-white space-y-6">
              {loadingDetails ? (
                <div className="py-16 text-center text-slate-500 font-bold text-xs space-y-2">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p>Loading complete telemetry, slide timing, and submitted responses...</p>
                </div>
              ) : modalDetails ? (
                <>
                  {/* ================= TAB 1: SLIDE-BY-SLIDE TIMING BREAKDOWN (EST) ================= */}
                  {activeTab === 'metrics' && (
                    <div className="space-y-6">
                      {/* Top Metric Overview Banner */}
                      {(() => {
                        const totalSlideMs = modalDetails.slideMetrics?.reduce((acc: number, item: any) => acc + (item.durationMs || 0), 0) || 0;
                        const totalSeconds = Math.round(totalSlideMs / 1000);
                        const avgSecs = modalDetails.slideMetrics?.length ? (totalSlideMs / 1000 / modalDetails.slideMetrics.length).toFixed(1) : '0';
                        const maxSlide = modalDetails.slideMetrics?.reduce((prev: any, cur: any) => (cur.durationMs > (prev?.durationMs || 0) ? cur : prev), null);
                        const maxLabel = maxSlide?.stepId ? (STEP_LABELS_MAP[maxSlide.stepId]?.title || maxSlide.stepId) : 'None';

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-4 bg-teal-50/90 border border-teal-200 rounded-xl space-y-1 shadow-2xs">
                              <p className="text-[10px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Timer className="w-3.5 h-3.5 text-teal-700" />
                                Total Active Viewing Time
                              </p>
                              <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black text-teal-950 font-mono">
                                  {(totalSlideMs / 1000).toFixed(1)}s
                                </p>
                                <span className="text-xs font-bold text-teal-800">
                                  ({formatDuration(totalSeconds)})
                                </span>
                              </div>
                              <p className="text-[10px] text-teal-700">Cumulative focused time across all slides</p>
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Average Time per Slide</p>
                              <p className="text-2xl font-black text-slate-900 font-mono">{avgSecs}s</p>
                              <p className="text-[10px] text-slate-500">{modalDetails.slideMetrics?.length || 0} slides recorded</p>
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Most Deliberated Slide</p>
                              <p className="text-sm font-bold text-slate-900 truncate" title={maxLabel}>{maxLabel}</p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {maxSlide ? `${(maxSlide.durationMs / 1000).toFixed(1)}s spent (${maxSlide.visitCount || 1} views)` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Complete Slide Timeline & Dwell Table */}
                      <div className="space-y-3">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                              <Activity className="w-4 h-4 text-teal-700" />
                              Slide-by-Slide Timing (EST Timestamps & Answers)
                            </h4>
                            <p className="text-[11px] text-slate-500 font-normal">
                              Exact time when each slide was opened (EST) and active duration spent
                            </p>
                          </div>
                          
                          {/* Export Button for this participant */}
                          <button
                            type="button"
                            onClick={() => handleDownloadSlideTelemetry(modalDetails.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-teal-300" />
                            <span>Export Slide Timings CSV (EST)</span>
                          </button>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs divide-y divide-slate-100 bg-white">
                          {STUDY_SLIDES_CONFIG.map((slide) => {
                            // Find recorded metric for this step
                            const metric = modalDetails.slideMetrics?.find((m: any) => m.stepId === slide.id);
                            // Find recorded response for this step
                            const response = modalDetails.responses?.find((r: any) => r.questionId === slide.id);

                            const totalAllSlideMs = modalDetails.slideMetrics?.reduce((acc: number, m: any) => acc + (m.durationMs || 0), 0) || 1;
                            const durationMs = metric?.durationMs || 0;
                            const durationSec = (durationMs / 1000).toFixed(1);
                            const widthPercent = durationMs > 0 ? Math.min(100, Math.max(8, Math.round((durationMs / totalAllSlideMs) * 100))) : 0;
                            const isViewed = durationMs > 0 || !!response;

                            const openedEst = metric?.createdAt ? formatEST(metric.createdAt) : null;
                            const lastActiveEst = metric?.updatedAt ? formatEST(metric.updatedAt) : null;

                            return (
                              <div
                                key={slide.id}
                                className={`p-4 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                  isViewed ? 'hover:bg-slate-50/90' : 'bg-slate-50/40 opacity-75'
                                }`}
                              >
                                {/* Left Column: Slide Info & Open Timestamps */}
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  {/* Slide Number Badge */}
                                  <div
                                    className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 border font-mono mt-0.5 ${
                                      isViewed
                                        ? 'bg-teal-700 text-white border-teal-800 shadow-2xs'
                                        : 'bg-slate-100 text-slate-400 border-slate-200'
                                    }`}
                                  >
                                    <span className="text-[8px] font-bold uppercase leading-none">Slide</span>
                                    <span className="text-sm font-black leading-tight">{slide.slideNumber}</span>
                                  </div>

                                  <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                        {slide.title}
                                      </p>
                                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.2 rounded border border-slate-200">
                                        {slide.type}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-normal">
                                      {slide.subtitle} &middot; <span className="font-mono text-slate-400">{slide.id}</span>
                                    </p>

                                    {/* EST Open / Active Timestamps */}
                                    {openedEst && (
                                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-600 pt-0.5">
                                        <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                          📅 <strong>Opened (EST):</strong> {openedEst}
                                        </span>
                                        {lastActiveEst && lastActiveEst !== openedEst && (
                                          <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                            🔄 <strong>Last Active (EST):</strong> {lastActiveEst}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {/* If an answer exists on this slide and it is a question, render it right here */}
                                    {(() => {
                                      const isQuestionSlide = ['screen1_intro', 'screen3_5_knowledge_test', 'screen6_1_symptoms', 'screen6_2_timing', 'screen6_3_onset', 'screen6_4_resolution', 'screen6_4b_resolution_type', 'screen6_5_yetagain'].includes(slide.id);
                                      if (!response || !isQuestionSlide || response.answerValue === 'acknowledged') return null;
                                      return (
                                        <div className="mt-1 flex items-center gap-1.5">
                                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Answer:</span>
                                          <span className="px-2.5 py-0.5 bg-teal-50 text-teal-950 font-bold text-xs rounded border border-teal-200">
                                            {formatDisplayAnswer(slide.id, response.answerValue)}
                                          </span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>

                                {/* Right Column: Time Spent, Visits & Visual Duration Bar */}
                                <div className="w-full sm:w-64 shrink-0 flex flex-col items-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
                                    {/* Visits Counter */}
                                    <span className="text-[11px] text-slate-500 font-medium">
                                      {metric ? `${metric.visitCount || 1} ${metric.visitCount === 1 ? 'visit' : 'visits'}` : isViewed ? '1 visit' : 'Not reached'}
                                    </span>

                                    {/* Prominent Large Time Spent Badge */}
                                    <div
                                      className={`px-3 py-1 rounded-lg border font-mono font-black text-xs flex items-center gap-1.5 shadow-2xs ${
                                        durationMs > 0
                                          ? 'bg-teal-50 text-teal-950 border-teal-300 ring-1 ring-teal-400/20'
                                          : 'bg-slate-100 text-slate-400 border-slate-200'
                                      }`}
                                    >
                                      <Clock className={`w-3.5 h-3.5 ${durationMs > 0 ? 'text-teal-700' : 'text-slate-400'}`} />
                                      <span>{durationMs > 0 ? `${durationSec}s` : '0.0s'}</span>
                                    </div>
                                  </div>

                                  {/* Visual Duration Percentage Bar */}
                                  <div className="w-full flex items-center gap-2">
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80">
                                      <div
                                        className="bg-linear-to-r from-teal-600 to-teal-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${widthPercent}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 w-8 text-right font-bold shrink-0">
                                      {widthPercent}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================= TAB 2: CLINICAL ASSESSMENT SUMMARY ================= */}
                  {activeTab === 'summary' && (
                    <div className="space-y-6">
                      {/* Top Metric Cards */}
                      {(() => {
                        const totalSlideMs = modalDetails.slideMetrics?.reduce((acc: number, item: any) => acc + (item.durationMs || 0), 0) || 0;
                        const sessionDurationSec = modalDetails.sessions?.[0]?.durationSeconds || Math.round(totalSlideMs / 1000);
                        const isDone = modalDetails.status === 'COMPLETED' || modalDetails.tokens?.[0]?.status === 'CONSUMED';

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assessment Status</p>
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${isDone ? 'bg-indigo-600' : 'bg-emerald-500'}`}></span>
                                <p className="text-sm font-extrabold text-slate-900">{isDone ? 'Completed' : modalDetails.status}</p>
                              </div>
                            </div>

                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Active Time</p>
                              <div className="flex items-center gap-1.5">
                                <Timer className="w-4 h-4 text-teal-700" />
                                <p className="text-sm font-extrabold text-teal-900 font-mono">
                                  {formatDuration(Math.round(totalSlideMs / 1000))}
                                </p>
                              </div>
                            </div>

                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Session Time</p>
                              <p className="text-sm font-extrabold text-slate-900 font-mono">
                                {formatDuration(sessionDurationSec)}
                              </p>
                            </div>

                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed Questions</p>
                              <p className="text-sm font-extrabold text-slate-900 font-mono">
                                {modalDetails.responses?.length || 0} fields
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Clinical Findings Grid with Slide Timings */}
                      {(() => {
                        const summary = getClinicalSummary(modalDetails.responses, modalDetails.slideMetrics);
                        return (
                          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/70 space-y-4">
                            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                              <Activity className="w-4 h-4 text-teal-700" />
                              Recorded Clinical Profile & Specific Slide Timings
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Age at Reaction */}
                              <div className="bg-white p-3.5 border border-slate-200 rounded-xl space-y-1">
                                <div className="flex justify-between items-center">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Age at Reaction</p>
                                  {summary.ageTime && (
                                    <span className="text-[10px] font-bold font-mono text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                                      ⏱️ {summary.ageTime}s
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-extrabold text-slate-900">{summary.ageAtReaction}</p>
                              </div>

                              {/* Time to Onset */}
                              <div className="bg-white p-3.5 border border-slate-200 rounded-xl space-y-1">
                                <div className="flex justify-between items-center">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time to Onset</p>
                                  {summary.onsetTimeSec && (
                                    <span className="text-[10px] font-bold font-mono text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                                      ⏱️ {summary.onsetTimeSec}s
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-extrabold text-slate-900">{summary.onsetTime}</p>
                              </div>

                              {/* Medical Care Received */}
                              <div className="bg-white p-3.5 border border-slate-200 rounded-xl space-y-1">
                                <div className="flex justify-between items-center">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Medical Care</p>
                                  {summary.careTimeSec && (
                                    <span className="text-[10px] font-bold font-mono text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                                      ⏱️ {summary.careTimeSec}s
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-extrabold text-slate-900">{summary.careReceived}</p>
                              </div>

                              {/* Reaction Resolution */}
                              <div className="bg-white p-3.5 border border-slate-200 rounded-xl space-y-1">
                                <div className="flex justify-between items-center">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resolution Method</p>
                                  {summary.resolutionTimeSec && (
                                    <span className="text-[10px] font-bold font-mono text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                                      ⏱️ {summary.resolutionTimeSec}s
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-extrabold text-slate-900">{summary.resolutionType}</p>
                              </div>

                              {/* Penicillin Re-exposure */}
                              <div className="bg-white p-3.5 border border-slate-200 rounded-xl space-y-1">
                                <div className="flex justify-between items-center">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Re-exposure</p>
                                  {summary.reexposureTimeSec && (
                                    <span className="text-[10px] font-bold font-mono text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                                      ⏱️ {summary.reexposureTimeSec}s
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-extrabold text-slate-900">{summary.reexposure}</p>
                              </div>

                              {/* Knowledge Quiz Selection */}
                              <div className="bg-white p-3.5 border border-slate-200 rounded-xl space-y-1">
                                <div className="flex justify-between items-center">
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quiz Selection</p>
                                  {summary.quizTimeSec && (
                                    <span className="text-[10px] font-bold font-mono text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                                      ⏱️ {summary.quizTimeSec}s
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-bold text-slate-800 truncate" title={summary.quizAnswer}>{summary.quizAnswer}</p>
                              </div>
                            </div>

                            {/* Symptoms List */}
                            <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-2">
                              <div className="flex justify-between items-center">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reported Symptoms List</p>
                                {summary.symptomsTimeSec && (
                                  <span className="text-[10px] font-bold font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                    ⏱️ {summary.symptomsTimeSec}s spent on symptoms slide
                                  </span>
                                )}
                              </div>
                              {summary.symptomsList.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {summary.symptomsList.map((sym, i) => (
                                    <span key={i} className="px-3 py-1 bg-teal-50 text-teal-900 border border-teal-200 rounded-lg text-xs font-bold shadow-2xs">
                                      {sym}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 italic">No symptoms reported.</p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* ================= TAB 3: ALL SUBMITTED ANSWERS ================= */}
                  {activeTab === 'responses' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                            Explicit Questionnaire Answers
                          </h4>
                          <p className="text-[11px] text-slate-500">Every response captured with individual question timing & EST timestamps</p>
                        </div>
                        <button
                          onClick={() => handleDownloadResponses(modalDetails.id)}
                          className="px-3.5 py-1.5 bg-[#1d5c64] hover:bg-[#16484e] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                        >
                          <Download className="w-3.5 h-3.5 text-teal-200" />
                          Download Responses CSV (EST)
                        </button>
                      </div>

                      {(() => {
                        const questionIds = ['screen1_intro', 'screen3_5_knowledge_test', 'screen6_1_symptoms', 'screen6_2_timing', 'screen6_3_onset', 'screen6_4_resolution', 'screen6_4b_resolution_type', 'screen6_5_yetagain'];
                        const visibleResponses = (modalDetails.responses || []).filter((r: any) => questionIds.includes(r.questionId) && r.answerValue !== 'acknowledged');

                        if (visibleResponses.length === 0) {
                          return (
                            <p className="text-xs text-slate-500 italic p-8 text-center border border-slate-200 rounded-xl bg-slate-50">
                              No questionnaire responses recorded for this participant yet.
                            </p>
                          );
                        }

                        return (
                          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                                <tr>
                                  <th className="py-3 px-4">Question Step</th>
                                  <th className="py-3 px-4">Recorded Answer Value</th>
                                  <th className="py-3 px-4 text-center">Slide Dwell Time</th>
                                  <th className="py-3 px-4 text-right">Timestamp (EST)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 bg-white">
                                {visibleResponses.map((r: any) => {
                                  const stepInfo = STEP_LABELS_MAP[r.questionId] || { title: r.questionId, subtitle: '', type: 'Field', slideNumber: 0 };
                                  const dwellSec = r.timeSpentMs ? (r.timeSpentMs / 1000).toFixed(1) : '< 1';

                                return (
                                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-4">
                                      <p className="font-bold text-slate-900 text-xs">{stepInfo.title}</p>
                                      <p className="text-[10px] font-mono text-slate-400">{r.questionId}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-900 rounded-md font-bold text-xs border border-slate-200">
                                        {formatDisplayAnswer(r.questionId, r.answerValue)}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className="px-2 py-0.5 bg-teal-50 text-teal-900 border border-teal-200 rounded font-mono font-bold text-xs">
                                        ⏱️ {dwellSec}s
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-right text-slate-600 font-mono text-[11px]" suppressHydrationWarning>
                                      {formatEST(r.createdAt)}
                                    </td>
                                  </tr>
                                );
                              })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* ================= TAB 4: ACCESS CODES & SESSIONS ================= */}
                  {activeTab === 'tokens' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Issued Access Codes & Session History
                      </h4>

                      {modalDetails.tokens?.length > 0 ? (
                        <div className="space-y-2.5">
                          {modalDetails.tokens.map((tok: any) => (
                            <div key={tok.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/70 flex justify-between items-center">
                              <div>
                                <p className="font-mono font-black text-slate-900 text-sm tracking-wider">{tok.tokenHash || tok.token || 'PEN-CODE'}</p>
                                <p className="text-[11px] text-slate-500 mt-1 font-mono" suppressHydrationWarning>
                                  Total Consumptions: <strong className="text-slate-800">{tok.useCount || tok.usageCount || 0}</strong> &middot; Last Validated (EST): {tok.lastUsedAt ? formatEST(tok.lastUsedAt) : 'Never'}
                                </p>
                              </div>
                              <span className={`px-3 py-1 text-xs font-bold rounded-md border ${
                                tok.status === 'VALID' || tok.status === 'PENDING' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                tok.status === 'CONSUMED' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                                'bg-slate-200 text-slate-700 border-slate-300'
                              }`}>
                                {tok.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic p-4 border border-slate-200 rounded-lg">
                          No access code logs available.
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Modal Footer Bar */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadSlideTelemetry(selectedParticipantId)}
                  className="px-4 py-2 bg-[#236f7a] hover:bg-[#1d5c64] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Activity className="w-3.5 h-3.5 text-teal-200" />
                  Download Slide Timings CSV (EST)
                </button>
                <button
                  onClick={() => handleDownloadResponses(selectedParticipantId)}
                  className="px-4 py-2 bg-[#1d5c64] hover:bg-[#16484e] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-teal-200" />
                  Download Answers CSV (EST)
                </button>
              </div>

              <button
                onClick={() => setSelectedParticipantId(null)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
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
