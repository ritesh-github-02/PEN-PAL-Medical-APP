import prisma from '@/lib/prisma';
import { ExportButton } from './ExportButton';
import { UserSearch } from './UserSearch';
import { logout } from '../intervention/actions';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  let participantCount = 0;
  let sessionCount = 0;
  let eventCount = 0;
  let dbError = false;
  let searchResults: any[] = [];

  try {
    participantCount = await prisma.participant.count();
    sessionCount = await prisma.session.count();
    eventCount = await prisma.eventLog.count();

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
          }
        },
        take: 10
      });
    }
  } catch (err) {
    dbError = true;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 sm:p-12 font-sans text-zinc-900">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        
        <header className="flex justify-between items-center pb-8 border-b border-zinc-200">
          <div>
            <h1 className="text-4xl font-light tracking-tight">PEN-PAL <span className="font-medium">Admin Portal</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <form action={logout}>
              <button 
                type="submit"
                className="text-[10px] font-bold text-zinc-400 hover:text-red-600 uppercase tracking-widest transition-colors"
              >
                Logout
              </button>
            </form>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 py-1 bg-zinc-100 border border-zinc-200">Secure Domain</span>
          </div>
        </header>

        {dbError && (
          <div className="bg-white border-l-4 border-red-600 text-zinc-900 px-6 py-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-red-100 flex items-center justify-center font-bold text-red-600">!</div>
              <div>
                <p className="font-semibold uppercase tracking-widest text-xs text-red-600">Database Connection Error</p>
                <p className="text-sm text-zinc-500 mt-1">PostgreSQL is not responding. Showing 0 counts.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 border border-zinc-200">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Total Participants</h3>
            <p className="text-5xl font-light tracking-tight">{participantCount}</p>
          </div>
          <div className="bg-white p-8 border border-zinc-200">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Sessions Logged</h3>
            <p className="text-5xl font-light tracking-tight">{sessionCount}</p>
          </div>
          <div className="bg-white p-8 border border-zinc-200">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Events Captured</h3>
            <p className="text-5xl font-light tracking-tight">{eventCount}</p>
          </div>
        </div>

        <UserSearch />

        {q && (
          <div className="bg-white border border-zinc-200 overflow-hidden">
            <div className="p-8 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
               <h3 className="text-sm font-bold uppercase tracking-widest">Search Results for "{q}"</h3>
               <span className="text-[10px] font-bold text-zinc-400">{searchResults.length} found</span>
            </div>
            {searchResults.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {searchResults.map((p) => (
                  <div key={p.id} className="p-8 flex flex-col sm:flex-row justify-between gap-6 hover:bg-zinc-50/50 transition-colors">
                    <div className="space-y-1">
                      <p className="font-medium text-lg tracking-tight">{p.externalId || 'No External ID'}</p>
                      <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">DB_ID: {p.id}</p>
                    </div>
                    <div className="flex gap-12">
                      <div className="text-center">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Sessions</p>
                        <p className="text-xl font-light">{p._count.sessions}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Responses</p>
                        <p className="text-xl font-light">{p._count.responses}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Group</p>
                        <p className="text-[10px] font-bold py-1 px-3 bg-zinc-100 border border-zinc-200 rounded-full">{p.groupId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center text-zinc-400 italic font-light">
                No participants found matching your query.
              </div>
            )}
          </div>
        )}

        <div className="bg-white border border-zinc-200 mt-12">
          <div className="p-8 border-b border-zinc-100">
            <h2 className="text-2xl font-light tracking-tight">Data Export</h2>
            <p className="text-sm text-zinc-500 mt-2 font-light">Export structured analytical payloads directly to CSV format.</p>
          </div>
          
          <div className="p-8 space-y-4 bg-zinc-50/50">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center p-6 bg-white border border-zinc-200 hover:border-zinc-400 transition-colors gap-4">
                <div>
                  <h4 className="font-medium tracking-tight">Participant Responses</h4>
                  <p className="text-sm text-zinc-500 mt-1 font-light">Export explicit questionnaire answers.</p>
                </div>
                <ExportButton type="responses" />
             </div>

             <div className="flex flex-col sm:flex-row justify-between sm:items-center p-6 bg-white border border-zinc-200 hover:border-zinc-400 transition-colors gap-4">
                <div>
                  <h4 className="font-medium tracking-tight">Event Logs</h4>
                  <p className="text-sm text-zinc-500 mt-1 font-light">Detailed behavioral analytics events.</p>
                </div>
                <ExportButton type="events" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
