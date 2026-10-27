import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sliders,
  MessageSquare,
  SkipForward,
} from 'lucide-react';
import { MediaItem, Episode } from '../types.ts';
import { formatVideoTime } from '../utils/filterAndWatchlist.ts';

interface VideoPlayerProps {
  item: MediaItem;
  initialEpisodeId?: string;
  onClose: () => void;
}

export default function VideoPlayer({ item, initialEpisodeId, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState('English [CC]');
  const [selectedAudio, setSelectedAudio] = useState('English [Original] (5.1)');

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Current episode (if TV)
  const currentEpisode: Episode | undefined =
    item.type === 'tv' && item.episodes
      ? item.episodes.find(e => e.id === initialEpisodeId) || item.episodes[0]
      : undefined;

  const titleDisplay = currentEpisode
    ? `${item.title}: S1:E${currentEpisode.episodeNumber} ${currentEpisode.title}`
    : item.title;

  // Autohide controls on mouse inactivity
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowSubtitlesMenu(false);
      }
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        skipTime(-10);
      } else if (e.key === 'ArrowRight') {
        skipTime(10);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, isFullscreen]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const skipTime = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.duration || duration, videoRef.current.currentTime + amount)
      );
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      videoRef.current.muted = nextMute;
      if (!nextMute && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none cursor-default"
      role="region"
      aria-label="Video Player"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={item.videoTrailerUrl}
        autoPlay
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Top Header Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-3 text-white hover:text-red-500 font-semibold transition-colors group cursor-pointer"
          aria-label="Back to browse"
        >
          <ArrowLeft className="w-6 h-6 md:w-8 h-8 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm md:text-base hidden sm:inline">Back to Browse</span>
        </button>

        <div className="text-center">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-white drop-shadow truncate max-w-md sm:max-w-xl">
            {titleDisplay}
          </h2>
          <span className="text-xs text-gray-400">Ultra 4K · HDR · 5.1 Surround</span>
        </div>

        <div className="w-20" />
      </div>

      {/* Center Play/Pause Indicator on Click */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer pointer-events-auto"
        >
          <div className="w-20 h-20 rounded-full bg-black/70 border-2 border-white/80 flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
            <Play className="w-10 h-10 fill-white translate-x-1" />
          </div>
        </div>
      )}

      {/* Bottom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 z-10 space-y-4 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Scrubber */}
        <div className="relative group/scrub">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#E50914] focus:outline-none hover:h-2.5 transition-all"
            aria-label="Timeline seek"
          />
          <div className="flex items-center justify-between text-xs text-gray-300 font-mono mt-1">
            <span>{formatVideoTime(currentTime)}</span>
            <span>-{formatVideoTime(Math.max(0, duration - currentTime))}</span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white">
          {/* Left Controls: Play, Skips, Volume */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={togglePlay}
              className="text-white hover:text-red-500 transition-colors p-1"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-6 h-6 md:w-8 h-8" /> : <Play className="w-6 h-6 md:w-8 h-8 fill-white" />}
            </button>

            <button
              onClick={() => skipTime(-10)}
              className="relative text-white hover:text-gray-300 transition-colors p-1"
              aria-label="Rewind 10 seconds"
            >
              <RotateCcw className="w-6 h-6 md:w-7 h-7" />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">10</span>
            </button>

            <button
              onClick={() => skipTime(10)}
              className="relative text-white hover:text-gray-300 transition-colors p-1"
              aria-label="Fast forward 10 seconds"
            >
              <RotateCw className="w-6 h-6 md:w-7 h-7" />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">10</span>
            </button>

            {/* Volume slider */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors p-1"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                aria-label="Volume level"
              />
            </div>
          </div>

          {/* Right Controls: Next Ep, Audio/Subtitles, Speed, Fullscreen */}
          <div className="flex items-center gap-3 sm:gap-5">
            {item.type === 'tv' && (
              <button
                onClick={() => skipTime(duration)}
                className="text-white hover:text-gray-300 transition-colors p-1 hidden sm:flex items-center gap-1 text-xs font-semibold"
                aria-label="Next Episode"
              >
                <SkipForward className="w-5 h-5" />
                <span>Next Ep</span>
              </button>
            )}

            {/* Subtitles & Audio Dialog */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSubtitlesMenu(!showSubtitlesMenu);
                  setShowSpeedMenu(false);
                }}
                className={`p-1 transition-colors ${showSubtitlesMenu ? 'text-red-500' : 'text-white hover:text-gray-300'}`}
                aria-label="Audio and Subtitles"
              >
                <MessageSquare className="w-5 h-5 md:w-6 h-6" />
              </button>

              {showSubtitlesMenu && (
                <div className="absolute bottom-12 right-0 w-72 bg-[#181818] border border-[#333] rounded shadow-2xl p-4 text-xs space-y-3 z-30">
                  <div>
                    <h5 className="font-bold text-gray-400 mb-2">Audio</h5>
                    {['English [Original] (5.1)', 'Spanish', 'French', 'Japanese'].map(audio => (
                      <button
                        key={audio}
                        onClick={() => setSelectedAudio(audio)}
                        className={`w-full text-left py-1 px-2 rounded ${
                          selectedAudio === audio ? 'bg-white/20 font-bold text-white' : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        {audio}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[#333] pt-2">
                    <h5 className="font-bold text-gray-400 mb-2">Subtitles</h5>
                    {['Off', 'English [CC]', 'Spanish', 'French', 'Simplified Chinese'].map(sub => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubtitle(sub)}
                        className={`w-full text-left py-1 px-2 rounded ${
                          selectedSubtitle === sub ? 'bg-white/20 font-bold text-white' : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Speed Control */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowSubtitlesMenu(false);
                }}
                className={`p-1 transition-colors ${showSpeedMenu ? 'text-red-500' : 'text-white hover:text-gray-300'}`}
                aria-label="Playback speed"
              >
                <Sliders className="w-5 h-5 md:w-6 h-6" />
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-12 right-0 w-36 bg-[#181818] border border-[#333] rounded shadow-2xl py-2 text-xs z-30">
                  <span className="px-3 py-1 font-bold text-gray-400 block">Playback Speed</span>
                  {[0.5, 0.75, 1, 1.25, 1.5].map(speed => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`w-full text-left px-3 py-1.5 ${
                        playbackSpeed === speed ? 'bg-white/20 font-bold text-white' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {speed === 1 ? 'Normal (1x)' : `${speed}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors p-1"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 md:w-6 h-6" />
              ) : (
                <Maximize className="w-5 h-5 md:w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
