import type { MediaItem } from '../types.ts';

/**
 * Filter media items by search query, type category, and genre.
 */
export function filterMedia(
  items: MediaItem[],
  query: string = '',
  category: string = 'home', // 'home' | 'tv' | 'movies' | 'new' | 'my-list'
  genre: string = 'all',
  watchlistIds: string[] = []
): MediaItem[] {
  let result = [...items];

  // Category filter
  if (category === 'tv') {
    result = result.filter(item => item.type === 'tv');
  } else if (category === 'movies') {
    result = result.filter(item => item.type === 'movie');
  } else if (category === 'new') {
    result = result.filter(item => item.releaseYear >= 2023 || item.badge?.includes('New') || item.badge?.includes('Recently'));
  } else if (category === 'my-list') {
    result = result.filter(item => watchlistIds.includes(item.id));
  }

  // Genre filter
  if (genre && genre !== 'all') {
    result = result.filter(item =>
      item.genres.some(g => g.toLowerCase() === genre.toLowerCase())
    );
  }

  // Text search query
  if (query && query.trim() !== '') {
    const q = query.toLowerCase().trim();
    result = result.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDescription = item.description.toLowerCase().includes(q);
      const matchGenre = item.genres.some(g => g.toLowerCase().includes(q));
      const matchCast = item.cast.some(c => c.toLowerCase().includes(q));
      return matchTitle || matchDescription || matchGenre || matchCast;
    });
  }

  return result;
}

/**
 * Toggle item presence in watchlist.
 */
export function toggleWatchlist(watchlistIds: string[], itemId: string): string[] {
  if (watchlistIds.includes(itemId)) {
    return watchlistIds.filter(id => id !== itemId);
  } else {
    return [...watchlistIds, itemId];
  }
}

/**
 * Format match score into Netflix style percentage string.
 */
export function formatMatchScore(score: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return `${clamped}% Match`;
}

/**
 * Get related titles based on shared genres and type.
 */
export function getRelatedMedia(
  items: MediaItem[],
  currentItem: MediaItem,
  limit: number = 6
): MediaItem[] {
  return items
    .filter(item => item.id !== currentItem.id)
    .map(item => {
      // Calculate relevance score based on shared genres and same media type
      let score = 0;
      if (item.type === currentItem.type) score += 2;
      const sharedGenres = item.genres.filter(g => currentItem.genres.includes(g)).length;
      score += sharedGenres * 3;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => entry.item);
}

/**
 * Format seconds into mm:ss or hh:mm:ss string.
 */
export function formatVideoTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const paddedMins = mins.toString().padStart(2, '0');
  const paddedSecs = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }
  return `${paddedMins}:${paddedSecs}`;
}
