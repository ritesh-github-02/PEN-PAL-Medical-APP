import prisma from '@/lib/prisma';
import { ExportButton } from './ExportButton';
import { logout } from '../intervention/actions';
import { Link } from '@/routing';
import { getTokenStats, getTokenUsageDetails, getAuthTimeline } from './actions';
import { 
  Users, 
  Activity, 
  Database, 
  Key, 
  History, 
  Search, 
  Shield, 
  LogOut, 
  FileSpreadsheet, 
  Clock, 
  AlertTriangle 
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

    // Get recent logins (last 24 hours) - increased limit for scrollable view
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
    dbError = true;
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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-slate-800 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-teal-350/10 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>
      <div className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] bg-indigo-350/15 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none animate-pulse duration-[10000ms]"></div>

      <div className="max-w-7xl mx-auto w-full space-y-8 relative z-10">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-550 to-indigo-650 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display flex items-center gap-2">
                PEN-PAL <span className="font-light text-slate-400 text-lg">|</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-700 font-semibold text-xl">Admin Telemetry Portal</span>
              </h1>
              <p className="text-[10px] text-slate-450 font-bold uppercase tracking-[0.15em] mt-0.5">Clinical Telemetry & Cohort Registry</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50/80 border border-teal-100/80 rounded-full px-3 py-1 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping"></span>
              Secure Socket
            </span>
            <form action={logout}>
              <button 
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 border border-slate-200 text-xs font-bold text-slate-600 hover:text-rose-600 hover:border-rose-200 bg-white/80 hover:bg-rose-50/50 rounded-xl shadow-sm transition-all cursor-pointer uppercase tracking-wider"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </form>
          </div>
        </header>

        {/* Database Error Banner */}
        {dbError && (
          <div className="bg-rose-50/80 backdrop-blur-md border border-rose-200 rounded-2xl p-4 text-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-rose-100/80 rounded-xl flex items-center justify-center font-bold text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-rose-800">Database Connection Offline</p>
                <p className="text-xs text-rose-600 mt-0.5 font-light">PostgreSQL is not responding. Cohort tables and metrics are displaying baseline values.</p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Hero Card: Total Enrolled */}
          <div className="lg:col-span-1 bg-gradient-to-br from-teal-600 via-teal-650 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-teal-950/10 border border-teal-500/25 relative overflow-hidden group hover:scale-[1.01] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
            {/* Background design glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full filter blur-xl transform translate-x-8 -translate-y-8 group-hover:scale-125 transition-transform duration-700"></div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-100 bg-white/10 px-3 py-1 rounded-full border border-white/10">Active Cohort</span>
                <Users className="w-6 h-6 text-teal-100" />
              </div>
              <div>
                <p className="text-slate-200/90 text-xs font-medium uppercase tracking-wider">Total Enrolled Participants</p>
                <p className="text-6xl font-extrabold tracking-tight mt-1 font-display">{participantCount}</p>
              </div>
            </div>
            
            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-teal-100/80">
              <span>Primary PEN-PAL Registry</span>
              <span className="flex items-center gap-1.5 font-medium">Live Database <span className="w-2 h-2 bg-emerald-450 rounded-full inline-block animate-pulse"></span></span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Active Now */}
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 hover:border-teal-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between group shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-teal-650 bg-teal-50 border border-teal-100 rounded-full px-2.5 py-0.5 uppercase tracking-wider">Telemetry</span>
                <Clock className="w-5 h-5 text-teal-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Now</h3>
                <p className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 font-display flex items-baseline gap-1.5">
                  {activeNowCount}
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping inline-block"></span>
                </p>
              </div>
              <p className="text-[10px] text-slate-450 mt-2 font-medium">Logged activity last 30 min</p>
            </div>

            {/* Sessions Logged */}
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 hover:border-teal-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between group shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-0.5 uppercase tracking-wider">Visits</span>
                <Activity className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sessions Logged</h3>
                <p className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 font-display">{sessionCount}</p>
              </div>
              <p className="text-[10px] text-slate-450 mt-2 font-medium">Interactive user touchpoints</p>
            </div>

            {/* Events Captured */}
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 hover:border-teal-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between group shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-650 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5 uppercase tracking-wider">Telemetry</span>
                <Database className="w-5 h-5 text-slate-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Events Captured</h3>
                <p className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 font-display">{eventCount}</p>
              </div>
              <p className="text-[10px] text-slate-450 mt-2 font-medium">Behavioral analytical records</p>
            </div>

          </div>
        </div>

        {/* Token Statistics Cards */}
        {tokenStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tokens */}
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:border-slate-350 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tokens</span>
                <Key className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-800 font-display">{tokenStats.totalTokens}</p>
              <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Active Tokens */}
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:border-slate-350 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Active Tokens</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-2xl font-bold text-slate-800 font-display">{tokenStats.validTokens}</p>
              <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(tokenStats.validTokens / (tokenStats.totalTokens || 1)) * 100}%` }}></div>
              </div>
            </div>

            {/* Total Usage */}
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:border-slate-350 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Total Usage</span>
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded font-mono">avg {tokenStats.avgUsage}</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 font-display">{tokenStats.totalUsage}</p>
              <div className="w-full bg-teal-50 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-teal-550 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Used Today */}
            <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-2xl shadow-sm hover:border-slate-350 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider">Used Today</span>
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-slate-800 font-display">{tokenStats.usedToday}</p>
              <div className="w-full bg-indigo-50 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-550 h-full rounded-full" style={{ width: tokenStats.totalUsage > 0 ? `${(tokenStats.usedToday / tokenStats.totalUsage) * 100}%` : '10%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Timelines and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Authentication Activity timeline */}
          <div className="lg:col-span-7 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-650" /> Recent Authentication Activity
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Live token validation events from clinic gateways</p>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100/80 overflow-y-auto max-h-[320px]">
              {authTimeline.map((event) => (
                <div key={event.id} className="p-4 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${
                        event.eventType === 'TOKEN_VALIDATED' ? 'bg-emerald-500 shadow-sm shadow-emerald-400' :
                        event.eventType === 'TOKEN_INVALID' ? 'bg-rose-500 shadow-sm shadow-rose-450' :
                        event.eventType === 'TOKEN_CREATED' ? 'bg-indigo-500 shadow-sm shadow-indigo-400' : 'bg-amber-500 shadow-sm shadow-amber-400'
                      }`}></div>
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-30 ${
                        event.eventType === 'TOKEN_VALIDATED' ? 'bg-emerald-400 animate-ping' :
                        event.eventType === 'TOKEN_INVALID' ? 'bg-rose-400' :
                        event.eventType === 'TOKEN_CREATED' ? 'bg-indigo-400 animate-pulse' : 'bg-amber-400'
                      }`}></span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        {event.eventType.replace('_', ' ')}
                        {event.participant?.externalId && (
                          <span className="ml-1.5 text-slate-500 text-[10px] bg-slate-100 border border-slate-200/50 px-1.5 py-0.5 rounded font-mono">
                            {event.participant.externalId}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-450 font-medium mt-0.5">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(event.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded font-mono">
                    {event.ipAddress || 'Loopback/Secured'}
                  </span>
                </div>
              ))}
              {authTimeline.length === 0 && (
                <div className="p-8 text-center text-slate-400 italic text-xs">No active telemetry events recorded yet.</div>
              )}
            </div>
            
            <div className="p-3 bg-slate-50/30 border-t border-slate-150/50 text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Network Gateways Active
              </span>
            </div>
          </div>

          {/* Participant feed */}
          <div className="lg:col-span-5 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-650" /> Participant Feed
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Activity streaming from local study devices</p>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100/80 overflow-y-auto max-h-[320px] p-2 space-y-1.5">
              {overviewItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50/40 border border-slate-200/30 rounded-xl hover:bg-slate-50 transition-colors duration-150">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <div>
                      {item.type === 'login' ? (
                        <>
                          <p className="text-xs font-bold text-slate-700 font-mono">{item.login.participant?.externalId || 'Anonymous user'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Session initialized</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-slate-700">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Metric Overview</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.type === 'login' ? (
                      <p className="text-[10px] font-mono text-slate-500">
                        {new Date(item.login.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    ) : (
                      <span className="text-xs font-bold text-indigo-755 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono">
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {overviewItems.length === 0 && (
                <div className="p-8 text-center text-slate-400 italic text-xs">No user feedback streams available.</div>
              )}
            </div>

            <div className="p-3 bg-slate-50/30 border-t border-slate-150/50 text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Tracking 24h Clinical Interactions
              </span>
            </div>
          </div>
        </div>

        {/* Token Access History Table */}
        {tokenUsageDetails.length > 0 && (
          <div className="relative z-10 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-teal-650" /> Token Authorization Ledger
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Audit log of issued secure access codes</p>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100/60 px-2.5 py-0.5 rounded-full font-mono">
                {tokenUsageDetails.length} Recent Tokens
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/30">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security Token</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Uses</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Utilized</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Origin IP</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tokenUsageDetails.map((token) => (
                    <tr key={token.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-3.5 whitespace-nowrap font-mono text-slate-600 font-medium">
                        {token.participant?.externalId || 'Unlinked'}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap font-mono font-bold text-slate-700 tracking-wider">
                        {token.token}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 rounded-full font-bold text-slate-750 font-mono border border-slate-200/30 text-[11px]">
                          {token.usageCount}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-slate-500">
                        {token.lastUsedAt ? (
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-650">
                              {new Date(token.lastUsedAt).toLocaleDateString()}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(token.lastUsedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-350 italic text-[11px]">Never used</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap font-mono text-slate-500">
                        {token.lastUsedIp || 'N/A'}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold py-1 px-3 rounded-full border ${
                          token.status === 'VALID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                          token.status === 'COMPLETED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60' :
                          token.status === 'REVOKED' ? 'bg-rose-50 text-rose-700 border-rose-200/60' : 'bg-amber-50 text-amber-700 border-amber-200/60'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            token.status === 'VALID' ? 'bg-emerald-500' :
                            token.status === 'COMPLETED' ? 'bg-indigo-500' :
                            token.status === 'REVOKED' ? 'bg-rose-500' : 'bg-amber-500'
                          }`}></span>
                          {token.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Cohort Grid */}
        <div className="relative z-10 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-655" /> Clinical Cohort Registry
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Complete participant roster with multi-point study interaction metrics</p>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-150 px-3 py-1 rounded-full shadow-sm">
              {allParticipants.length} Total Registered
            </span>
          </div>
          
          {/* Search form */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/20">
            <form action="" className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  name="q"
                  defaultValue={q || ''}
                  placeholder="Search by Research ID (externalId) or database records..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 focus:outline-none transition-all font-light text-slate-850 placeholder-slate-400"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button 
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  Search
                </button>
                {q && (
                  <Link
                    href="/admin"
                    className="px-5 py-2 bg-white border border-slate-250 text-slate-650 hover:bg-slate-50 hover:text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center font-semibold"
                  >
                    Clear Filter
                  </Link>
                )}
              </div>
            </form>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            {allParticipants.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Participant ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Cohort Group</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-center">Sessions</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-center">Responses</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-center">Tokens</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-center">Events</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Last Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allParticipants.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="space-y-0.5">
                          <p className="font-mono text-slate-700 font-semibold tracking-wide text-xs">{p.externalId || '—'}</p>
                          <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">GUID: {p.id.slice(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-2.5 rounded-full border ${
                          p.groupId === 'INTERVENTION'
                            ? 'bg-teal-50 text-teal-700 border-teal-200/50'
                            : 'bg-slate-100 text-slate-600 border-slate-200/30'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${p.groupId === 'INTERVENTION' ? 'bg-teal-500' : 'bg-slate-400'}`}></span>
                          {p.groupId}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold py-0.5 px-2.5 rounded-full border ${
                          p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                          p.status === 'COMPLETED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60' :
                          'bg-amber-50 text-amber-700 border-amber-200/60'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${
                            p.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' :
                            p.status === 'COMPLETED' ? 'bg-indigo-500' : 'bg-amber-500'
                          }`}></span>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-600 text-xs">{p._count.sessions}</td>
                      <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-600 text-xs">{p._count.responses}</td>
                      <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-600 text-xs">{p._count.tokens}</td>
                      <td className="px-6 py-3.5 text-center font-mono font-bold text-slate-600 text-xs">{p._count.events}</td>
                      <td className="px-6 py-3.5">
                        {p.sessions.length > 0 ? (
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-650">
                              {new Date(p.sessions[0].createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-[9px] text-slate-400 font-mono">
                              {new Date(p.sessions[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-350 italic font-medium">No sessions logged</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
               <div className="p-12 text-center text-slate-400 italic font-light text-xs bg-slate-50/10">
                 {q ? (
                   <span className="flex flex-col items-center gap-2">
                     <AlertTriangle className="w-8 h-8 text-slate-300" />
                     <span>No registered participants match &quot;<strong>{q}</strong>&quot;.</span>
                   </span>
                 ) : (
                   'No registered study participants exist in this database.'
                 )}
               </div>
            )}
          </div>
        </div>

        {/* Data Export Cards */}
        <div className="relative z-10 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-650" /> Clinical Data Export Gateway
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-light">Securely compile and download analytical CSV payloads of response logs for external clinical audits.</p>
          </div>
          
          <div className="p-6 space-y-4 bg-slate-50/10">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:border-teal-350 hover:shadow-md transition-all duration-300 gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 tracking-tight text-sm">Participant Responses Ledger</h4>
                  <p className="text-xs text-slate-400 mt-0.5 font-light">Export comprehensive records of all explicit questionnaire inputs, step completions, and feedback fields.</p>
                </div>
                <ExportButton type="responses" />
             </div>

             <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:border-teal-350 hover:shadow-md transition-all duration-300 gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 tracking-tight text-sm">System and Behavioral Event Logs</h4>
                  <p className="text-xs text-slate-400 mt-0.5 font-light">Export chronological action telemetry, page durations, and security event payloads.</p>
                </div>
                <ExportButton type="events" />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}