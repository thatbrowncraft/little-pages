import React from 'react';
import { Folder, Note } from '../types';
import {
  BookOpen,
  FolderPlus,
  Tag,
  Trash2,
  Settings,
  Shield,
  Heart,
  StickyNote,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  folders: Folder[];
  notes: Note[];
  selectedFolderId: string;
  selectedTag: string | null;
  showTrashOnly: boolean;
  showFavoritesOnly: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onSelectFolder: (folderId: string) => void;
  onSelectTag: (tag: string | null) => void;
  onToggleTrash: (show: boolean) => void;
  onToggleFavorites: (show: boolean) => void;
  onOpenNewFolderModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  notes,
  selectedFolderId,
  selectedTag,
  showTrashOnly,
  showFavoritesOnly,
  isOpenMobile,
  onCloseMobile,
  onSelectFolder,
  onSelectTag,
  onToggleTrash,
  onToggleFavorites,
  onOpenNewFolderModal,
  onOpenSettingsModal,
}) => {
  // Collect active non-deleted notes
  const activeNotes = notes.filter((n) => !n.isDeleted);
  const deletedNotesCount = notes.filter((n) => n.isDeleted).length;
  const favoritesCount = activeNotes.filter((n) => n.isFavorite).length;

  // Collect all unique tags and count usage
  const tagCounts: Record<string, number> = {};
  activeNotes.forEach((note) => {
    note.tags?.forEach((tag) => {
      if (tag) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    });
  });

  const uniqueTags = Object.keys(tagCounts).sort();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#3E2723]/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#EAE4D9] border-r border-[#D9CDBA] flex flex-col transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-[#D9CDBA]/60">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#4A3728]" />
              <h1 className="text-xl font-serif-vintage italic font-bold tracking-tight text-[#4A3728]">
                Little Pages
              </h1>
            </div>
            <p className="text-[10px] uppercase tracking-widest mt-1 text-[#8C7B6A] font-medium">
              Private Personal Notes
            </p>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg hover:bg-[#D9CDBA] text-[#5D4037] lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          {/* Main Views */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onSelectFolder('all');
                onSelectTag(null);
                onToggleTrash(false);
                onToggleFavorites(false);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedFolderId === 'all' && !selectedTag && !showTrashOnly && !showFavoritesOnly
                  ? 'bg-[#D9CDBA] text-[#3E2723] shadow-2xs'
                  : 'text-[#5D4037] hover:bg-[#D9CDBA]/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <StickyNote className="w-4 h-4 text-[#4A3728]" />
                <span>All Notes</span>
              </div>
              <span className="text-[10px] bg-[#EAE4D9] px-2 py-0.5 rounded-full text-[#8C7B6A] font-sans">
                {activeNotes.length}
              </span>
            </button>

            <button
              onClick={() => {
                onToggleFavorites(true);
                onSelectTag(null);
                onToggleTrash(false);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                showFavoritesOnly
                  ? 'bg-[#D9CDBA] text-[#3E2723] shadow-2xs'
                  : 'text-[#5D4037] hover:bg-[#D9CDBA]/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Heart className="w-4 h-4 text-[#E59A9A] fill-[#E59A9A]/30" />
                <span>Favorites</span>
              </div>
              <span className="text-[10px] bg-[#EAE4D9] px-2 py-0.5 rounded-full text-[#8C7B6A] font-sans">
                {favoritesCount}
              </span>
            </button>
          </div>

          {/* Collections / Folders */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C7B6A]">
                Collections
              </p>
              <button
                onClick={onOpenNewFolderModal}
                className="p-1 text-[#8C7B6A] hover:text-[#3E2723] rounded hover:bg-[#D9CDBA] transition-colors"
                title="Create Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              {folders.map((folder) => {
                if (folder.id === 'all') return null;
                const count = activeNotes.filter((n) => n.folderId === folder.id).length;
                const isSelected =
                  selectedFolderId === folder.id && !selectedTag && !showTrashOnly && !showFavoritesOnly;

                return (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onSelectFolder(folder.id);
                      onSelectTag(null);
                      onToggleTrash(false);
                      onToggleFavorites(false);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#D9CDBA] text-[#3E2723] shadow-2xs'
                        : 'text-[#5D4037] hover:bg-[#D9CDBA]/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: folder.color || '#4A3728' }}
                      />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    <span className="text-[10px] text-[#8C7B6A] font-sans ml-1">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Tags */}
          {uniqueTags.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 px-3 mb-2">
                <Tag className="w-3 h-3 text-[#8C7B6A]" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C7B6A]">
                  Tags
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 px-2">
                {uniqueTags.map((tag) => {
                  const isSelected = selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        onSelectTag(isSelected ? null : tag);
                        onToggleTrash(false);
                        onToggleFavorites(false);
                        onCloseMobile();
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                        isSelected
                          ? 'bg-[#4A3728] text-white border-[#3E2723]'
                          : 'bg-[#D9CDBA]/70 text-[#5D4037] border-[#C9BCAB] hover:bg-[#D9CDBA]'
                      }`}
                    >
                      #{tag} ({tagCounts[tag]})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trash Section */}
          <div className="pt-2 border-t border-[#D9CDBA]/60">
            <button
              onClick={() => {
                onToggleTrash(true);
                onSelectTag(null);
                onToggleFavorites(false);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                showTrashOnly
                  ? 'bg-[#E59A9A]/30 text-[#8C5245] border border-[#E59A9A]/50'
                  : 'text-[#8C7B6A] hover:bg-[#D9CDBA]/50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Trash2 className="w-4 h-4 text-[#8C5245]" />
                <span>Trash</span>
              </div>
              {deletedNotesCount > 0 && (
                <span className="text-[10px] bg-[#E59A9A]/40 text-[#8C5245] px-2 py-0.5 rounded-full font-bold">
                  {deletedNotesCount}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#D9CDBA] space-y-2 bg-[#EAE4D9]">
          <button
            onClick={() => {
              onOpenSettingsModal();
              onCloseMobile();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-[#5D4037] hover:bg-[#D9CDBA] rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-[#4A3728]" />
            <span>Settings & Backup</span>
          </button>

          <div className="flex items-center space-x-2 text-[10px] text-[#8C7B6A] px-3 py-1">
            <Shield className="w-3.5 h-3.5 text-[#9EB384] shrink-0" />
            <span className="leading-tight">Private & stored on device</span>
          </div>
        </div>
      </aside>
    </>
  );
};
