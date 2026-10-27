import { useState, useRef, useEffect } from 'react';
import { Play, Info, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { MediaItem } from '../types.ts';

interface BillboardHeroProps {
  item: MediaItem;
  onPlay: (item: MediaItem) => void;
  onMoreInfo: (item: MediaItem) => void;
}

export default function BillboardHero({ item, onPlay, onMoreInfo }: BillboardHeroProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Delay video start slightly for Netflix-style billboard behavior
    const timer = setTimeout(() => {
      setIsPlayingVideo(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {
          // Autoplay policy fallback
          setIsPlayingVideo(false);
        });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [item.id]);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setVideoEnded(false);
      setIsPlayingVideo(true);
    }
  };

  return (
    <div className="relative w-full h-[65vh] sm:h-[75vh] md:h-[88vh] bg-black select-none overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0">
        <img
          src={item.backdropUrl}
          alt={item.title}
          className={`w-full h-full object-cover object-center transition-opacity duration-1000 ${
            isPlayingVideo && !videoEnded ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Video Trailer Layer */}
        <video
          ref={videoRef}
          src={item.videoTrailerUrl}
          muted={isMuted}
          playsInline
          onEnded={() => setVideoEnded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 pointer-events-none ${
            isPlayingVideo && !videoEnded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Gradients for text contrast & bottom row blend */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/80 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative max-w-[1920px] mx-auto px-4 md:px-12 h-full flex flex-col justify-end pb-24 md:pb-36 z-10">
        <div className="max-w-2xl space-y-4">
          {/* Netflix Brand Tag */}
          <div className="flex items-center gap-2">
            <span className="bg-[#E50914] text-white font-black text-[10px] md:text-xs px-1.5 py-0.5 rounded tracking-widest uppercase">
              N
            </span>
            <span className="text-gray-300 font-semibold tracking-widest text-[11px] md:text-xs uppercase">
              {item.type === 'tv' ? 'SERIES' : 'FILM'}
            </span>
            {item.badge && (
              <span className="text-red-400 text-xs font-semibold">
                · {item.badge}
              </span>
            )}
          </div>

          {/* Billboard Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white drop-shadow-md uppercase font-['Bebas_Neue',sans-serif]">
            {item.title}
          </h1>

          {/* Top 10 in country badge */}
          {item.top10Rank && (
            <div className="flex items-center gap-2 text-white font-bold text-sm md:text-base">
              <span className="flex items-center justify-center bg-red-600 text-white w-6 h-6 rounded text-xs font-black">
                #{item.top10Rank}
              </span>
              <span>in TV Shows Today</span>
            </div>
          )}

          {/* Synopsis */}
          <p className="text-sm md:text-base lg:text-lg text-gray-200 line-clamp-3 md:line-clamp-4 leading-relaxed drop-shadow">
            {item.description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onPlay(item)}
              className="flex items-center justify-center gap-2 bg-white hover:bg-white/80 text-black font-bold px-6 md:px-8 py-2 md:py-3 rounded transition-all duration-200 text-sm md:text-base shadow-lg cursor-pointer hover:scale-105 active:scale-95"
              aria-label={`Play ${item.title}`}
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Play</span>
            </button>

            <button
              onClick={() => onMoreInfo(item)}
              className="flex items-center justify-center gap-2 bg-white/30 hover:bg-white/20 text-white font-semibold px-5 md:px-7 py-2 md:py-3 rounded transition-all duration-200 text-sm md:text-base backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
              aria-label={`More info about ${item.title}`}
            >
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </button>
          </div>
        </div>

        {/* Right Floating Audio & Maturity Badge */}
        <div className="absolute right-0 bottom-24 md:bottom-36 flex items-center gap-3">
          {videoEnded ? (
            <button
              onClick={handleReplay}
              className="p-2 md:p-2.5 rounded-full border border-white/50 bg-black/40 text-white hover:bg-white/20 transition-colors"
              aria-label="Replay video trailer"
            >
              <RotateCcw className="w-4 h-4 md:w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={toggleSound}
              className="p-2 md:p-2.5 rounded-full border border-white/50 bg-black/40 text-white hover:bg-white/20 transition-colors"
              aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 md:w-5 h-5" />
              ) : (
                <Volume2 className="w-4 h-4 md:w-5 h-5" />
              )}
            </button>
          )}

          <div className="bg-black/60 border-l-4 border-red-600 text-gray-200 text-xs md:text-sm font-semibold py-1 px-3 md:px-4 rounded-r">
            {item.maturityRating}
          </div>
        </div>
      </div>
    </div>
  );
}
