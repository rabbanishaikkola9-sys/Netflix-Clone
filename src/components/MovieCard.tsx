import { useState, useRef } from 'react';
import { Play, Plus, Check, ThumbsUp, ChevronDown } from 'lucide-react';
import { MediaItem } from '../types.ts';
import { formatMatchScore } from '../utils/filterAndWatchlist.ts';

interface MovieCardProps {
  item: MediaItem;
  isTop10?: boolean;
  isInWatchlist: boolean;
  onToggleWatchlist: (id: string) => void;
  onOpenModal: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
}

export default function MovieCard({
  item,
  isTop10 = false,
  isInWatchlist,
  onToggleWatchlist,
  onOpenModal,
  onPlay,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  if (isTop10) {
    // Top 10 Layout: Big stylized number + vertical poster
    return (
      <div
        className="relative group shrink-0 w-36 sm:w-44 md:w-52 select-none cursor-pointer"
        onClick={() => onOpenModal(item)}
      >
        <div className="flex items-center">
          {/* Big Stylized Rank Number with Netflix 3D/Stroke Style */}
          <div className="relative w-16 sm:w-20 shrink-0 flex items-center justify-center font-['Bebas_Neue',sans-serif] text-7xl sm:text-8xl md:text-9xl font-black text-[#595959] group-hover:text-white transition-colors duration-300 select-none">
            <span
              className="relative z-10"
              style={{
                WebkitTextStroke: '4px #1a1a1a',
                paintOrder: 'stroke fill',
              }}
            >
              {item.top10Rank}
            </span>
          </div>

          {/* Vertical Poster */}
          <div className="relative w-28 sm:w-32 md:w-36 aspect-[2/3] rounded overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
            <img
              src={item.posterUrl}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            {item.isNetflixOriginal && (
              <span className="absolute top-1 left-1 bg-[#E50914] text-white text-[9px] font-black px-1 rounded-sm">
                N
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <span className="text-[11px] font-semibold text-white truncate">
                {item.title}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Landscape Card with Hover Expansion
  return (
    <div
      className="relative shrink-0 w-48 sm:w-56 md:w-64 lg:w-72 select-none group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base Card Thumbnail */}
      <div
        onClick={() => onOpenModal(item)}
        className="relative aspect-video rounded overflow-hidden cursor-pointer bg-[#202020] shadow-md transition-all duration-300 group-hover:shadow-2xl"
      >
        <img
          src={item.backdropUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        {/* Netflix 'N' Badge */}
        {item.isNetflixOriginal && (
          <span className="absolute top-2 left-2 bg-[#E50914] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow">
            N
          </span>
        )}

        {/* Badge in top right */}
        {item.badge && (
          <span className="absolute top-2 right-2 max-w-[70%] truncate bg-red-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
            {item.badge}
          </span>
        )}

        {/* Gradient Title Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2.5">
          <p className="text-white text-xs sm:text-sm font-semibold truncate drop-shadow">
            {item.title}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-gray-300">
            <span className="text-emerald-400 font-bold">{item.matchScore}%</span>
            <span>{item.duration}</span>
            <span className="border border-gray-600 px-1 py-0.2 rounded text-[9px]">
              {item.maturityRating}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Hover Card (Smooth Netflix popup) */}
      {isHovered && (
        <div
          className="absolute -top-16 left-0 right-0 z-50 w-[115%] -ml-[7.5%] bg-[#181818] rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-[#333]"
          style={{ transformOrigin: 'center' }}
        >
          {/* Card Media Header */}
          <div
            className="relative aspect-video bg-black cursor-pointer overflow-hidden"
            onClick={() => onOpenModal(item)}
          >
            <img
              src={item.backdropUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            {item.isNetflixOriginal && (
              <span className="absolute top-2 left-2 bg-[#E50914] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                N
              </span>
            )}
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-sm font-bold truncate drop-shadow">
                {item.title}
              </p>
            </div>
          </div>

          {/* Interactive Action Row & Details */}
          <div className="p-3 space-y-2.5 bg-[#181818]">
            {/* Quick Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {/* Play Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onPlay(item);
                  }}
                  className="w-8 h-8 rounded-full bg-white hover:bg-white/80 text-black flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                  aria-label={`Play ${item.title}`}
                >
                  <Play className="w-4 h-4 fill-black translate-x-0.5" />
                </button>

                {/* Watchlist Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onToggleWatchlist(item.id);
                  }}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                    isInWatchlist
                      ? 'border-red-500 bg-red-600/20 text-red-500'
                      : 'border-white/50 hover:border-white text-white bg-black/40'
                  }`}
                  aria-label={isInWatchlist ? `Remove ${item.title} from My List` : `Add ${item.title} to My List`}
                >
                  {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>

                {/* Like Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setIsLiked(!isLiked);
                  }}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                    isLiked
                      ? 'border-emerald-500 bg-emerald-600/20 text-emerald-400'
                      : 'border-white/50 hover:border-white text-white bg-black/40'
                  }`}
                  aria-label={isLiked ? `Liked ${item.title}` : `Like ${item.title}`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Expand More Info Chevron */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  onOpenModal(item);
                }}
                className="w-8 h-8 rounded-full border border-white/50 hover:border-white text-white bg-black/40 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                aria-label={`Details for ${item.title}`}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata info */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400 font-bold">
                {formatMatchScore(item.matchScore)}
              </span>
              <span className="border border-gray-600 px-1 py-0.2 rounded text-[10px] text-gray-300">
                {item.maturityRating}
              </span>
              <span className="text-gray-300">{item.duration}</span>
              <span className="border border-gray-600 px-1 py-0.2 rounded text-[9px] text-gray-400">
                HD
              </span>
            </div>

            {/* Clean unboxed genres list with typographic separator */}
            <div className="flex items-center flex-wrap gap-1 text-[11px] text-gray-300">
              {item.genres.slice(0, 3).map((genre, idx) => (
                <span key={genre} className="flex items-center gap-1">
                  {idx > 0 && <span className="text-gray-600">·</span>}
                  <span>{genre}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
