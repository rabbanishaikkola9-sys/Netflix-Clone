import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterMedia,
  toggleWatchlist,
  formatMatchScore,
  getRelatedMedia,
  formatVideoTime,
} from './filterAndWatchlist.ts';
import type { MediaItem } from '../types.ts';

const mockItems: MediaItem[] = [
  {
    id: 'stranger-things',
    title: 'Stranger Things',
    type: 'tv',
    description: 'When a young boy vanishes, a small town uncovers a mystery.',
    releaseYear: 2022,
    maturityRating: 'TV-14',
    duration: '4 Seasons',
    matchScore: 98,
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
    videoTrailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    genres: ['Sci-Fi', 'Horror', 'Drama'],
    cast: ['Millie Bobby Brown', 'David Harbour', 'Winona Ryder'],
    creators: ['The Duffer Brothers'],
    isNetflixOriginal: true,
    badge: 'Popular',
  },
  {
    id: 'glass-onion',
    title: 'Glass Onion: A Knives Out Mystery',
    type: 'movie',
    description: 'Master detective Benoit Blanc heads to Greece to peel back the layers of a mystery.',
    releaseYear: 2022,
    maturityRating: 'PG-13',
    duration: '2h 19m',
    matchScore: 94,
    backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
    videoTrailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    genres: ['Mystery', 'Comedy', 'Drama'],
    cast: ['Daniel Craig', 'Edward Norton', 'Janelle Monáe'],
    creators: ['Rian Johnson'],
    isNetflixOriginal: true,
  },
  {
    id: 'cyberpunk',
    title: 'Cyberpunk: Edgerunners',
    type: 'tv',
    description: 'A street kid trying to survive in a technology and body modification-obsessed city of the future.',
    releaseYear: 2022,
    maturityRating: 'TV-MA',
    duration: '1 Season',
    matchScore: 97,
    backdropUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477',
    videoTrailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    genres: ['Sci-Fi', 'Action', 'Anime'],
    cast: ['KENN', 'Aoi Yuki', 'Hiroki Touchi'],
    creators: ['Studio Trigger'],
    isNetflixOriginal: true,
  },
];

test('toggleWatchlist adds item when not present and removes when present', () => {
  const initial: string[] = ['item-1'];
  const added = toggleWatchlist(initial, 'item-2');
  assert.deepEqual(added, ['item-1', 'item-2']);

  const removed = toggleWatchlist(added, 'item-1');
  assert.deepEqual(removed, ['item-2']);

  const removedAll = toggleWatchlist(removed, 'item-2');
  assert.deepEqual(removedAll, []);
});

test('filterMedia filters by category: tv vs movies', () => {
  const tvShows = filterMedia(mockItems, '', 'tv');
  assert.equal(tvShows.length, 2);
  assert.ok(tvShows.every(item => item.type === 'tv'));

  const movies = filterMedia(mockItems, '', 'movies');
  assert.equal(movies.length, 1);
  assert.equal(movies[0].id, 'glass-onion');
});

test('filterMedia filters by genre', () => {
  const sciFi = filterMedia(mockItems, '', 'home', 'Sci-Fi');
  assert.equal(sciFi.length, 2);
  assert.ok(sciFi.some(item => item.id === 'stranger-things'));
  assert.ok(sciFi.some(item => item.id === 'cyberpunk'));

  const comedy = filterMedia(mockItems, '', 'home', 'Comedy');
  assert.equal(comedy.length, 1);
  assert.equal(comedy[0].id, 'glass-onion');
});

test('filterMedia searches across title, cast, and description', () => {
  const byCast = filterMedia(mockItems, 'Daniel Craig');
  assert.equal(byCast.length, 1);
  assert.equal(byCast[0].id, 'glass-onion');

  const byTitle = filterMedia(mockItems, 'stranger');
  assert.equal(byTitle.length, 1);
  assert.equal(byTitle[0].id, 'stranger-things');

  const byDescription = filterMedia(mockItems, 'modification');
  assert.equal(byDescription.length, 1);
  assert.equal(byDescription[0].id, 'cyberpunk');
});

test('filterMedia handles My List category', () => {
  const myWatchlist = ['stranger-things', 'cyberpunk'];
  const myListMedia = filterMedia(mockItems, '', 'my-list', 'all', myWatchlist);
  assert.equal(myListMedia.length, 2);
  assert.ok(myListMedia.some(i => i.id === 'stranger-things'));
  assert.ok(myListMedia.some(i => i.id === 'cyberpunk'));
});

test('formatMatchScore clamps and formats score', () => {
  assert.equal(formatMatchScore(98.4), '98% Match');
  assert.equal(formatMatchScore(105), '100% Match');
  assert.equal(formatMatchScore(-5), '0% Match');
});

test('getRelatedMedia ranks items by shared genre and type', () => {
  const related = getRelatedMedia(mockItems, mockItems[0]); // Stranger Things (tv, Sci-Fi, Horror, Drama)
  assert.ok(related.length > 0);
  // Cyberpunk also has Sci-Fi and is 'tv', so it should be the top match
  assert.equal(related[0].id, 'cyberpunk');
});

test('formatVideoTime formats seconds correctly', () => {
  assert.equal(formatVideoTime(0), '00:00');
  assert.equal(formatVideoTime(65), '01:05');
  assert.equal(formatVideoTime(3665), '1:01:05');
});
