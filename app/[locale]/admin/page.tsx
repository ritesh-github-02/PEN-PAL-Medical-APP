import prisma from '@/lib/prisma';
import { ExportButton } from './ExportButton';
import { logout } from '../intervention/actions';

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
  let searchResults: any[] = [];
  let recentLogins: any[] = [];
  let activeNowCount = 0;

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
      take: 50 // Increased limit for scrollable view
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

    if (q) {
      searchResults = await prisma.participant.findMany({
        where: {
          OR: [
            { externalId: { contains: q, mode: 'insensitive' } },
            { id: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: {
          _count: {
            select: { sessions: true, responses: true }
          },
          sessions: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        take: 10
      });
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
      allParticipants = baseParticipants.filter(p => 
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
  // Add total participants summary as first item
  overviewItems.push({
    type: 'summary',
    title: 'Total Participants',
    value: participantCount.toString()
  });
  // Add recent logins
  recentLogins.forEach(login => {
    overviewItems.push({
      type: 'login',
      login: login
    });
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        
        <header className="flex justify-between items-center pb-4 border-b border-teal-100">
          <div>
            <h1 className="text-3xl font-light tracking-tight">PEN-PAL <span className="font-medium">Admin Portal</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <form action={logout}>
              <button 
                type="submit"
                className="text-xs font-bold text-teal-600 hover:text-teal-800 uppercase tracking-wider transition-colors"
              >
                Logout
              </button>
            </form>
            <span className="text-xs font-bold text-teal-500 uppercase tracking-wider px-2 py-0.5 bg-teal-50 border border-teal-100">Secure Domain</span>
          </div>
        </header>

        {dbError && (
          <div className="bg-white border-l-4 border-teal-400 text-zinc-900 px-4 py-3 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-teal-100 flex items-center justify-center font-bold text-teal-600">!</div>
              <div>
                <p className="font-semibold uppercase tracking-wider text-xs text-teal-600">Database Connection Error</p>
                <p className="text-xs text-zinc-500 mt-0.5">PostgreSQL is not responding. Showing 0 counts.</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Metric Card - Total Participants */}
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 shadow-lg border border-teal-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-bold uppercase tracking-wider mb-1">Total Participants</p>
              <p className="text-5xl font-light tracking-tight text-white">{participantCount}</p>
              <p className="text-teal-200/70 text-xs mt-2">Enrolled in PEN-PAL study</p>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Statistics Cards for Sessions and Events */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 border border-teal-100">
            <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Sessions Logged</h3>
            <p className="text-3xl font-light tracking-tight">{sessionCount}</p>
          </div>
          <div className="bg-white p-4 border border-teal-100">
            <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Events Captured</h3>
            <p className="text-3xl font-light tracking-tight">{eventCount}</p>
          </div>
        </div>

        {/* Participant Overview Grid - Scrollable, showing 4 items */}
        <div className="bg-white p-4 border border-teal-100">
          <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Participant Overview</h3>
          <div className="h-[220px] overflow-y-auto space-y-2">
            {overviewItems.map((item, index) => (
              <div key={index} className="flex items-center p-2 bg-teal-50/50 rounded hover:bg-teal-100/50 transition-colors">
                <div className="w-3 h-3 bg-teal-400 rounded-full mr-3"></div>
                <div className="flex-1">
                  {item.type === 'login' ? (
                    <>
                      <p className="text-xs font-medium text-teal-600">{item.login.participant?.externalId || 'Unknown User'}</p>
                      <p className="text-xs text-teal-400">{new Date(item.login.createdAt).toLocaleTimeString()} • {new Date(item.login.createdAt).toLocaleDateString()}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-medium text-teal-600">{item.title}</p>
                      <p className="text-xs text-teal-400">{item.value}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
            {overviewItems.length === 0 && (
              <p className="text-xs text-teal-400 text-center italic">No participant data available</p>
            )}
          </div>
        </div>

        {/* Detailed Participant Data Grid */}
        <div className="bg-white border border-teal-100 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-teal-50 bg-teal-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600">All Participants - Detailed View</h3>
              <p className="text-xs text-teal-500">Complete participant roster with activity metrics</p>
            </div>
            <span className="text-xs font-bold text-teal-500 bg-white px-2 py-1 rounded border border-teal-100">
              {allParticipants.length} Total
            </span>
          </div>
          
          {/* Search within the grid */}
          <div className="p-4 border-b border-teal-50 bg-gray-50/50">
            <form action="" className="flex gap-3">
              <input 
                type="text"
                name="q"
                defaultValue={q || ''}
                placeholder="Search by Research ID (externalId) or DB ID..."
                className="flex-1 px-3 py-2 border border-teal-100 bg-white focus:bg-white focus:border-teal-300 focus:outline-none transition-all font-light text-sm"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-teal-700 transition-colors"
              >
                Search
              </button>
              {q && (
                <a 
                  href="/admin"
                  className="px-4 py-2 bg-white border border-teal-100 text-teal-600 text-xs font-bold uppercase tracking-wider hover:bg-teal-50 transition-colors"
                >
                  Clear
                </a>
              )}
            </form>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            {allParticipants.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-teal-50 sticky top-0 z-10">
                  <tr className="border-b border-teal-100">
                    <th className="px-4 py-3 text-xs font-bold text-teal-600 uppercase tracking-wider whitespace-nowrap">Participant ID</th>
                    <th className="px-4 py-3 text-xs font-bold text-teal-600 uppercase tracking-wider whitespace-nowrap">Group</th>
                    <th className="px-4 py-3 text-xs font-bold text-teal-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-xs font-bold text-teal-600 uppercase tracking-wider whitespace-nowrap text-center">Sessions</th>
                    <th className="px-4 py-3 text-xs font-bold text-teal-600 uppercase tracking-wider whitespace-nowrap text-center">Responses</th>
                    <th className="px-4 py-3 text-xs font-bold text-teal-600 uppercase tracking-wider whitespace-nowrap text-center">Tokens</th>
                    <th className="px-4 py-3 text-xs font-bold text-teal-600 uppercase tracking-wider whitespace-nowrap text-center">Events</th>
                    <th className="px-4 py-3 text-xs font-bold text-teal-600 uppercase tracking-wider whitespace-nowrap">Last Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-50">
                  {allParticipants.map((p) => (
                    <tr key={p.id} className="hover:bg-teal-25/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-mono text-teal-600 font-medium">{p.externalId || '—'}</p>
                          <p className="text-[10px] text-teal-400 uppercase tracking-wider">DB: {p.id.slice(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold py-0.5 px-2 rounded-full ${
                          p.groupId === 'INTERVENTION'
                            ? 'bg-teal-100 text-teal-700 border border-teal-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {p.groupId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold py-0.5 px-2 rounded-full ${
                          p.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : p.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-teal-600">{p._count.sessions}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-teal-600">{p._count.responses}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-teal-600">{p._count.tokens}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-teal-600">{p._count.events}</span>
                      </td>
                      <td className="px-4 py-3">
                        {p.sessions.length > 0 ? (
                          <p className="text-xs text-teal-500">
                            {new Date(p.sessions[0].createdAt).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-xs text-teal-300 italic">No sessions</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-teal-400 italic font-light">
                {q ? (
                  <>No participants found matching "<strong>{q}</strong>".</>
                ) : (
                  'No participants found in the database.'
                )}
              </div>
            )}
          </div>
        </div>

        {q && searchResults.length > 0 && (
          <div className="bg-white border border-teal-100 overflow-hidden">
            <div className="p-4 border-b border-teal-50 bg-teal-50 flex justify-between items-center">
               <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600">Quick Search Results (Legacy View)</h3>
               <span className="text-xs font-bold text-teal-500">{searchResults.length} found</span>
            </div>
            <div className="divide-y divide-teal-50">
              {searchResults.map((p) => (
                <div key={p.id} className="p-4 flex flex-col sm:flex-row justify-between gap-4 hover:bg-teal-50/50 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium text-sm tracking-tight">{p.externalId || 'No External ID'}</p>
                    <p className="text-xs font-mono text-teal-400 uppercase tracking-wider">DB_ID: {p.id}</p>
                    {p.sessions.length > 0 ? (
                      <p className="text-xs text-teal-400 mt-1">
                        Last active: {new Date(p.sessions[0].createdAt).toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-xs text-teal-400 mt-1 italic">No sessions</p>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-0.5">Sessions</p>
                      <p className="text-lg font-light">{p._count.sessions}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-0.5">Responses</p>
                      <p className="text-lg font-light">{p._count.responses}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-0.5">Group</p>
                      <p className="text-xs font-bold py-0.5 px-2 bg-teal-50 border border-teal-100 rounded-full">{p.groupId}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-teal-100 mt-6">
          <div className="p-4 border-b border-teal-50">
            <h2 className="text-xl font-light tracking-tight">Data Export</h2>
            <p className="text-xs text-teal-500 mt-1 font-light">Export structured analytical payloads directly to CSV format.</p>
          </div>
          
          <div className="p-4 space-y-3 bg-teal-50/50">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-white border border-teal-100 hover:border-teal-200 transition-colors gap-3">
                <div>
                  <h4 className="font-medium tracking-tight">Participant Responses</h4>
                  <p className="text-xs text-teal-500 mt-0.5 font-light">Export explicit questionnaire answers.</p>
                </div>
                <ExportButton type="responses" />
             </div>

             <div className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-white border border-teal-100 hover:border-teal-200 transition-colors gap-3">
                <div>
                  <h4 className="font-medium tracking-tight">Event Logs</h4>
                  <p className="text-xs text-teal-500 mt-0.5 font-light">Detailed behavioral analytics events.</p>
                </div>
                <ExportButton type="events" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}