// Cloudflare Pages Function for the address "/" only (Pages file routing: functions/index.js is "/").
// One Pages project serves both names: https://play.pmlm.uk/ is the game (index.html) and https://pmlm.uk/ (and www)
// is the landing page (welcome.html, served by Pages at /welcome). Static files alone can't give one path a different
// page per host, so this picks it. ?stay=1 is the move page's "keep playing here" switch, so it gets the game.
// Every other host (play.pmlm.uk, *.pages.dev copies, a local server) and any failure falls through to the game.
// GitHub Pages ignores this folder.
const LANDING_HOSTS = ['pmlm.uk', 'www.pmlm.uk'];

export async function onRequest(ctx) {
  try {
    const url = new URL(ctx.request.url);
    if (LANDING_HOSTS.indexOf(url.hostname) < 0 || url.searchParams.get('stay') === '1') return ctx.next();
    const res = await ctx.env.ASSETS.fetch(new Request(new URL('/welcome', url.origin), ctx.request));
    return res.ok || res.status === 304 ? res : ctx.next();
  } catch (e) {
    return ctx.next();
  }
}
