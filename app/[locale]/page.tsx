import { redirect } from 'next/navigation';

interface HomePageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const query = new URLSearchParams();
  if (sp) {
    for (const [key, val] of Object.entries(sp)) {
      if (typeof val === 'string') {
        query.set(key, val);
      } else if (Array.isArray(val)) {
        val.forEach((v) => query.append(key, v));
      }
    }
  }
  const qs = query.toString();
  const target = `/${locale || 'en'}/intervention${qs ? `?${qs}` : ''}`;
  redirect(target);
}