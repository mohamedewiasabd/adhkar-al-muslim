import { KEYS } from './keys';

export function loadFavoriteDuas(): string[] {
  try {
    const saved = localStorage.getItem(KEYS.FAVORITE_DUAS);
    return saved ? JSON.parse(saved) : ['d-q1', 'd-q3', 'd-p1'];
  } catch {
    return ['d-q1', 'd-q3'];
  }
}

export function saveFavoriteDuas(ids: string[]): void {
  try {
    localStorage.setItem(KEYS.FAVORITE_DUAS, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function loadFavoriteAwrad(): string[] {
  try {
    const saved = localStorage.getItem(KEYS.FAVORITE_AWRAD);
    return saved ? JSON.parse(saved) : ['wird-ibn-taymiyyah', 'wird-nawawi', 'wird-ratib-haddad', 'wird-bahr-shadhili'];
  } catch {
    return ['wird-ibn-taymiyyah', 'wird-nawawi', 'wird-ratib-haddad'];
  }
}

export function saveFavoriteAwrad(ids: string[]): void {
  try {
    localStorage.setItem(KEYS.FAVORITE_AWRAD, JSON.stringify(ids));
  } catch {
    // ignore
  }
}