export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: string;
  description: string;
  thumbnail: string;
  progressPercent?: number;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'tv';
  description: string;
  releaseYear: number;
  maturityRating: 'TV-Y' | 'TV-G' | 'TV-PG' | 'PG' | 'PG-13' | 'TV-14' | 'TV-MA' | 'R' | 'G';
  duration: string; // e.g. "2h 15m" or "4 Seasons"
  matchScore: number; // e.g. 98 (98% Match)
  top10Rank?: number; // 1-10
  backdropUrl: string;
  posterUrl: string;
  videoTrailerUrl: string;
  genres: string[];
  cast: string[];
  creators: string[];
  isNetflixOriginal?: boolean;
  badge?: string; // e.g. "Recently Added", "Top 10", "New Season"
  audioLanguages?: string[];
  subtitleLanguages?: string[];
  episodes?: Episode[];
}

export interface CategoryRow {
  id: string;
  title: string;
  items: MediaItem[];
  isTop10?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
}
