import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CategoryRow, MediaItem } from '../types.ts';
import MovieCard from './MovieCard.tsx';

interface MovieRowProps {
  row: CategoryRow;
  watchlistIds: string[];
  onToggleWatchlist: (id: string) => void;
  onOpenModal: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
}

export default function MovieRow({
  row,
  watchlistIds,
  onToggleWatchlist,
  onOpenModal,
  onPlay,
}: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      const targetScroll =
        direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

      rowRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  const onScrollCheck = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  if (!row.items || row.items.length === 0) return null;

  return (
    <section className="relative px-4 md:px-12 py-3 md:py-4 select-none group/row">
      {/* Row Header */}
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2 group-hover/row:text-red-500 transition-colors">
          <span>{row.title}</span>
          <span className="text-xs text-cyan-400 font-semibold opacity-0 group-hover/row:opacity-100 transition-opacity">
            Explore All &gt;
          </span>
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Navigation Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all rounded-r focus-visible:opacity-100"
            aria-label={`Scroll ${row.title} left`}
          >
            <ChevronLeft className="w-8 h-8 transition-transform hover:scale-125" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          onScroll={onScrollCheck}
          className="flex items-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-4 -my-4 px-1"
        >
          {row.items.map(item => (
            <MovieCard
              key={item.id}
              item={item}
              isTop10={row.isTop10}
              isInWatchlist={watchlistIds.includes(item.id)}
              onToggleWatchlist={onToggleWatchlist}
              onOpenModal={onOpenModal}
              onPlay={onPlay}
            />
          ))}
        </div>

        {/* Right Navigation Arrow */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all rounded-l focus-visible:opacity-100"
            aria-label={`Scroll ${row.title} right`}
          >
            <ChevronRight className="w-8 h-8 transition-transform hover:scale-125" />
          </button>
        )}
      </div>
    </section>
  );
}
