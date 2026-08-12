import React, { useState, useEffect, useMemo } from 'react';
import { Note, Folder, AppSettings, NoteTemplate, CustomFont } from './types';
import {
  initSeedDataIfNeeded,
  getAllNotes,
  saveNote,
  deleteNotePermanently,
  getAllFolders,
  saveFolder,
  deleteFolder,
  getAppSettings,
  saveAppSettings,
  exportAllDataJSON,
  importDataJSON,
  clearAllLocalData,
  loadAndApplyAllCustomFonts,
  saveCustomFont,
  deleteCustomFont,
} from './db/indexedDB';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NoteCard } from './components/NoteCard';
import { NoteEditorModal } from './components/NoteEditorModal';
import { SettingsModal } from './components/SettingsModal';
import { FolderManagerModal } from './components/FolderManagerModal';
import { MobileNav } from './components/MobileNav';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Plus, Feather, Sparkles, Trash2, RotateCcw } from 'lucide-react';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'vintage-parchment',
    paperStyle: 'ruled',
    fontStyle: 'serif',
    defaultTemplate: 'standard',
    defaultFolderId: 'all',
    showWashiTape: true,
    showPaperLines: true,
  });

  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTrashOnly, setShowTrashOnly] = useState<boolean>(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals & Drawers
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'search' | 'folders' | 'favorites' | 'settings'>('home');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        addToast('Little Pages app installed successfully!');
      }
      setDeferredInstallPrompt(null);
    }
  };

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        await initSeedDataIfNeeded();
        const loadedNotes = await getAllNotes();
        const loadedFolders = await getAllFolders();
        const loadedSettings = await getAppSettings();
        const loadedFonts = await loadAndApplyAllCustomFonts();

        setNotes(loadedNotes);
        setFolders(loadedFolders);
        setSettings(loadedSettings);
        setCustomFonts(loadedFonts);
      } catch (err) {
        console.error('Failed to load initial local data:', err);
        addToast('Failed to initialize local IndexedDB storage', 'error');
      }
    }
    loadData();
  }, []);

  // Theme application
  useEffect(() => {
    document.body.classList.remove('dark-espresso', 'warm-sepia');
    if (settings.theme === 'espresso-dark') {
      document.body.classList.add('dark-espresso');
    } else if (settings.theme === 'warm-sepia') {
      document.body.classList.add('warm-sepia');
    }
  }, [settings.theme]);

  // Create Note
  const handleCreateNewNote = async (template?: NoteTemplate) => {
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: '',
      content: '',
      template: template || settings.defaultTemplate || 'standard',
      folderId: selectedFolderId !== 'all' ? selectedFolderId : 'personal',
      tags: [],
      isPinned: false,
      isFavorite: false,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      washiTape: 'beige',
      paperStyle: settings.paperStyle,
      fontStyle: settings.fontStyle,
      customFontId: settings.defaultCustomFontId,
    };

    const saved = await saveNote(newNote);
    setNotes((prev) => [saved, ...prev]);
    setEditingNote(saved);
  };

  // Save Note
  const handleSaveNote = async (updatedNote: Note) => {
    const saved = await saveNote(updatedNote);
    setNotes((prev) => prev.map((n) => (n.id === saved.id ? saved : n)));
  };

  // Toggle Pin
  const handleTogglePin = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    const updated = { ...note, isPinned: !note.isPinned, updatedAt: Date.now() };
    await saveNote(updated);
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    addToast(updated.isPinned ? 'Note pinned to top' : 'Note unpinned');
  };

  // Toggle Favorite
  const handleToggleFavorite = async (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    const updated = { ...note, isFavorite: !note.isFavorite, updatedAt: Date.now() };
    await saveNote(updated);
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    addToast(updated.isFavorite ? 'Saved to favorites' : 'Removed from favorites');
  };

  // Move to Trash or Permanent Delete
  const handleDeleteNote = async (id: string, permanent: boolean = false) => {
    if (permanent) {
      await deleteNotePermanently(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      addToast('Note permanently deleted', 'info');
    } else {
      const target = notes.find((n) => n.id === id);
      if (target) {
        const updated = { ...target, isDeleted: true, deletedAt: Date.now() };
        await saveNote(updated);
        setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
        addToast('Note moved to trash');
      }
    }
  };

  // Restore from Trash
  const handleRestoreNote = async (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (target) {
      const updated = { ...target, isDeleted: false, deletedAt: undefined, updatedAt: Date.now() };
      await saveNote(updated);
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      addToast('Note restored from trash');
    }
  };

  // Duplicate Note
  const handleDuplicateNote = async (sourceNote: Note) => {
    const duplicated: Note = {
      ...sourceNote,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: `${sourceNote.title || 'Untitled Note'} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const saved = await saveNote(duplicated);
    setNotes((prev) => [saved, ...prev]);
    setEditingNote(saved);
    addToast('Note duplicated');
  };

  // Folders management
  const handleCreateFolder = async (name: string, color: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      color,
    };
    const saved = await saveFolder(newFolder);
    setFolders((prev) => [...prev, saved]);
    setIsFolderModalOpen(false);
    addToast(`Collection "${name}" created`);
  };

  const handleDeleteFolder = async (id: string) => {
    await deleteFolder(id);
    setFolders((prev) => prev.filter((f) => f.id !== id));
    if (selectedFolderId === id) setSelectedFolderId('all');
    addToast('Collection deleted');
  };

  // Empty Trash
  const handleEmptyTrash = async () => {
    const trashNotes = notes.filter((n) => n.isDeleted);
    for (const n of trashNotes) {
      await deleteNotePermanently(n.id);
    }
    setNotes((prev) => prev.filter((n) => !n.isDeleted));
    addToast('Trash emptied', 'info');
  };

  // Custom Font Handlers
  const handleAddCustomFont = async (font: CustomFont) => {
    const saved = await saveCustomFont(font);
    setCustomFonts((prev) => [...prev.filter((f) => f.id !== font.id), saved]);
    addToast(`Installed custom font: ${font.name}`);
  };

  const handleDeleteCustomFont = async (id: string) => {
    await deleteCustomFont(id);
    setCustomFonts((prev) => prev.filter((f) => f.id !== id));
    addToast('Custom font removed');
  };

  // Settings & Backup
  const handleUpdateSettings = async (newSettings: AppSettings) => {
    const saved = await saveAppSettings(newSettings);
    setSettings(saved);
    addToast('Preferences saved');
  };

  const handleExportBackup = async () => {
    try {
      const json = await exportAllDataJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `little-pages-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Backup exported successfully');
    } catch (err) {
      console.error(err);
      addToast('Failed to export backup', 'error');
    }
  };

  const handleImportBackup = async (file: File) => {
    try {
      const text = await file.text();
      const res = await importDataJSON(text);
      const refreshedNotes = await getAllNotes();
      const refreshedFolders = await getAllFolders();
      const refreshedSettings = await getAppSettings();
      const refreshedFonts = await loadAndApplyAllCustomFonts();

      setNotes(refreshedNotes);
      setFolders(refreshedFolders);
      setSettings(refreshedSettings);
      setCustomFonts(refreshedFonts);

      addToast(`Restored ${res.notesCount} notes & ${res.fontsCount} custom fonts!`);
    } catch (err) {
      console.error(err);
      addToast('Invalid or corrupted backup JSON file', 'error');
    }
  };

  const handleClearAllData = async () => {
    await clearAllLocalData();
    const refreshedNotes = await getAllNotes();
    const refreshedFolders = await getAllFolders();
    setNotes(refreshedNotes);
    setFolders(refreshedFolders);
    setCustomFonts([]);
    addToast('All local data cleared', 'info');
  };

  // Filter Notes Logic
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Trash filter
      if (showTrashOnly) {
        return note.isDeleted;
      }
      if (note.isDeleted) return false;

      // Favorites filter
      if (showFavoritesOnly && !note.isFavorite) {
        return false;
      }

      // Folder filter
      if (selectedFolderId !== 'all' && note.folderId !== selectedFolderId) {
        return false;
      }

      // Tag filter
      if (selectedTag && (!note.tags || !note.tags.includes(selectedTag))) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = note.title.toLowerCase().includes(q);
        const contentMatch = note.content.toLowerCase().includes(q);
        const tagMatch = note.tags?.some((t) => t.toLowerCase().includes(q));
        const quoteMatch = note.quoteData?.quoteText?.toLowerCase().includes(q);
        const storyMatch = note.storyData?.project?.toLowerCase().includes(q);

        return titleMatch || contentMatch || tagMatch || quoteMatch || storyMatch;
      }

      return true;
    });
  }, [notes, showTrashOnly, showFavoritesOnly, selectedFolderId, selectedTag, searchQuery]);

  // Active filter title for header
  const getFilterTitle = () => {
    if (showTrashOnly) return 'Trash / Recently Deleted';
    if (showFavoritesOnly) return 'Favorites';
    if (selectedTag) return `Tag: #${selectedTag}`;
    if (selectedFolderId !== 'all') {
      const f = folders.find((folder) => folder.id === selectedFolderId);
      return f ? f.name : 'Collection';
    }
    return 'All Notes';
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F2ED] text-[#3E2723] overflow-hidden font-sans">
      {/* Sidebar for Desktop & Mobile Drawer */}
      <Sidebar
        folders={folders}
        notes={notes}
        selectedFolderId={selectedFolderId}
        selectedTag={selectedTag}
        showTrashOnly={showTrashOnly}
        showFavoritesOnly={showFavoritesOnly}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onSelectFolder={setSelectedFolderId}
        onSelectTag={setSelectedTag}
        onToggleTrash={setShowTrashOnly}
        onToggleFavorites={setShowFavoritesOnly}
        onOpenNewFolderModal={() => setIsFolderModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main App Canvas */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenNewNote={handleCreateNewNote}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          activeFilterTitle={getFilterTitle()}
        />

        {/* Notes Grid / List View */}
        <section className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
          {showTrashOnly && (
            <div className="mb-4 p-3 bg-[#E59A9A]/20 border border-[#E59A9A] rounded-lg flex items-center justify-between text-xs">
              <p className="text-[#8C5245] font-medium">
                Showing recently deleted notes.
              </p>
              {filteredNotes.length > 0 && (
                <button
                  onClick={handleEmptyTrash}
                  className="px-3 py-1 bg-[#8C5245] text-white rounded font-bold hover:bg-[#6E3C32]"
                >
                  Empty Trash
                </button>
              )}
            </div>
          )}

          {filteredNotes.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                  : 'space-y-3'
              }
            >
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  folders={folders}
                  viewMode={viewMode}
                  onSelectNote={setEditingNote}
                  onTogglePin={handleTogglePin}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}

              {/* Add Memory Card at end of grid */}
              {!showTrashOnly && viewMode === 'grid' && (
                <div
                  onClick={() => handleCreateNewNote()}
                  className="bg-[#FFFDF9] p-6 border-2 border-dashed border-[#D9CDBA] rounded-lg min-h-[190px] flex flex-col items-center justify-center text-[#A6998A] hover:text-[#4A3728] hover:border-[#4A3728] cursor-pointer transition-all group"
                >
                  <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest font-serif-vintage italic">
                    Add Memory / New Note
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Vintage Journal Empty State */
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#D9CDBA]/70 rounded-2xl bg-[#FFFDF9]/60 max-w-lg mx-auto my-auto">
              <Feather className="w-10 h-10 text-[#C6A969] mb-3 animate-bounce" />
              <h3 className="font-serif-vintage italic text-xl font-bold text-[#4A3728] mb-1">
                No thoughts here yet.
              </h3>
              <p className="text-xs text-[#8C7B6A] max-w-xs leading-relaxed mb-6 italic">
                This page is waiting for something worth writing down. Go make a mess.
              </p>
              {!showTrashOnly && (
                <button
                  onClick={() => handleCreateNewNote()}
                  className="px-6 py-2.5 bg-[#4A3728] text-[#F5F2ED] rounded-full text-xs font-bold shadow-md hover:bg-[#3E2723] transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write First Page</span>
                </button>
              )}
            </div>
          )}
        </section>

        {/* Footer Bar */}
        <div className="h-10 bg-[#EAE4D9]/60 border-t border-[#D9CDBA] px-4 sm:px-8 flex items-center justify-between text-[10px] text-[#8C7B6A] hidden sm:flex shrink-0">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 font-bold text-[#4A3728]">
              <span className="w-2 h-2 rounded-full bg-[#9EB384]" />
              <span>Offline Local Storage Active</span>
            </span>
            <div className="h-3 w-[1px] bg-[#D3C8B4]" />
            <span>{notes.filter((n) => !n.isDeleted).length} Total Notes Saved</span>
            {deferredInstallPrompt && (
              <>
                <div className="h-3 w-[1px] bg-[#D3C8B4]" />
                <button
                  onClick={handleInstallPWA}
                  className="px-2 py-0.5 bg-[#4A3728] text-[#F5F2ED] rounded text-[10px] font-bold hover:bg-[#3E2723]"
                >
                  Install App (PWA)
                </button>
              </>
            )}
          </div>

          <div className="italic font-serif-vintage">
            "Ideas disappear if you don't catch them."
          </div>
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <MobileNav
        activeTab={activeMobileTab}
        onSelectTab={(tab) => {
          setActiveMobileTab(tab);
          if (tab === 'home') {
            setSelectedFolderId('all');
            setSelectedTag(null);
            setShowTrashOnly(false);
            setShowFavoritesOnly(false);
          } else if (tab === 'favorites') {
            setShowFavoritesOnly(true);
            setShowTrashOnly(false);
          } else if (tab === 'search') {
            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (input) input.focus();
          } else if (tab === 'folders') {
            setIsMobileMenuOpen(true);
          } else if (tab === 'settings') {
            setIsSettingsModalOpen(true);
          }
        }}
        onOpenNewNote={() => handleCreateNewNote()}
      />

      {/* Modals */}
      <NoteEditorModal
        note={editingNote}
        folders={folders}
        customFonts={customFonts}
        isOpen={Boolean(editingNote)}
        onClose={() => setEditingNote(null)}
        onSaveNote={handleSaveNote}
        onDeleteNote={handleDeleteNote}
        onRestoreNote={handleRestoreNote}
        onDuplicateNote={handleDuplicateNote}
        allTags={[]}
      />

      <FolderManagerModal
        isOpen={isFolderModalOpen}
        folders={folders}
        onClose={() => setIsFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        settings={settings}
        customFonts={customFonts}
        onClose={() => setIsSettingsModalOpen(false)}
        onUpdateSettings={handleUpdateSettings}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onClearAllData={handleClearAllData}
        onAddCustomFont={handleAddCustomFont}
        onDeleteCustomFont={handleDeleteCustomFont}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
