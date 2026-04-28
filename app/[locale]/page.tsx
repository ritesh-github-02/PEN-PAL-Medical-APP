import {useTranslations} from 'next-intl';
import {Link} from '@/routing'; 

export default function HomePage() {
  const t = useTranslations('Index');
  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-24 sm:px-12 lg:px-24 bg-white">
      <div className="w-full max-w-3xl space-y-16">
        <div className="space-y-6">
          <h1 className="text-5xl font-light text-zinc-900 tracking-tight">{t('title')}</h1>
          <p className="text-xl text-zinc-500 leading-relaxed font-light max-w-xl">
            {t('description')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-zinc-100">
          <Link href="/control" className="group px-6 py-4 flex items-center justify-between bg-white text-zinc-900 border border-zinc-200 hover:border-zinc-900 transition-colors text-sm uppercase tracking-widest w-full sm:w-auto">
            <span>Control Site</span>
            <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </Link>
          <Link href="/intervention" className="group px-6 py-4 flex items-center justify-between bg-zinc-900 text-white border border-zinc-900 hover:bg-zinc-800 transition-colors text-sm uppercase tracking-widest w-full sm:w-auto">
            <span>Intervention App</span>
            <span className="ml-4 opacity-50 group-hover:opacity-100 transition-opacity">→</span>
          </Link>
          <Link href="/admin" className="group px-6 py-4 flex items-center justify-between text-zinc-500 hover:text-zinc-900 transition-colors text-sm uppercase tracking-widest w-full sm:w-auto">
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
