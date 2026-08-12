import React from 'react';
import { Search, Plus, LayoutGrid, List, Menu, Sparkles, Folder, Heart, Trash2 } from 'lucide-react';
import { NoteTemplate } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenNewNote: (template?: NoteTemplate) => void;
  onOpenMobileMenu: () => void;
  activeFilterTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onOpenNewNote,
  onOpenMobileMenu,
  activeFilterTitle,
}) => {
  return (
    <header className="p-4 sm:p-6 lg:p-8 bg-[#F5F2ED] border-b border-[#D9CDBA]/60 flex flex-col md:flex-row md:items-end justify-between gap-4">
      {/* Title & Greeting */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between lg:justify-start lg:space-x-4 mb-1">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 rounded-lg text-[#4A3728] hover:bg-[#EAE4D9] lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#8C7B6A] font-bold">
              {activeFilterTitle}
            </span>
            <p className="font-serif-vintage italic text-lg sm:text-2xl text-[#5D4037]">
              Your little corner of thoughts.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative max-w-md">
          <Search className="w-4 h-4 text-[#A6998A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search through your memory..."
            className="w-full bg-[#FFFDF9]/80 border border-[#D9CDBA] rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-[#3E2723] focus:outline-none focus:border-[#4A3728] focus:bg-[#FFFDF9] placeholder-[#A6998A] italic transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7B6A] hover:text-[#3E2723]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex items-center justify-between md:justify-end space-x-3 shrink-0">
        {/* View Toggle */}
        <div className="flex items-center p-1 bg-[#EAE4D9] rounded-lg border border-[#D9CDBA]">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#FFFDF9] text-[#4A3728] shadow-2xs'
                : 'text-[#8C7B6A] hover:text-[#3E2723]'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-[#FFFDF9] text-[#4A3728] shadow-2xs'
                : 'text-[#8C7B6A] hover:text-[#3E2723]'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => onOpenNewNote()}
          className="bg-[#4A3728] text-[#F5F2ED] hover:bg-[#3E2723] active:bg-[#2B1B15] px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium shadow-md transition-all flex items-center space-x-2 shrink-0 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>
    </header>
  );
};
