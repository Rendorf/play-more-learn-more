// Cloudflare Worker in front of the site's static files (tools/deploy/wrangler.json). It only runs for the address "/"
// (assets.run_worker_first); every other file is served straight from the static files, with _headers applied.
// One Worker serves both names: https://play.pmlm.uk/ is the game (index.html) and https://pmlm.uk/ (and www) is the
// landing page (welcome.html, served at /welcome). Static files alone can't give one path a different page per host,
// so this picks it. ?stay=1 is the move page's "keep playing here" switch, so it gets the game.
// Every other host (play.pmlm.uk, workers.dev copies, a local server) and any failure falls through to the game.
// GitHub Pages ignores this folder.
const LANDING_HOSTS = ['pmlm.uk', 'www.pmlm.uk'];

export async function route(request, env) {
  try {
    const url = new URL(request.url);
    if (LANDING_HOSTS.indexOf(url.hostname) >= 0 && url.searchParams.get('stay') !== '1') {
      const res = await env.ASSETS.fetch(new Request(new URL('/welcome', url.origin), request));
      if (res.ok || res.status === 304) return res;
    }
  } catch (e) { /* the game below */ }
  return env.ASSETS.fetch(request);
}

export default { fetch: route };
