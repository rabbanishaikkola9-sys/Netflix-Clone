import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { USER_PROFILES } from '../data/mockData.ts';

interface ProfileSelectorModalProps {
  currentProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSelectProfile: (profile: UserProfile) => void;
}

export default function ProfileSelectorModal({
  currentProfile,
  isOpen,
  onClose,
  onSelectProfile,
}: ProfileSelectorModalProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>(USER_PROFILES);
  const [isManaging, setIsManaging] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [isNewKids, setIsNewKids] = useState(false);

  if (!isOpen) return null;

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: newProfileName.trim(),
      avatar: isNewKids
        ? 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&h=200&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80',
      isKids: isNewKids,
    };

    setProfiles([...profiles, newProfile]);
    setNewProfileName('');
    setIsAddingNew(false);
    onSelectProfile(newProfile);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#141414] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300 select-none overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Profile Selector"
    >
      {/* Top Close button if triggered from inside the app */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-400 hover:text-white p-2"
        aria-label="Close profile selector"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Main Container */}
      <div className="max-w-4xl w-full flex flex-col items-center text-center my-auto">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal text-white mb-8 sm:mb-12 font-['Inter',sans-serif] tracking-tight">
          Who&apos;s watching?
        </h1>

        {/* Profile Grid */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-10">
          {profiles.map(profile => {
            const isSelected = profile.id === currentProfile.id;
            return (
              <div
                key={profile.id}
                onClick={() => {
                  onSelectProfile(profile);
                  onClose();
                }}
                className="group flex flex-col items-center cursor-pointer space-y-3"
              >
                <div
                  className={`relative w-24 sm:w-32 md:w-36 aspect-square rounded overflow-hidden border-2 transition-all duration-200 group-hover:scale-105 ${
                    isSelected ? 'border-white shadow-xl' : 'border-transparent group-hover:border-white'
                  }`}
                >
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                  {profile.isKids && (
                    <div className="absolute bottom-0 left-0 right-0 bg-yellow-500 text-black text-[10px] font-black tracking-widest uppercase py-0.5">
                      KIDS
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-red-600 rounded-full p-0.5">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                <span
                  className={`text-sm sm:text-base transition-colors ${
                    isSelected
                      ? 'text-white font-bold'
                      : 'text-gray-400 group-hover:text-white'
                  }`}
                >
                  {profile.name}
                </span>
              </div>
            );
          })}

          {/* Add Profile Card */}
          {!isAddingNew ? (
            <div
              onClick={() => setIsAddingNew(true)}
              className="group flex flex-col items-center cursor-pointer space-y-3"
            >
              <div className="w-24 sm:w-32 md:w-36 aspect-square rounded border-2 border-gray-600 flex items-center justify-center text-gray-500 group-hover:border-white group-hover:text-white group-hover:scale-105 transition-all duration-200">
                <Plus className="w-12 h-12" />
              </div>
              <span className="text-sm sm:text-base text-gray-400 group-hover:text-white">
                Add Profile
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleCreateProfile}
              className="bg-[#222] p-4 rounded border border-gray-700 flex flex-col items-center gap-3 w-48 animate-in fade-in"
            >
              <span className="text-xs font-bold text-gray-300">New Profile</span>
              <input
                type="text"
                placeholder="Name"
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
                autoFocus
                className="w-full bg-[#333] border border-gray-600 rounded px-2.5 py-1 text-sm text-white focus:outline-none focus:border-red-600"
              />
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewKids}
                  onChange={e => setIsNewKids(e.target.checked)}
                  className="rounded accent-red-600"
                />
                <span>Kid?</span>
              </label>
              <div className="flex gap-2 w-full mt-1">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Action Controls */}
        <button
          onClick={() => setIsManaging(!isManaging)}
          className="border border-gray-500 hover:border-white text-gray-400 hover:text-white uppercase tracking-widest text-xs sm:text-sm font-semibold px-6 py-2.5 rounded transition-all duration-200 hover:scale-105"
        >
          {isManaging ? 'Done' : 'Manage Profiles'}
        </button>
      </div>
    </div>
  );
}
