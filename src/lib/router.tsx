import { type AnchorHTMLAttributes, useSyncExternalStore } from 'react';

/**
 * Hash-based routing: works on GitHub Pages, any static host and inside
 * Telegram without server rewrites.
 */
export const ROUTES = {
  splash: '/',
  lobby: '/lobby',
  play: '/play',
  game: '/game',
  friends: '/friends',
  createRoom: '/friends/create',
  joinRoom: '/friends/join',
  profile: '/profile',
  history: '/history',
  rankings: '/rankings',
  settings: '/settings',
  rules: '/rules',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

function readPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  const path = hash.split('?')[0] ?? '';
  return path === '' ? '/' : path;
}

function subscribe(listener: () => void): () => void {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, readPath, () => '/');
}

export function navigate(path: RoutePath, options: { replace?: boolean } = {}): void {
  const url = `#${path}`;
  if (options.replace) {
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = path;
  }
}

export function goBack(fallback: RoutePath = ROUTES.lobby): void {
  if (window.history.length > 1) window.history.back();
  else navigate(fallback, { replace: true });
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: RoutePath;
}

export function Link({ to, ...rest }: LinkProps) {
  return <a href={`#${to}`} {...rest} />;
}
