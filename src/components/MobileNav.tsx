import React from 'react';
import { Home, Search, Folder, Heart, Settings, Plus } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'home' | 'search' | 'folders' | 'favorites' | 'settings';
  onSelectTab: (tab: 'home' | 'search' | 'folders' | 'favorites' | 'settings') => void;
  onOpenNewNote: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewNote,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#EAE4D9]/95 backdrop-blur-md border-t border-[#D9CDBA] px-2 py-1.5 flex items-center justify-around lg:hidden shadow-lg">
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
          activeTab === 'home' ? 'text-[#4A3728]' : 'text-[#8C7B6A] hover:text-[#3E2723]'
        }`}
      >
        <Home className="w-4 h-4 mb-0.5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => onSelectTab('search')}
        className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
          activeTab === 'search' ? 'text-[#4A3728]' : 'text-[#8C7B6A] hover:text-[#3E2723]'
        }`}
      >
        <Search className="w-4 h-4 mb-0.5" />
        <span>Search</span>
      </button>

      {/* Center prominent New Note FAB */}
      <button
        onClick={onOpenNewNote}
        className="flex items-center justify-center w-11 h-11 bg-[#4A3728] text-[#F5F2ED] rounded-full shadow-md active:scale-95 transition-transform -mt-4 border-2 border-[#EAE4D9]"
        aria-label="New Note"
      >
        <Plus className="w-6 h-6" />
      </button>

      <button
        onClick={() => onSelectTab('favorites')}
        className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
          activeTab === 'favorites' ? 'text-[#4A3728]' : 'text-[#8C7B6A] hover:text-[#3E2723]'
        }`}
      >
        <Heart className="w-4 h-4 mb-0.5" />
        <span>Favorites</span>
      </button>

      <button
        onClick={() => onSelectTab('settings')}
        className={`flex flex-col items-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
          activeTab === 'settings' ? 'text-[#4A3728]' : 'text-[#8C7B6A] hover:text-[#3E2723]'
        }`}
      >
        <Settings className="w-4 h-4 mb-0.5" />
        <span>Settings</span>
      </button>
    </div>
  );
};
