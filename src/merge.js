// Which copy of a player to keep when family sync brings a different one. The copy with more progress wins
// (answers, then rounds), so a copy that was only saved again later, with less progress in it, can never
// overwrite a child's real progress; only a tie goes to the newer copy. A grown-up's edits in the copy that
// loses (wishes, streak wishes, the leaderboard choice, the grade) are kept if they are newer. Coins are never
// merged, so a purchase can't be undone. Pure: no state and no screen.
const PMLM_MERGE = (() => {
  const progress = p => { const s = (p && p.stats) || {}; return [s.answered || 0, s.rounds || 0]; };
  // 1: keep a, -1: take b, 0: the same copy
  function compare(a, b) {
    const pa = progress(a), pb = progress(b);
    if (pa[0] !== pb[0]) return pa[0] > pb[0] ? 1 : -1;
    if (pa[1] !== pb[1]) return pa[1] > pb[1] ? 1 : -1;
    const ta = (a && a.updatedAt) || 0, tb = (b && b.updatedAt) || 0;
    return ta === tb ? 0 : ta > tb ? 1 : -1;
  }
  const RANK = { locked: 0, unlocked: 1, granted: 2 };
  const sameWish = (a, b) => a.text === b.text && a.emoji === b.emoji && a.status === b.status;
  function wishes(keep, other, newer) {
    let changed = false;
    (other || []).forEach((wo, i) => {
      const wk = keep[i];
      if (!wk || sameWish(wk, wo)) return;
      if (newer && (wo.text !== wk.text || wo.emoji !== wk.emoji)) { wk.text = wo.text; wk.emoji = wo.emoji; changed = true; }
      if ((RANK[wo.status] || 0) > (RANK[wk.status] || 0)) { Object.assign(wk, { status: wo.status, unlockedAt: wo.unlockedAt, grantedAt: wo.grantedAt }); changed = true; }
    });
    return changed;
  }
  // Carry the grown-up edits from other into keep; true if keep changed
  function edits(keep, other) {
    if (!keep || !other) return false;
    const newer = (other.updatedAt || 0) > (keep.updatedAt || 0);
    let changed = false;
    for (const [g, go] of Object.entries(other.grades || {})) {
      const gk = (keep.grades || {})[g];
      if (gk && gk.wishes && go.wishes) changed = wishes(gk.wishes, go.wishes, newer) || changed;
    }
    if (keep.streakWishes && other.streakWishes) changed = wishes(keep.streakWishes, other.streakWishes, newer) || changed;
    else if (!keep.streakWishes && other.streakWishes && newer) { keep.streakWishes = JSON.parse(JSON.stringify(other.streakWishes)); changed = true; }
    if (newer) for (const k of ['board', 'grade']) if (other[k] !== undefined && other[k] !== keep[k]) { keep[k] = other[k]; changed = true; }
    return changed;
  }
  return { progress, compare, edits };
})();
