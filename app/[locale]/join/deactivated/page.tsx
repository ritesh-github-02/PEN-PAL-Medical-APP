import Link from 'next/link';
import { QrCode, AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ campaign?: string; arm?: string }>;
}

export default async function DeactivatedCampaignPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'es' ? 'es' : 'en';
  const isEs = locale === 'es';

  const { campaign, arm } = await searchParams;
  const campaignName = campaign || (isEs ? 'Campaña del Estudio' : 'Study Campaign');
  const isControl = arm?.toLowerCase() === 'control';

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6" role="main">
      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 bg-amber-100 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Heading & Notice */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {isEs ? 'Acceso de Campaña Desactivado' : 'Campaign Access Deactivated'}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {campaignName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {isEs
              ? 'Este código QR o enlace de póster ha sido desactivado por el equipo del estudio clínico. No se están aceptando nuevos accesos a través de este canal.'
              : 'This QR code or poster link has been deactivated by the research study team. New self-enrollment is currently paused for this campaign.'}
          </p>
        </div>

        {/* Action Options */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-left text-xs">
          <div className="flex items-start gap-2.5 text-slate-700">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p>
              {isEs
                ? '¿Tiene un código de acceso o token personal proporcionado por su médico?'
                : 'Have a personal participant token or access code provided by your clinic?'}
            </p>
          </div>

          <Link
            href={isControl ? `/${locale}/control` : `/${locale}/intervention`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {isEs ? 'Introducir Código Manualmente' : 'Enter Token Manually'}
          </Link>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-400 font-mono">
          PEN-PAL CLINICAL TRIAL PROTOCOL
        </p>
      </div>
    </main>
  );
}
