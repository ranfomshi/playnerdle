export const REACTION_BUDGET_MS = 5000;
export const WAIT_MIN_MS = 650;
export const WAIT_MAX_MS = 1900;

export function randomWait(random = Math.random) {
  return Math.round(WAIT_MIN_MS + random() * (WAIT_MAX_MS - WAIT_MIN_MS));
}

export function rankForScore(score) {
  if (score >= 22) return 'Electric';
  if (score >= 16) return 'Lightning';
  if (score >= 10) return 'Rapid';
  if (score >= 5) return 'Sharp';
  return 'Warming up';
}

export class AlternateGame {
  constructor() { this.reset(); }

  reset() {
    this.state = 'idle';
    this.score = 0;
    this.totalReactionMs = 0;
    this.reactions = [];
    this.readyAt = null;
    this.reason = null;
    this.colourIndex = 0;
  }

  start() {
    if (this.state !== 'idle') return null;
    this.state = 'waiting';
    return { type: 'started' };
  }

  arm(now) {
    if (this.state !== 'waiting') return null;
    this.state = 'ready';
    this.readyAt = now;
    this.colourIndex = 1 - this.colourIndex;
    return { type: 'armed', colourIndex: this.colourIndex };
  }

  press(now) {
    if (this.state === 'idle') return this.start();
    if (this.state === 'waiting') return this.finish('false-start');
    if (this.state !== 'ready') return null;
    const reactionMs = Math.max(0, now - this.readyAt);
    this.totalReactionMs += reactionMs;
    this.readyAt = null;
    if (this.totalReactionMs >= REACTION_BUDGET_MS) return this.finish('budget', { reactionMs });
    this.reactions.push(reactionMs);
    this.score += 1;
    this.state = 'waiting';
    return { type: 'hit', reactionMs, score: this.score };
  }

  tick(now) {
    if (this.state !== 'ready') return null;
    const currentReactionMs = Math.max(0, now - this.readyAt);
    if (this.totalReactionMs + currentReactionMs < REACTION_BUDGET_MS) return null;
    this.totalReactionMs = REACTION_BUDGET_MS;
    this.readyAt = null;
    return this.finish('timeout');
  }

  finish(reason, details = {}) {
    this.state = 'over';
    this.reason = reason;
    return { type: 'game-over', reason, ...details };
  }

  elapsed(now) {
    return Math.min(REACTION_BUDGET_MS, this.totalReactionMs + (this.state === 'ready' ? Math.max(0, now - this.readyAt) : 0));
  }

  get averageReactionMs() {
    return this.reactions.length ? Math.round(this.reactions.reduce((sum, value) => sum + value, 0) / this.reactions.length) : 0;
  }

  get fastestReactionMs() {
    return this.reactions.length ? Math.min(...this.reactions) : 0;
  }
}
