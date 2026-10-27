import { useState, useRef, useEffect } from 'react';
import { X, Play, Plus, Check, ThumbsUp, Volume2, VolumeX } from 'lucide-react';
import { MediaItem } from '../types.ts';
import { formatMatchScore, getRelatedMedia } from '../utils/filterAndWatchlist.ts';
import { ALL_MEDIA } from '../data/mockData.ts';

interface DetailModalProps {
  item: MediaItem;
  isOpen: boolean;
  onClose: () => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (id: string) => void;
  onPlay: (item: MediaItem, episodeId?: string) => void;
  onSelectRelated: (item: MediaItem) => void;
}

export default function DetailModal({
  item,
  isOpen,
  onClose,
  isInWatchlist,
  onToggleWatchlist,
  onPlay,
  onSelectRelated,
}: DetailModalProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState('Season 1');
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Esc key closes modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Scroll modal content to top when item changes
  useEffect(() => {
    if (modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [item.id]);

  if (!isOpen) return null;

  const relatedTitles = getRelatedMedia(ALL_MEDIA, item, 6);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 backdrop-blur-sm p-0 sm:p-4 md:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        ref={modalContentRef}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#181818] rounded-none sm:rounded-lg overflow-hidden shadow-2xl border border-[#333] my-auto text-white"
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
      >
        {/* Top Media Trailer / Backdrop */}
        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            src={item.videoTrailerUrl}
            poster={item.backdropUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/30" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#181818]/80 hover:bg-[#252525] text-white flex items-center justify-center transition-colors border border-white/20"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Action Row on Backdrop */}
          <div className="absolute bottom-6 left-6 sm:left-10 right-6 sm:right-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPlay(item)}
                className="flex items-center gap-2 bg-white hover:bg-white/80 text-black font-bold px-6 py-2.5 rounded text-sm sm:text-base transition-transform hover:scale-105 active:scale-95"
                aria-label={`Play ${item.title}`}
              >
                <Play className="w-5 h-5 fill-black" />
                <span>Play</span>
              </button>

              <button
                onClick={() => onToggleWatchlist(item.id)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                  isInWatchlist
                    ? 'border-red-500 bg-red-600/30 text-red-500'
                    : 'border-white/50 hover:border-white text-white bg-black/40'
                }`}
                aria-label={isInWatchlist ? 'Remove from My List' : 'Add to My List'}
              >
                {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                  isLiked
                    ? 'border-emerald-500 bg-emerald-600/30 text-emerald-400'
                    : 'border-white/50 hover:border-white text-white bg-black/40'
                }`}
                aria-label={isLiked ? 'Liked' : 'Like'}
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = !videoRef.current.muted;
                  setIsMuted(videoRef.current.muted);
                }
              }}
              className="w-10 h-10 rounded-full border border-white/40 bg-black/40 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Metadata Row & Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left 2 Cols: Main Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5 text-sm">
                <span className="text-emerald-400 font-bold text-base">
                  {formatMatchScore(item.matchScore)}
                </span>
                <span className="text-gray-300">{item.releaseYear}</span>
                <span className="border border-gray-600 px-1.5 py-0.5 rounded text-xs text-gray-300 font-medium">
                  {item.maturityRating}
                </span>
                <span className="text-gray-300">{item.duration}</span>
                <span className="border border-gray-600 px-1 py-0.2 rounded text-[10px] text-gray-400 font-bold">
                  4K Ultra HD
                </span>
                <span className="border border-gray-600 px-1 py-0.2 rounded text-[10px] text-gray-400 font-bold">
                  Spatial Audio
                </span>
              </div>

              {item.top10Rank && (
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <span className="flex items-center justify-center bg-red-600 text-white w-5 h-5 rounded text-xs font-black">
                    #{item.top10Rank}
                  </span>
                  <span>in TV Shows Today</span>
                </div>
              )}

              <p className="text-gray-200 text-sm sm:text-base leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Right Col: Cast, Genres, Mood */}
            <div className="space-y-3 text-xs sm:text-sm text-gray-400">
              <div>
                <span className="text-gray-500 font-medium">Cast: </span>
                <span className="text-gray-200">{item.cast.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Genres: </span>
                <span className="text-gray-200">{item.genres.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Creators: </span>
                <span className="text-gray-200">{item.creators.join(', ')}</span>
              </div>
              {item.audioLanguages && (
                <div>
                  <span className="text-gray-500 font-medium">Audio: </span>
                  <span className="text-gray-200">{item.audioLanguages.slice(0, 3).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* TV Episodes Section (if TV show) */}
          {item.type === 'tv' && item.episodes && item.episodes.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#333]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Episodes</h3>
                <select
                  value={selectedSeason}
                  onChange={e => setSelectedSeason(e.target.value)}
                  className="bg-[#262626] border border-[#404040] text-white text-xs sm:text-sm rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="Season 1">Season 1</option>
                  <option value="Season 2">Season 2</option>
                  <option value="Season 3">Season 3</option>
                  <option value="Season 4">Season 4</option>
                </select>
              </div>

              <div className="divide-y divide-[#2a2a2a]">
                {item.episodes.map(ep => (
                  <div
                    key={ep.id}
                    onClick={() => onPlay(item, ep.id)}
                    className="group py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer hover:bg-[#222] p-3 rounded transition-colors"
                  >
                    <span className="text-xl font-bold text-gray-400 w-6 text-center shrink-0">
                      {ep.episodeNumber}
                    </span>

                    {/* Episode Thumbnail with play button */}
                    <div className="relative w-36 sm:w-40 aspect-video rounded overflow-hidden bg-black shrink-0">
                      <img
                        src={ep.thumbnail}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                        <div className="w-8 h-8 rounded-full border border-white/70 bg-black/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-white translate-x-0.5" />
                        </div>
                      </div>
                      {ep.progressPercent && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                          <div
                            className="h-full bg-red-600"
                            style={{ width: `${ep.progressPercent}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Episode Meta */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm sm:text-base font-semibold text-white group-hover:text-red-500 transition-colors">
                          {ep.title}
                        </h4>
                        <span className="text-xs text-gray-400 font-medium">
                          {ep.duration}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
                        {ep.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* More Like This (3-column recommendation grid) */}
          <div className="space-y-4 pt-4 border-t border-[#333]">
            <h3 className="text-xl font-bold text-white">More Like This</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedTitles.map(related => (
                <div
                  key={related.id}
                  onClick={() => onSelectRelated(related)}
                  className="bg-[#242424] hover:bg-[#2a2a2a] rounded overflow-hidden cursor-pointer transition-transform hover:-translate-y-1 group"
                >
                  <div className="relative aspect-video bg-black">
                    <img
                      src={related.backdropUrl}
                      alt={related.title}
                      className="w-full h-full object-cover"
                    />
                    {related.isNetflixOriginal && (
                      <span className="absolute top-2 left-2 bg-[#E50914] text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        N
                      </span>
                    )}
                    <span className="absolute top-2 right-2 text-xs text-white/90 font-medium drop-shadow">
                      {related.duration}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-emerald-400 font-bold">
                          {related.matchScore}% Match
                        </span>
                        <span className="border border-gray-600 px-1 py-0.2 rounded text-[10px] text-gray-300">
                          {related.maturityRating}
                        </span>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onToggleWatchlist(related.id);
                        }}
                        className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                          isInWatchlist
                            ? 'border-red-500 bg-red-600/20 text-red-500'
                            : 'border-white/50 text-white hover:border-white'
                        }`}
                        aria-label="Add related title to My List"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-semibold text-white group-hover:text-red-400 truncate">
                      {related.title}
                    </h4>

                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                      {related.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* About [Title] Details Footer */}
          <div className="pt-4 border-t border-[#333] space-y-2 text-xs sm:text-sm text-gray-400">
            <h4 className="text-base font-semibold text-white">
              About <span className="text-white font-bold">{item.title}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-gray-500">Creators: </span>
                <span className="text-gray-200">{item.creators.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-500">Cast: </span>
                <span className="text-gray-200">{item.cast.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-500">Genres: </span>
                <span className="text-gray-200">{item.genres.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-500">Maturity Rating: </span>
                <span className="text-gray-200">{item.maturityRating} - Recommended for appropriate audiences</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
