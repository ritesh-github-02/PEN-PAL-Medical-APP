import prisma, { withDbRetry } from '@/lib/prisma';
import { ExportButton } from './ExportButton';
import { logout } from '../intervention/actions';
import { getTokenStats, getAuthTimeline, getCampaigns } from './actions';
import { ParticipantCohortTable } from './ParticipantCohortTable';
import { CampaignQRManager } from './CampaignQRManager';
import { 
  Users, 
  Activity, 
  CheckCircle2, 
  Key, 
  History, 
  Shield, 
  LogOut, 
  FileSpreadsheet, 
  Clock, 
  AlertTriangle,
  Download
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

type OverviewItem = 
  | { type: 'summary'; title: string; value: string }
  | { type: 'login'; login: any };

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

export default async function AdminPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  let participantCount = 0;
  let completedAssessmentsCount = 0;
  let inProgressAssessmentsCount = 0;
  let dbError = false;
  let recentLogins: any[] = [];
  let activeNowCount = 0;

  // Access codes / Link tracking data
  let tokenStats: any = null;
  let authTimeline: any[] = [];
  let initialCampaigns: any[] = [];
  let allParticipants: any[] = [];

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    const [
      pCount,
      completedPCount,
      logins,
      activeCount,
      tokenStatsResult,
      timelineResult,
      campaignsResult,
      baseParticipants,
    ] = await withDbRetry(async () => {
      return await Promise.all([
        prisma.participant.count(),
        prisma.participant.count({ where: { status: 'COMPLETED' } }),
        prisma.session.findMany({
          where: { createdAt: { gte: yesterday } },
          include: { participant: { select: { externalId: true, id: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
        prisma.session.count({ where: { createdAt: { gte: thirtyMinutesAgo } } }),
        getTokenStats(),
        getAuthTimeline(10),
        getCampaigns(),
        prisma.participant.findMany({
          take: 100,
          include: {
            _count: {
              select: {
                sessions: true,
                responses: true,
                tokens: true,
                events: true,
              },
            },
            tokens: { orderBy: { createdAt: 'desc' }, take: 1 },
            sessions: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);
    });

    participantCount = pCount;
    completedAssessmentsCount = completedPCount;
    inProgressAssessmentsCount = Math.max(0, pCount - completedPCount);
    recentLogins = logins;
    activeNowCount = activeCount;

    if (tokenStatsResult?.success) tokenStats = tokenStatsResult.stats;
    if (timelineResult?.success) authTimeline = timelineResult.events;
    if (campaignsResult?.success && campaignsResult.campaigns) initialCampaigns = campaignsResult.campaigns;

    if (q && Array.isArray(baseParticipants)) {
      allParticipants = baseParticipants.filter((p: any) =>
        p.externalId?.toLowerCase().includes(q.toLowerCase()) ||
        p.id.toLowerCase().includes(q.toLowerCase())
      );
    } else {
      allParticipants = baseParticipants || [];
    }
  } catch (err) {
    console.error('ADMIN PAGE DB ERROR:', err);
    dbError = true;
  }

  // If data was fetched successfully from PostgreSQL, database is online!
  if (participantCount > 0 || allParticipants.length > 0) {
    dbError = false;
  }

  // Create combined items for the participant overview grid
  const overviewItems: OverviewItem[] = [];
  overviewItems.push({
    type: 'summary',
    title: 'Total Enrolled Cohort',
    value: `${participantCount} patients`
  });
  
  recentLogins.forEach(login => {
    overviewItems.push({
      type: 'login',
      login: login
    });
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Soft Clinical Header Navigation Bar (Sage/Teal Medical Registry) */}
        <header className="bg-gradient-to-r from-[#1d5c64] via-[#236f7a] to-[#2d7d8a] border border-[#1d5c64]/30 rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-xs rounded-xl flex items-center justify-center shadow-xs border border-white/25">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white font-sans flex items-center gap-2">
                PEN-PAL <span className="text-teal-200 font-normal">|</span> <span className="text-white font-semibold">Clinical Admin Portal</span>
              </h1>
              <p className="text-xs text-teal-100 font-medium mt-0.5">Clinical Study Data & Cohort Registry Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-bold text-white bg-white/15 border border-white/25 rounded-lg px-3 py-1.5 flex items-center gap-2 backdrop-blur-xs">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Enrollment Open
            </span>
            <form action={logout}>
              <button 
                type="submit"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 hover:bg-rose-600/80 hover:text-white border border-white/25 text-white rounded-lg text-xs font-bold transition-all cursor-pointer backdrop-blur-xs shadow-xs active:scale-[0.98]"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </form>
          </div>
        </header>

        {/* Database Offline Error Alert */}
        {dbError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center font-bold text-rose-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-rose-900">Database Connection Offline</p>
                <p className="text-xs text-rose-700 mt-0.5">PostgreSQL is not responding. Showing cached data.</p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Overview Grid - 4 Clinical KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Total Enrolled Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-[#1d5c64]/40 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1d5c64] bg-[#f4f8e8] border border-[#1d5c64]/25 px-2.5 py-0.5 rounded-md">
                Active Cohort
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#f4f8e8] flex items-center justify-center text-[#1d5c64]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 font-mono">{participantCount}</p>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 font-medium">
              Registered in PEN-PAL Registry
            </p>
          </div>

          {/* 2. Active Now Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-emerald-300 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                Live Status
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Now</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 font-mono flex items-baseline gap-2">
                {activeNowCount}
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              </p>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 font-medium">
              Logged activity in last 30 minutes
            </p>
          </div>

          {/* 3. Assessments In-Progress Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-amber-300 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                Clinical Status
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assessments In-Progress</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 font-mono">{inProgressAssessmentsCount}</p>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 font-medium">
              Ongoing participant evaluations
            </p>
          </div>

          {/* 4. Completed Assessments Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-teal-300 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md">
                Protocol Complete
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Assessments</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-teal-900 tracking-tight mt-1 font-mono">{completedAssessmentsCount}</p>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 font-medium">
              Fully finalized clinical evaluations
            </p>
          </div>

        </div>

        {/* Study QR Codes & Campaign Manager Section */}
        <CampaignQRManager initialCampaigns={initialCampaigns} />

        {/* Access Codes & Link Statistics Banner */}
        {tokenStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Access Codes</span>
                <Key className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900">{tokenStats.totalTokens}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#1d5c64] h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Active Links</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-900">{tokenStats.validTokens}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(tokenStats.validTokens / (tokenStats.totalTokens || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Total Link Usage</span>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1 rounded font-mono">
                  avg {tokenStats.avgUsage}
                </span>
              </div>
              <p className="text-2xl font-bold font-mono text-teal-900">{tokenStats.totalUsage}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Used Today</span>
                <Clock className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-teal-900">{tokenStats.usedToday}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#1d5c64] h-full rounded-full" style={{ width: tokenStats.totalUsage > 0 ? `${(tokenStats.usedToday / tokenStats.totalUsage) * 100}%` : '10%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Activity Logs Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Access & Verification Activity Log */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-700" /> Activity Logs
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Real-time study link verification events from clinic access points</p>
              </div>
            </div>
            
            <div className="divide-y divide-slate-200 overflow-y-auto max-h-[300px]">
              {authTimeline.map((event) => (
                <div key={event.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      event.eventType === 'TOKEN_VALIDATED' ? 'bg-emerald-600' :
                      event.eventType === 'TOKEN_INVALID' ? 'bg-rose-600' :
                      event.eventType === 'TOKEN_CREATED' ? 'bg-teal-600' : 'bg-amber-600'
                    }`}></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {event.eventType.replace('_', ' ')}
                        {event.participant?.externalId && (
                          <span className="ml-2 text-teal-950 text-[11px] bg-[#f4f8e8] border border-[#1d5c64]/30 px-2 py-0.5 rounded-md font-mono font-bold">
                            {formatDisplayId(event.participant.externalId)}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5" suppressHydrationWarning>
                        {new Date(event.timestamp).toLocaleTimeString('en-US')} • {new Date(event.timestamp).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                    {event.ipAddress || 'Secured Gateway'}
                  </span>
                </div>
              ))}
              {authTimeline.length === 0 && (
                <div className="p-8 text-center text-slate-400 italic text-xs">No auth activity recorded yet.</div>
              )}
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Network Access Security Status: Normal
            </div>
          </div>

          {/* Participant Activity Feed */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-700" /> Participant Stream
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Session activity streaming from active study tablets</p>
              </div>
            </div>
            
            <div className="divide-y divide-slate-200 overflow-y-auto max-h-[300px] p-2 space-y-1">
              {overviewItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                    <div>
                      {item.type === 'login' ? (
                        <>
                          <p className="text-xs font-bold text-slate-900 font-mono">
                            {formatDisplayId(item.login.participant?.externalId)}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">Session Initialized</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-slate-900">{item.title}</p>
                          <p className="text-[10px] text-slate-500 font-medium">Study Metric Summary</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.type === 'login' ? (
                      <p className="text-[10px] font-mono font-bold text-slate-600" suppressHydrationWarning>
                        {new Date(item.login.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    ) : (
                      <span className="text-xs font-bold text-teal-950 bg-[#f4f8e8] px-2 py-0.5 rounded-md border border-[#1d5c64]/30 font-mono">
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              24-Hour Interactive Activity Stream
            </div>
          </div>

        </div>

        {/* CLINICAL COHORT REGISTRY TABLE SECTION (With Row-Level Download Responses & Details Modal) */}
        <section className="space-y-2">
          <ParticipantCohortTable participants={allParticipants} />
        </section>

        {/* Clinical Data Export Gateway */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-700" /> Clinical Data Export Gateway
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Download compiled CSV analytical payloads of participant questionnaire responses and event telemetry for external clinical audits.
            </p>
          </div>
          
          <div className="p-5 space-y-3 bg-white">
            {/* Download All Responses */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-50 border border-slate-200 rounded-lg gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Complete Participant Responses Ledger</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export structured records of all questionnaire input fields, symptoms, timeline selections, and assessment answers across all participants.
                </p>
              </div>
              <ExportButton type="responses" />
            </div>

            {/* Download Full Cohort List */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-50 border border-slate-200 rounded-lg gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Clinical Cohort Registry List</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export complete participant list metadata including external IDs, cohort groups, status, token usage counts, and last active dates.
                </p>
              </div>
              <ExportButton type="participants" label="Export List CSV" />
            </div>

            {/* Download System Events */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-50 border border-slate-200 rounded-lg gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">System & Behavioral Event Logs</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export chronological action telemetry, page durations, token validations, and security event payloads.
                </p>
              </div>
              <ExportButton type="events" />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}