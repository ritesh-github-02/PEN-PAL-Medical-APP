import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || '';
  const locale = searchParams.get('locale') || 'en';

  const destination = token 
    ? `/${locale}/intervention?token=${encodeURIComponent(token)}`
    : `/${locale}/intervention`;

  return NextResponse.redirect(new URL(destination, request.url), 302);
}
