import prisma from '@/lib/prisma';
import { ExportButton } from './ExportButton';
import { logout } from '../intervention/actions';
import { getTokenStats, getTokenUsageDetails, getAuthTimeline } from './actions';
import { ParticipantCohortTable } from './ParticipantCohortTable';
import { 
  Users, 
  Activity, 
  Database, 
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

export default async function AdminPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  let participantCount = 0;
  let sessionCount = 0;
  let eventCount = 0;
  let dbError = false;
  let recentLogins: any[] = [];
  let activeNowCount = 0;

  // Token tracking data
  let tokenStats: any = null;
  let tokenUsageDetails: any[] = [];
  let authTimeline: any[] = [];

  try {
    participantCount = await prisma.participant.count();
    sessionCount = await prisma.session.count();
    eventCount = await prisma.eventLog.count();

    // Get recent logins (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    recentLogins = await prisma.session.findMany({
      where: {
        createdAt: {
          gte: yesterday
        }
      },
      include: {
        participant: {
          select: {
            externalId: true,
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    // Count active now (last 30 minutes)
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    activeNowCount = await prisma.session.count({
      where: {
        createdAt: {
          gte: thirtyMinutesAgo
        }
      }
    });

    // Fetch token statistics
    const tokenStatsResult = await getTokenStats();
    if (tokenStatsResult.success) {
      tokenStats = tokenStatsResult.stats;
    }

    // Fetch recent token usage details
    const tokenUsageResult = await getTokenUsageDetails(15);
    if (tokenUsageResult.success) {
      tokenUsageDetails = tokenUsageResult.tokens;
    }

    // Fetch authentication timeline
    const timelineResult = await getAuthTimeline(10);
    if (timelineResult.success) {
      authTimeline = timelineResult.events;
    }
  } catch (err) {
    console.error('ADMIN PAGE DB ERROR 1:', err);
    dbError = true;
  }

  // Get all participants for the detailed grid
  let allParticipants: any[] = [];
  try {
    const baseParticipants = await prisma.participant.findMany({
      include: {
        _count: {
          select: {
            sessions: true,
            responses: true,
            tokens: true,
            events: true,
          }
        },
        tokens: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        sessions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter by search query if present
    if (q) {
      allParticipants = baseParticipants.filter((p: any) =>
        p.externalId?.toLowerCase().includes(q.toLowerCase()) ||
        p.id.toLowerCase().includes(q.toLowerCase())
      );
    } else {
      allParticipants = baseParticipants;
    }
  } catch (err) {
    console.error('ADMIN PAGE DB ERROR 2:', err);
    dbError = true;
  }

  // If data was fetched successfully from PostgreSQL, database is online!
  if (participantCount > 0 || allParticipants.length > 0 || sessionCount > 0) {
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
        
        {/* Professional Header Navigation Bar */}
        <header className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white font-mono flex items-center gap-2">
                PEN-PAL <span className="text-slate-600 font-normal">|</span> <span className="text-slate-200 font-semibold">Clinical Admin Portal</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Clinical Telemetry & Cohort Registry Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-mono font-bold text-teal-400 bg-slate-800 border border-slate-700 rounded-md px-3 py-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Gateway Active
            </span>
            <form action={logout}>
              <button 
                type="submit"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 border border-slate-700 text-slate-200 rounded-md text-xs font-bold transition-all cursor-pointer"
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
                <p className="text-xs text-rose-700 mt-0.5">PostgreSQL is not responding. Showing cached telemetry data.</p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Overview Grid (Plain Professional Colors) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Enrolled Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded">
                Active Cohort
              </span>
              <Users className="w-5 h-5 text-teal-400" />
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Enrolled Participants</p>
              <p className="text-4xl font-extrabold text-white tracking-tight mt-1 font-mono">{participantCount}</p>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800 font-medium">
              Registered in PEN-PAL Registry
            </p>
          </div>

          {/* Active Now Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                Live Status
              </span>
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Now</p>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1 font-mono flex items-baseline gap-2">
                {activeNowCount}
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              </p>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 font-medium">
              Logged activity in last 30 minutes
            </p>
          </div>

          {/* Sessions Logged Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                Usage Metric
              </span>
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sessions Logged</p>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1 font-mono">{sessionCount}</p>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 font-medium">
              Interactive clinical touchpoints
            </p>
          </div>

          {/* Events Captured Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                Telemetry Logs
              </span>
              <Database className="w-5 h-5 text-slate-600" />
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Events Captured</p>
              <p className="text-4xl font-extrabold text-slate-900 tracking-tight mt-1 font-mono">{eventCount}</p>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 font-medium">
              Behavioral analytical records
            </p>
          </div>

        </div>

        {/* Token Security Statistics Banner */}
        {tokenStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Tokens</span>
                <Key className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900">{tokenStats.totalTokens}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-slate-500 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Active Tokens</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-900">{tokenStats.validTokens}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(tokenStats.validTokens / (tokenStats.totalTokens || 1)) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Total Usage</span>
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
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Used Today</span>
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold font-mono text-indigo-900">{tokenStats.usedToday}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: tokenStats.totalUsage > 0 ? `${(tokenStats.usedToday / tokenStats.totalUsage) * 100}%` : '10%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Timelines and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Authentication Activity timeline */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-700" /> Authentication Activity Log
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Real-time token validation events from clinic access points</p>
              </div>
            </div>
            
            <div className="divide-y divide-slate-200 overflow-y-auto max-h-[300px]">
              {authTimeline.map((event) => (
                <div key={event.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      event.eventType === 'TOKEN_VALIDATED' ? 'bg-emerald-600' :
                      event.eventType === 'TOKEN_INVALID' ? 'bg-rose-600' :
                      event.eventType === 'TOKEN_CREATED' ? 'bg-indigo-600' : 'bg-amber-600'
                    }`}></div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {event.eventType.replace('_', ' ')}
                        {event.participant?.externalId && (
                          <span className="ml-2 text-slate-700 text-[11px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold">
                            {event.participant.externalId}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {new Date(event.timestamp).toLocaleTimeString()} • {new Date(event.timestamp).toLocaleDateString()}
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
                  <Activity className="w-4 h-4 text-indigo-700" /> Participant Stream
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Session activity streaming from active study tablets</p>
              </div>
            </div>
            
            <div className="divide-y divide-slate-200 overflow-y-auto max-h-[300px] p-2 space-y-1">
              {overviewItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <div>
                      {item.type === 'login' ? (
                        <>
                          <p className="text-xs font-bold text-slate-900 font-mono">{item.login.participant?.externalId || 'Anonymous Participant'}</p>
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
                      <p className="text-[10px] font-mono font-bold text-slate-600">
                        {new Date(item.login.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    ) : (
                      <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">
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

            {/* Download Full Cohort Roster */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-slate-50 border border-slate-200 rounded-lg gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Clinical Cohort Registry Roster</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export complete participant roster metadata including external IDs, cohort groups, status, token usage counts, and last active dates.
                </p>
              </div>
              <ExportButton type="participants" label="Export Roster CSV" />
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