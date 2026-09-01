import { logout, validateAndConsumeToken } from '../intervention/actions';
import { 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  LogOut, 
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import ControlTracker from './ControlTracker';
import ControlExitButton from './ControlExitButton';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function ControlSitePage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === 'es' ? 'es' : 'en';
  const isEs = locale === 'es';

  const { token } = await searchParams;
  if (token) {
    try {
      await validateAndConsumeToken(token, locale);
    } catch {
      // Best-effort token consumption on landing
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-4 sm:p-6 lg:p-8" role="main" aria-label={isEs ? "Portal del Grupo de Control" : "Control Group Portal"}>
      {/* 100% Client Telemetry & Scroll Tracker */}
      <ControlTracker locale={locale} token={token} />

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Professional Header Navigation Bar */}
        <header className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-700 rounded-lg flex items-center justify-center shadow-xs" aria-hidden="true">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white font-mono flex items-center gap-2">
                PEN-PAL <span className="text-slate-500 font-normal" aria-hidden="true">|</span> <span className="text-slate-100 font-semibold">{isEs ? "Portal del Grupo de Control" : "Control Group Portal"}</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="bg-slate-800 border border-slate-700 text-teal-300 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded">
                  Protocol Version 2.1
                </span>
                <span className="text-[11px] font-semibold text-slate-300">
                  {isEs ? "Sitio de Referencia de Investigación" : "Research Baseline Site"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1" role="group" aria-label={isEs ? "Seleccionar idioma" : "Select language"}>
              <Link
                href="/en/control"
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  !isEs ? "bg-teal-700 text-white shadow-xs" : "text-slate-300 hover:text-white"
                }`}
                aria-pressed={!isEs}
              >
                English
              </Link>
              <Link
                href="/es/control"
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  isEs ? "bg-teal-700 text-white shadow-xs" : "text-slate-300 hover:text-white"
                }`}
                aria-pressed={isEs}
              >
                Español
              </Link>
            </div>

            <ControlExitButton locale={locale} label={isEs ? "Cerrar" : "Close"} />
          </div>
        </header>

        {/* Top Banner Tag */}
        <div className="bg-[#128a96] text-white py-3 px-6 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm shadow-sm flex items-center justify-between">
          <span>{isEs ? "ELIMINACIÓN DE LA ETIQUETA DE ALERGICO A LA PENICILINA" : "PENICILLIN ALLERGY DELABELING"}</span>
          <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded font-mono font-bold">PEN-PAL CLINICAL STUDY</span>
        </div>

        {/* Hero Section: Lose the Label! & Infographic */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 lg:p-10 space-y-8 shadow-xs">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              {isEs ? "¡Despídete de la etiqueta!" : "Lose the Label!"}
            </h2>
            <p className="text-xl sm:text-2xl font-bold text-[#128a96] mt-2">
              {isEs ? "Deshazte de tu alergia a la penicilina para siempre" : "Get rid of your penicillin allergy for good"}
            </p>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed mt-4 max-w-4xl">
              {isEs 
                ? 'Las personas a menudo son etiquetadas como "alérgicas a la penicilina" si tienen una mala reacción a la amoxicilina o la penicilina. La mayoría de las veces, estas reacciones no son alergias reales o peligrosas.'
                : 'People are often labeled as "penicillin allergic" if they have a bad reaction to amoxicillin or penicillin. Most of the time, these reactions are not real allergies or dangerous.'}
            </p>
          </div>

          {/* 2-Column: Content & Large Infographic */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
            
            {/* Left Col: Why does it matter & Did you know? */}
            <div className="lg:col-span-6 space-y-6">
              <div id="section-why-it-matters" className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#128a96]" aria-hidden="true"></span>
                  {isEs ? "¿Por qué es importante?" : "Why does it matter?"}
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  {isEs
                    ? "La penicilina y la amoxicilina a menudo funcionan mejor para ciertas infecciones. Las personas que tienen alergia a la penicilina pueden recibir diferentes antibióticos que no funcionan tan bien. A veces, estos otros antibióticos tienen más efectos secundarios. También pueden costar más y tener peor sabor."
                    : "Penicillin and amoxicillin often work better for certain infections. People who have a penicillin allergy may get different antibiotics that do not work as well. Sometimes these other antibiotics have more side effects. They can also cost more and taste worse."}
                </p>
              </div>

              {/* Did you know? */}
              <div id="section-did-you-know" className="bg-[#f0f9fa] border border-[#bfe7ea] rounded-xl p-6 space-y-3.5">
                <h3 className="text-base sm:text-lg font-bold text-[#0d5f67] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#128a96]" aria-hidden="true" />
                  {isEs ? "¿Sabías que?" : "Did you know?"}
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800 list-disc list-inside">
                  <li>
                    {isEs
                      ? "Muchos niños desarrollan una sarpullido cuando reciben amoxicilina, porque tienen un virus y no una alergia"
                      : "Many kids develop a rash when they get amoxicillin, because they have a virus and not an allergy"}
                  </li>
                  <li>
                    {isEs
                      ? "Las alergias a la penicilina no se transmiten en la familia"
                      : "Penicillin allergies are not passed down in families"}
                  </li>
                  <li>
                    {isEs
                      ? "El 80% de las personas con verdadera alergia a la penicilina la superan en 10 años"
                      : "80% of people with true allergy to penicillin grow out of it in 10 years"}
                  </li>
                  <li>
                    {isEs
                      ? "Un proveedor puede realizarle pruebas de forma segura administrándole una dosis de amoxicilina por vía oral"
                      : "A provider can safely test you by giving you a dose of amoxicillin by mouth"}
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Col: Large Sharp Infographic Image */}
            <div id="section-infographic" className="lg:col-span-6 flex flex-col items-center justify-center">
              <div className="w-full bg-[#1b6b93] border border-slate-300 shadow-lg overflow-hidden flex items-center justify-center">
                <img
                  src={isEs ? "/images/Spanish.png" : "/images/English.png"}
                  alt={
                    isEs
                      ? "Infografía: De cada 10 estadounidenses, 99 no tienen alergia a la penicilina, 9 tienen una falsa alergia, 1 tiene realmente alergia. UNC Medical Center."
                      : "Infographic: Out of 100 Americans, 99 have no penicillin allergy, 9 have a false allergy, 1 has a true penicillin allergy. UNC Medical Center."
                  }
                  className="w-full h-auto object-contain block"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Section: Take the Challenge! */}
        <div id="section-take-challenge" className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <CheckCircle2 className="w-6 h-6 text-[#128a96]" aria-hidden="true" />
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isEs ? "¡Enfrente el desafío!" : "Take the Challenge!"}
            </h3>
          </div>

          <p className="text-slate-800 text-sm sm:text-base font-semibold">
            {isEs
              ? "Si su médico cree que su alergia a la penicilina no es real, puede darle una dosis de amoxicilina."
              : "If your doctor believes that your penicillin allergy isn't real, they can give you a dose of amoxicillin."}
          </p>

          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
            {isEs
              ? "El médico y las enfermeras lo observarán durante 1 hora después de tomar el medicamento para asegurarse de que no sea alérgico. Si no hay signos de una reacción alérgica, ¡puede tomar antibióticos de penicilina con seguridad! Asegúrese de avisar a sus médicos y farmacia las buenas noticias."
              : "The doctor and nurses will watch you for 1 hour after taking the medicine to make sure you aren't allergic. If there are no signs of an allergic reaction, you can safely take penicillin antibiotics! Make sure you update your doctors and pharmacy with the good news."}
          </p>

          <div className="bg-slate-50 border-l-4 border-[#128a96] p-4 rounded-r-lg">
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
              {isEs
                ? "Aunque nos esforzamos por determinar qué personas pueden hacerse la prueba de forma segura, todavía existe una pequeña posibilidad de que usted pueda tener una reacción alérgica. Es por eso que le damos el medicamento en un lugar seguro donde puede obtener ayuda de inmediato si es necesario."
                : "Although we try hard to determine which people can be safely tested, there is still a small chance that you could have an allergic reaction. This is why we give you the medicine in a safe place where you can get help right away if needed."}
            </p>
          </div>
        </div>

        {/* Section: Delayed Medication Reactions */}
        <div id="section-delayed-reactions" className="bg-amber-50/70 border border-amber-200 rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-amber-200 pb-3">
            <AlertTriangle className="w-6 h-6 text-amber-700" aria-hidden="true" />
            <h3 className="text-xl font-extrabold text-amber-950 tracking-tight">
              {isEs ? "Reacciones tardías a la medicación" : "Delayed Medication Reactions"}
            </h3>
          </div>

          <p className="text-amber-900 text-xs sm:text-sm leading-relaxed">
            {isEs
              ? "Aunque no es muy común, hay algunas reacciones a medicamentos que pueden ocurrir muchos días después de recibir amoxicilina. Estas reacciones generalmente no conducen a problemas duraderos. Esto es lo que debe tener en cuenta:"
              : "Although it is not very common, there are some medicine reactions that can occur many days after getting amoxicillin. These reactions do not usually lead to lasting problems. Here's what to watch out for:"}
          </p>

          {/* List of reactions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-white/90 border border-amber-200 rounded-lg p-3 text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600" aria-hidden="true"></span>
              {isEs ? "Dolor o hinchazón en las articulaciones" : "Joint pain or swelling"}
            </div>
            <div className="bg-white/90 border border-amber-200 rounded-lg p-3 text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600" aria-hidden="true"></span>
              {isEs ? "Dolor y enrojecimiento en los ojos, la boca o la vagina" : "Pain and redness in the eyes, mouth or vagina"}
            </div>
            <div className="bg-white/90 border border-amber-200 rounded-lg p-3 text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600" aria-hidden="true"></span>
              {isEs ? "Piel que se descama o se ampolla" : "Skin that is peeling or blistering"}
            </div>
            <div className="bg-white/90 border border-amber-200 rounded-lg p-3 text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600" aria-hidden="true"></span>
              {isEs ? "Fiebre con una erupción que se propaga" : "Fever with a spreading rash"}
            </div>
          </div>

          <div className="bg-amber-100/80 border border-amber-300 p-4 rounded-lg text-xs sm:text-sm text-amber-950 font-medium">
            {isEs
              ? "Si tiene estos síntomas, debe llamar a su proveedor o acudir a una atención de urgencia. Si los síntomas son graves (como tener problemas para respirar), vaya al Departamento de Emergencias de inmediato."
              : "If you have these symptoms, you should call your provider or go to an urgent care. If the symptoms are severe (like having problems breathing), go to the Emergency Department right away."}
          </div>
        </div>

        {/* Footer & Partner Center Branding */}
        <footer className="py-6 text-center border-t border-slate-200 space-y-3">
          {/* Connecticut Children's Branding Logo representation */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-2xs">
              <span className="w-3.5 h-3.5 rounded-full bg-teal-500 inline-block" aria-hidden="true"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-purple-600 inline-block" aria-hidden="true"></span>
              <span className="text-xs font-bold text-slate-800">Connecticut Children&apos;s</span>
            </div>
          </div>

          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            &copy; {new Date().getFullYear()} PEN-PAL CLINICAL RESEARCH PROTOCOL • {isEs ? "PORTAL DEL GRUPO DE CONTROL" : "CONTROL GROUP PORTAL"}
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>Protocol ID: PENPAL-2026-CTL</span>
            <span>•</span>
            <span>IRB Approved</span>
          </div>
        </footer>

      </div>
    </main>
  );
}
