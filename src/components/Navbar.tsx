import { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, X, Menu, Check } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { USER_PROFILES } from '../data/mockData.ts';

interface NavbarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentProfile: UserProfile;
  onSelectProfile: (profile: UserProfile) => void;
  onOpenProfileManager: () => void;
  watchlistCount: number;
}

export default function Navbar({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  currentProfile,
  onSelectProfile,
  onOpenProfileManager,
  watchlistCount,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(searchQuery.length > 0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'tv', label: 'TV Shows' },
    { id: 'movies', label: 'Movies' },
    { id: 'new', label: 'New & Popular' },
    { id: 'my-list', label: 'My List', count: watchlistCount },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-400 ${
        isScrolled
          ? 'bg-[#141414]/95 backdrop-blur-md shadow-md shadow-black/50'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-4 md:px-12 h-16 md:h-18 flex items-center justify-between">
        {/* Left Section: Logo & Nav */}
        <div className="flex items-center gap-4 md:gap-10">
          {/* Netflix Wordmark Logo */}
          <button
            onClick={() => onSelectCategory('home')}
            className="flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
            aria-label="Netflix Home"
          >
            <span className="font-['Bebas_Neue',sans-serif] tracking-wider text-2xl md:text-3xl lg:text-4xl text-[#E50914] font-black uppercase leading-none drop-shadow-sm select-none">
              NETFLIX
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm" aria-label="Main Navigation">
            {navLinks.map(link => {
              const isActive = activeCategory === link.id && !searchQuery;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onSelectCategory(link.id);
                    onSearchChange('');
                  }}
                  className={`transition-colors font-medium relative py-1 ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-[#e5e5e5] hover:text-[#b3b3b3]'
                  }`}
                  aria-label={`Navigate to ${link.label}`}
                >
                  {link.label}
                  {link.count !== undefined && link.count > 0 && (
                    <span className="ml-1 text-xs text-red-400 font-bold">
                      ({link.count})
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Search, Profile & Notifications */}
        <div className="flex items-center gap-3 md:gap-5 text-white">
          {/* Interactive Search Bar */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-black/80 border border-white/60 rounded px-2.5 py-1 text-sm transition-all w-48 sm:w-64">
                <Search className="w-4 h-4 text-white/70 mr-2 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Titles, people, genres"
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  className="bg-transparent border-none text-white text-xs md:text-sm focus:outline-none w-full"
                  aria-label="Search titles, people, genres"
                />
                {searchQuery ? (
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-white/60 hover:text-white p-0.5"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="text-white/60 hover:text-white p-0.5"
                    aria-label="Close search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1 text-white hover:text-gray-300 transition-colors"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Kids Filter Quick Toggle */}
          <button
            onClick={() => {
              if (currentProfile.isKids) {
                const adult = USER_PROFILES.find(p => !p.isKids) || USER_PROFILES[0];
                onSelectProfile(adult);
              } else {
                const kids = USER_PROFILES.find(p => p.isKids) || USER_PROFILES[1];
                onSelectProfile(kids);
              }
            }}
            className={`text-xs md:text-sm px-2 py-0.5 rounded font-semibold transition-colors ${
              currentProfile.isKids
                ? 'bg-amber-500 text-black font-bold'
                : 'text-gray-300 hover:text-white'
            }`}
            aria-label={currentProfile.isKids ? 'Exit Kids Mode' : 'Switch to Kids Mode'}
          >
            {currentProfile.isKids ? 'EXIT KIDS' : 'Children'}
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="relative p-1 text-white hover:text-gray-300 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-black" />
            </button>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-[#141414] border border-[#333] rounded shadow-2xl py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-[#262626] flex items-center justify-between text-gray-400 font-medium">
                  <span>Notifications</span>
                  <span className="text-[11px] text-red-500">3 New</span>
                </div>
                <div className="divide-y divide-[#222]">
                  <div className="p-3 hover:bg-[#202020] cursor-pointer flex gap-3 transition-colors">
                    <img
                      src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=120&q=80"
                      alt="Stranger Things"
                      className="w-16 h-10 object-cover rounded"
                    />
                    <div>
                      <p className="text-white font-medium">New Season Arrived</p>
                      <p className="text-gray-400 text-[11px]">Stranger Things Season 5 is now streaming</p>
                      <span className="text-gray-500 text-[10px]">2 hours ago</span>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-[#202020] cursor-pointer flex gap-3 transition-colors">
                    <img
                      src="https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=120&q=80"
                      alt="Wednesday"
                      className="w-16 h-10 object-cover rounded"
                    />
                    <div>
                      <p className="text-white font-medium">Top 10 in TV Shows</p>
                      <p className="text-gray-400 text-[11px]">Wednesday holds the #2 spot today</p>
                      <span className="text-gray-500 text-[10px]">1 day ago</span>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-[#202020] cursor-pointer flex gap-3 transition-colors">
                    <img
                      src="https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=120&q=80"
                      alt="Squid Game"
                      className="w-16 h-10 object-cover rounded"
                    />
                    <div>
                      <p className="text-white font-medium">Now in your Watchlist</p>
                      <p className="text-gray-400 text-[11px]">Squid Game: The Challenge new episode</p>
                      <span className="text-gray-500 text-[10px]">3 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 group py-1 focus-visible:outline-none"
              aria-label="User Profile Menu"
              aria-expanded={isProfileOpen}
            >
              <img
                src={currentProfile.avatar}
                alt={currentProfile.name}
                className="w-8 h-8 rounded object-cover border border-transparent group-hover:border-white transition-colors"
              />
              <ChevronDown
                className={`w-4 h-4 text-white transition-transform duration-200 ${
                  isProfileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#141414] border border-[#333] rounded shadow-2xl py-2 z-50 text-xs">
                {/* Profile List */}
                <div className="px-2 py-1 space-y-1">
                  <span className="px-2 text-[11px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                    Switch Profiles
                  </span>
                  {USER_PROFILES.map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        onSelectProfile(profile);
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded hover:bg-[#252525] text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-7 h-7 rounded object-cover"
                        />
                        <span className={`text-sm ${profile.id === currentProfile.id ? 'font-bold text-white' : 'text-gray-300'}`}>
                          {profile.name}
                        </span>
                      </div>
                      {profile.id === currentProfile.id && (
                        <Check className="w-4 h-4 text-red-500" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="my-2 border-t border-[#2a2a2a]" />

                <div className="px-2 space-y-0.5">
                  <button
                    onClick={() => {
                      onOpenProfileManager();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-[#252525] rounded transition-colors"
                  >
                    Manage Profiles
                  </button>
                  <button
                    onClick={() => {
                      onSelectCategory('my-list');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-[#252525] rounded transition-colors"
                  >
                    My List ({watchlistCount})
                  </button>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-[#252525] rounded transition-colors"
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-[#252525] rounded transition-colors"
                  >
                    Help Center
                  </button>
                </div>

                <div className="my-2 border-t border-[#2a2a2a]" />

                <div className="px-2">
                  <button
                    onClick={() => {
                      onOpenProfileManager();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-center px-3 py-2 text-gray-400 hover:text-white text-xs hover:bg-[#252525] rounded font-medium transition-colors"
                  >
                    Sign out of Netflix
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1 text-white hover:text-gray-300"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#141414] border-b border-[#262626] px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm" aria-label="Mobile Navigation">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  onSelectCategory(link.id);
                  onSearchChange('');
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 rounded text-base font-medium ${
                  activeCategory === link.id && !searchQuery
                    ? 'bg-red-600/20 text-red-500 font-bold border-l-4 border-red-600'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
                {link.count !== undefined && link.count > 0 && ` (${link.count})`}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
