import { useState, useEffect, useMemo } from 'react';
import {
  MediaItem,
  UserProfile,
} from './types.ts';
import {
  ALL_MEDIA,
  CATEGORY_ROWS,
  USER_PROFILES,
  GENRE_LIST,
} from './data/mockData.ts';
import {
  filterMedia,
  toggleWatchlist,
} from './utils/filterAndWatchlist.ts';
import Navbar from './components/Navbar.tsx';
import BillboardHero from './components/BillboardHero.tsx';
import MovieRow from './components/MovieRow.tsx';
import MovieCard from './components/MovieCard.tsx';
import DetailModal from './components/DetailModal.tsx';
import VideoPlayer from './components/VideoPlayer.tsx';
import ProfileSelectorModal from './components/ProfileSelectorModal.tsx';
import Footer from './components/Footer.tsx';
import { Check, Plus, Film, AlertCircle } from 'lucide-react';

export default function App() {
  // Navigation & Filtering State
  const [activeCategory, setActiveCategory] = useState<string>('home');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Watchlist (persisted in localStorage)
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('netflix_clone_watchlist');
      return saved ? JSON.parse(saved) : ['stranger-things', 'cyberpunk-edgerunners', 'arcane'];
    } catch {
      return ['stranger-things', 'cyberpunk-edgerunners', 'arcane'];
    }
  });

  // Current Profile
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('netflix_clone_profile');
      return saved ? JSON.parse(saved) : USER_PROFILES[0];
    } catch {
      return USER_PROFILES[0];
    }
  });

  // Modals & Overlays
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<MediaItem | null>(null);
  const [playingMedia, setPlayingMedia] = useState<{ item: MediaItem; episodeId?: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync Watchlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('netflix_clone_watchlist', JSON.stringify(watchlistIds));
    } catch {
      // Storage unavailable fallback
    }
  }, [watchlistIds]);

  // Sync Profile to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('netflix_clone_profile', JSON.stringify(currentProfile));
    } catch {
      // Storage unavailable fallback
    }
  }, [currentProfile]);

  // Toast Notification Timeout
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleToggleWatchlist = (itemId: string) => {
    const updated = toggleWatchlist(watchlistIds, itemId);
    setWatchlistIds(updated);
    const targetItem = ALL_MEDIA.find(m => m.id === itemId);
    const title = targetItem ? targetItem.title : 'Title';
    if (updated.includes(itemId)) {
      setToastMessage(`Added "${title}" to My List`);
    } else {
      setToastMessage(`Removed "${title}" from My List`);
    }
  };

  const handlePlayMedia = (item: MediaItem, episodeId?: string) => {
    setPlayingMedia({ item, episodeId });
    setModalItem(null);
  };

  // Filter media for search or dedicated category grid
  const searchOrFilteredResults = useMemo(() => {
    return filterMedia(
      ALL_MEDIA,
      searchQuery,
      activeCategory,
      selectedGenre,
      watchlistIds
    );
  }, [searchQuery, activeCategory, selectedGenre, watchlistIds]);

  // Featured billboard hero item
  const billboardItem = useMemo(() => {
    if (activeCategory === 'movies') {
      return ALL_MEDIA.find(m => m.id === 'interstellar') || ALL_MEDIA[4];
    }
    if (activeCategory === 'tv') {
      return ALL_MEDIA.find(m => m.id === 'squid-game') || ALL_MEDIA[3];
    }
    // Default home hero
    return ALL_MEDIA[0]; // Stranger Things
  }, [activeCategory]);

  const isBrowsingGrid =
    Boolean(searchQuery.trim()) ||
    activeCategory === 'my-list' ||
    selectedGenre !== 'all';

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={cat => {
          setActiveCategory(cat);
          setSelectedGenre('all');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentProfile={currentProfile}
        onSelectProfile={setCurrentProfile}
        onOpenProfileManager={() => setIsProfileModalOpen(true)}
        watchlistCount={watchlistIds.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Interactive Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#252525] border border-white/20 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* View Mode 1: Grid Mode (Search / My List / Specific Genre Filter) */}
        {isBrowsingGrid ? (
          <div className="pt-24 md:pt-28 px-4 md:px-12 max-w-[1920px] mx-auto space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252525] pb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {searchQuery ? (
                    <span>
                      Results for <span className="text-red-500">&ldquo;{searchQuery}&rdquo;</span>
                    </span>
                  ) : activeCategory === 'my-list' ? (
                    'My List'
                  ) : (
                    `${activeCategory === 'tv' ? 'TV Shows' : activeCategory === 'movies' ? 'Movies' : 'Browse'}`
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  {searchOrFilteredResults.length}{' '}
                  {searchOrFilteredResults.length === 1 ? 'title found' : 'titles found'}
                </p>
              </div>

              {/* Genre Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 hidden sm:inline">Genre:</span>
                <select
                  value={selectedGenre}
                  onChange={e => setSelectedGenre(e.target.value)}
                  className="bg-[#242424] border border-[#3b3b3b] text-white text-xs sm:text-sm rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
                  aria-label="Filter by genre"
                >
                  {GENRE_LIST.map(genre => (
                    <option key={genre} value={genre === 'All Genres' ? 'all' : genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {searchOrFilteredResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                {searchOrFilteredResults.map(item => (
                  <MovieCard
                    key={item.id}
                    item={item}
                    isInWatchlist={watchlistIds.includes(item.id)}
                    onToggleWatchlist={handleToggleWatchlist}
                    onOpenModal={setModalItem}
                    onPlay={handlePlayMedia}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#202020] flex items-center justify-center text-gray-400">
                  <Film className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {activeCategory === 'my-list'
                    ? "You haven't added any titles to your list yet."
                    : 'No matches found.'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 max-w-md">
                  {activeCategory === 'my-list'
                    ? 'Explore trending movies and series, and click the "+" button to add them here for quick access anytime.'
                    : 'Try searching for another movie, TV series, director, actor, or genre.'}
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('home');
                    setSearchQuery('');
                    setSelectedGenre('all');
                  }}
                  className="bg-white hover:bg-gray-200 text-black font-semibold text-xs sm:text-sm px-5 py-2 rounded transition-colors"
                >
                  Explore Trending Titles
                </button>
              </div>
            )}
          </div>
        ) : (
          /* View Mode 2: Iconic Netflix Home Feed (Billboard + Horizontal Trays) */
          <div>
            {/* Billboard Hero Banner */}
            <BillboardHero
              item={billboardItem}
              onPlay={handlePlayMedia}
              onMoreInfo={setModalItem}
            />

            {/* Category Trays */}
            <div className="relative -mt-16 sm:-mt-24 md:-mt-32 z-20 space-y-4 sm:space-y-6 md:space-y-8">
              {CATEGORY_ROWS.map(row => {
                // If viewing 'tv', filter items to tv; if 'movies', filter to movies
                let items = row.items;
                if (activeCategory === 'tv') {
                  items = items.filter(i => i.type === 'tv');
                } else if (activeCategory === 'movies') {
                  items = items.filter(i => i.type === 'movie');
                }

                if (items.length === 0) return null;

                const filteredRow = { ...row, items };

                return (
                  <MovieRow
                    key={row.id}
                    row={filteredRow}
                    watchlistIds={watchlistIds}
                    onToggleWatchlist={handleToggleWatchlist}
                    onOpenModal={setModalItem}
                    onPlay={handlePlayMedia}
                  />
                );
              })}

              {/* Watchlist Quick Row if items present */}
              {watchlistIds.length > 0 && (
                <MovieRow
                  row={{
                    id: 'my-list-row',
                    title: `My List (${watchlistIds.length})`,
                    items: ALL_MEDIA.filter(m => watchlistIds.includes(m.id)),
                  }}
                  watchlistIds={watchlistIds}
                  onToggleWatchlist={handleToggleWatchlist}
                  onOpenModal={setModalItem}
                  onPlay={handlePlayMedia}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Detail Modal Dialog */}
      {modalItem && (
        <DetailModal
          item={modalItem}
          isOpen={Boolean(modalItem)}
          onClose={() => setModalItem(null)}
          isInWatchlist={watchlistIds.includes(modalItem.id)}
          onToggleWatchlist={handleToggleWatchlist}
          onPlay={handlePlayMedia}
          onSelectRelated={setModalItem}
        />
      )}

      {/* Fullscreen Video Player */}
      {playingMedia && (
        <VideoPlayer
          item={playingMedia.item}
          initialEpisodeId={playingMedia.episodeId}
          onClose={() => setPlayingMedia(null)}
        />
      )}

      {/* Profile Selector Modal ("Who's watching?") */}
      <ProfileSelectorModal
        currentProfile={currentProfile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSelectProfile={setCurrentProfile}
      />
    </div>
  );
}
