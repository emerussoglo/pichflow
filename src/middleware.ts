import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('pichflow_token');
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/connexion') || 
                     pathname.startsWith('/inscription');
                     
  // Liste des routes protégées qui ne commencent pas par /dashboard

  const protectedRoutes = [
    '/parametres', 
    '/devis', 
    '/clients', 
    '/factures', 
    '/copywriting', 
    '/contenu-ia', 
    '/confirmation', 
    '/rapports', 
    '/buy-credits', 
    '/credits', 
    '/factureinfo', 
    '/change-password',
    '/historique-ai'
  ];

  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                           protectedRoutes.some(route => pathname.startsWith(route));

  // 1. Si pas de token et tente d'accéder à une page protégée
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/connexion', request.url));
  }

  // 2. Si déjà connecté et tente d'aller sur connexion/inscription
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Le matcher définit sur quelles routes le middleware s'exécute
export const config = { 
  matcher: [ 
    '/dashboard/:path*',
    '/parametres/:path*',
    '/devis/:path*',
    '/factures/:path*',
    '/copywriting/:path*',
    '/confirmation/:path*',
    '/clients/:path*',
    '/contenu-ia/:path*',
    '/rapports/:path*',
    '/buy-credits/:path*',
    '/credits/:path*',
    '/factureinfo/:path*',
    '/change-password/:path*',
    '/historique-ai/:path*',
    '/connexion',
    '/inscription'
  ],
};