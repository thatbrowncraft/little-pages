import React, { useState, useEffect, useRef } from 'react';
import {
  Note,
  Folder,
  NoteTemplate,
  WashiTapeStyle,
  PaperStyle,
  FontStyle,
  ChecklistItem,
  NoteAttachment,
  CustomFont,
} from '../types';
import {
  X,
  Pin,
  Heart,
  Folder as FolderIcon,
  Download,
  Trash2,
  Copy,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote as QuoteIcon,
  Minus,
} from 'lucide-react';

interface NoteEditorModalProps {
  note: Note | null;
  folders: Folder[];
  customFonts?: CustomFont[];
  isOpen: boolean;
  onClose: () => void;
  onSaveNote: (updatedNote: Note) => void;
  onDeleteNote: (id: string, permanent?: boolean) => void;
  onRestoreNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  allTags: string[];
}

const MOODS = [
  { label: 'Calm', emoji: '🌿' },
  { label: 'Happy', emoji: '☀️' },
  { label: 'Thoughtful', emoji: '🌙' },
  { label: 'Excited', emoji: '✨' },
  { label: 'Tired', emoji: '☕' },
  { label: 'Sad', emoji: '🌧️' },
  { label: 'Chaotic', emoji: '🫠' },
];

const WASHI_TAPES: { id: WashiTapeStyle; label: string; class: string }[] = [
  { id: 'none', label: 'No Tape', class: 'bg-transparent border' },
  { id: 'beige', label: 'Beige', class: 'washi-tape-beige' },
  { id: 'rose', label: 'Rose Floral', class: 'washi-tape-rose' },
  { id: 'gold', label: 'Vintage Gold', class: 'washi-tape-gold' },
  { id: 'sage', label: 'Sage Botanical', class: 'washi-tape-sage' },
  { id: 'grid', label: 'Grid Tape', class: 'washi-tape-grid' },
];

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  note,
  folders,
  customFonts = [],
  isOpen,
  onClose,
  onSaveNote,
  onDeleteNote,
  onRestoreNote,
  onDuplicateNote,
  allTags,
}) => {
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setCurrentNote({ ...note });
    }
  }, [note]);

  // Autosave timer
  useEffect(() => {
    if (!currentNote || !note) return;
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      onSaveNote(currentNote);
      setSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  }, [
    currentNote?.title,
    currentNote?.content,
    currentNote?.folderId,
    currentNote?.template,
    currentNote?.tags,
    currentNote?.isPinned,
    currentNote?.isFavorite,
    currentNote?.washiTape,
    currentNote?.paperStyle,
    currentNote?.fontStyle,
    currentNote?.journalData,
    currentNote?.quoteData,
    currentNote?.storyData,
    currentNote?.checklists,
    currentNote?.attachments,
  ]);

  if (!isOpen || !currentNote) return null;

  const updateField = <K extends keyof Note>(field: K, value: Note[K]) => {
    setCurrentNote((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // Add Tag
  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().toLowerCase().replace(/^#/, '');
    if (!trimmed || currentNote.tags?.includes(trimmed)) return;
    updateField('tags', [...(currentNote.tags || []), trimmed]);
    setNewTagInput('');
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    updateField('tags', currentNote.tags?.filter((t) => t !== tagToRemove) || []);
  };

  // Checklist handlers
  const handleToggleChecklist = (id: string) => {
    const updated = currentNote.checklists?.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    updateField('checklists', updated || []);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    };
    updateField('checklists', [...(currentNote.checklists || []), newItem]);
    setNewChecklistText('');
  };

  const handleDeleteChecklistItem = (id: string) => {
    updateField(
      'checklists',
      currentNote.checklists?.filter((i) => i.id !== id) || []
    );
  };

  // Local Image Attachment
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit for browser local storage.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newAtt: NoteAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: file.type,
        dataUrl: reader.result as string,
        size: file.size,
      };
      updateField('attachments', [...(currentNote.attachments || []), newAtt]);
      if (imageInputRef.current) imageInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (id: string) => {
    updateField(
      'attachments',
      currentNote.attachments?.filter((a) => a.id !== id) || []
    );
  };

  // Text formatting insertion helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = contentAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentNote.content.substring(start, end);

    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;
    const newContent =
      currentNote.content.substring(0, start) + replacement + currentNote.content.substring(end);

    updateField('content', newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
  };

  // Export note
  const handleExportTxt = () => {
    const text = `# ${currentNote.title}\nDate: ${new Date(currentNote.createdAt).toLocaleString()}\nTags: ${currentNote.tags.join(', ')}\n\n${currentNote.content}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNote.title || 'note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Paper and font classes
  const getPaperBgClass = () => {
    switch (currentNote.paperStyle || 'ruled') {
      case 'ruled':
        return 'paper-ruled';
      case 'grid':
        return 'paper-grid';
      case 'dots':
        return 'paper-dots';
      default:
        return 'bg-[#FFFDF9]';
    }
  };

  const getFontClass = () => {
    if (currentNote.customFontId) {
      return `font-custom-${currentNote.customFontId}`;
    }
    switch (currentNote.fontStyle || 'serif') {
      case 'serif':
        return 'font-serif-vintage';
      case 'sans':
        return 'font-sans-clean';
      case 'handwriting':
        return 'font-handwriting text-lg';
      case 'typewriter':
        return 'font-typewriter';
      default:
        return 'font-serif-vintage';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-[#3E2723]/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFDF9] border-0 sm:border border-[#D9CDBA] sm:rounded-xl shadow-2xl w-full max-w-3xl h-full sm:h-auto sm:min-h-[85vh] sm:max-h-[95vh] my-0 sm:my-auto flex flex-col relative overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Responsive Control Header */}
        <div className="p-2.5 sm:p-4 bg-[#EAE4D9] border-b border-[#D9CDBA] flex flex-col gap-2 shrink-0 text-xs">
          {/* Row 1: Status, Folder Selector, and Primary Action Controls */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Status & Folder */}
            <div className="flex items-center space-x-2 min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#8C7B6A] tracking-wider shrink-0">
                {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
              </span>

              <div className="h-3 w-[1px] bg-[#D3C8B4] shrink-0" />

              {/* Folder Select */}
              <div className="flex items-center space-x-1 min-w-0">
                <FolderIcon className="w-3.5 h-3.5 text-[#8C7B6A] shrink-0" />
                <select
                  value={currentNote.folderId}
                  onChange={(e) => updateField('folderId', e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#3E2723] focus:outline-none cursor-pointer truncate max-w-[110px] sm:max-w-[160px]"
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Primary Action Controls (Pin, Favorite, Export, Duplicate, Delete, Close) */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
              {/* Pin Button */}
              <button
                onClick={() => updateField('isPinned', !currentNote.isPinned)}
                className={`p-2 sm:p-1.5 rounded transition-colors ${
                  currentNote.isPinned
                    ? 'bg-[#4A3728] text-white'
                    : 'text-[#8C7B6A] hover:bg-[#D9CDBA]'
                }`}
                title="Pin note"
                aria-label="Pin note"
              >
                <Pin className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>

              {/* Favorite Button */}
              <button
                onClick={() => updateField('isFavorite', !currentNote.isFavorite)}
                className={`p-2 sm:p-1.5 rounded transition-colors ${
                  currentNote.isFavorite
                    ? 'bg-[#E59A9A] text-white'
                    : 'text-[#8C7B6A] hover:bg-[#D9CDBA]'
                }`}
                title="Favorite note"
                aria-label="Favorite note"
              >
                <Heart className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>

              {/* Export Button */}
              <button
                onClick={handleExportTxt}
                className="p-2 sm:p-1.5 text-[#8C7B6A] hover:bg-[#D9CDBA] rounded transition-colors"
                title="Export TXT"
                aria-label="Export TXT"
              >
                <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>

              {/* Duplicate Button */}
              <button
                onClick={() => onDuplicateNote(currentNote)}
                className="p-2 sm:p-1.5 text-[#8C7B6A] hover:bg-[#D9CDBA] rounded transition-colors"
                title="Duplicate Note"
                aria-label="Duplicate Note"
              >
                <Copy className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>

              {/* Existing Delete / Trash Control - Prominently accessible on mobile & desktop */}
              <button
                onClick={() => {
                  if (currentNote.isDeleted) {
                    onDeleteNote(currentNote.id, true);
                  } else {
                    onDeleteNote(currentNote.id, false);
                  }
                  onClose();
                }}
                className="p-2 sm:p-1.5 text-[#8C5245] hover:bg-[#E59A9A]/30 rounded transition-colors"
                title={currentNote.isDeleted ? 'Delete Permanently' : 'Move to Trash'}
                aria-label={currentNote.isDeleted ? 'Delete Permanently' : 'Move to Trash'}
              >
                <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 sm:p-1.5 text-[#3E2723] hover:bg-[#D9CDBA] rounded-lg"
                title="Close Note"
                aria-label="Close Note"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Row 2: Secondary Selectors (Template, Font, Washi Tape, Paper Style) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 min-w-0 no-scrollbar">
            {/* Template Selector */}
            <select
              value={currentNote.template}
              onChange={(e) => updateField('template', e.target.value as NoteTemplate)}
              className="bg-[#FFFDF9] border border-[#D9CDBA] rounded px-2 py-1 text-xs text-[#3E2723] font-medium focus:outline-none shrink-0"
              title="Note Template"
            >
              <option value="standard">Standard Note</option>
              <option value="journal">Journal Entry</option>
              <option value="quote">Quote Card</option>
              <option value="story">Story / Writing</option>
              <option value="checklist">Checklist</option>
            </select>

            {/* Font Selector */}
            <select
              value={
                currentNote.customFontId
                  ? `custom:${currentNote.customFontId}`
                  : `builtin:${currentNote.fontStyle || 'serif'}`
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('custom:')) {
                  updateField('customFontId', val.replace('custom:', ''));
                } else {
                  updateField('customFontId', undefined);
                  updateField('fontStyle', val.replace('builtin:', '') as FontStyle);
                }
              }}
              className="bg-[#FFFDF9] border border-[#D9CDBA] rounded px-2 py-1 text-xs text-[#3E2723] font-medium focus:outline-none max-w-[120px] sm:max-w-[150px] truncate shrink-0"
              title="Note Font"
            >
              <optgroup label="System Fonts">
                <option value="builtin:serif">Serif</option>
                <option value="builtin:sans">Modern</option>
                <option value="builtin:handwriting">Handwriting</option>
                <option value="builtin:typewriter">Typewriter</option>
              </optgroup>
              {customFonts.length > 0 && (
                <optgroup label="Custom Library">
                  {customFonts.map((f) => (
                    <option key={f.id} value={`custom:${f.id}`}>
                      {f.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* Washi Tape Selector */}
            <select
              value={currentNote.washiTape}
              onChange={(e) => updateField('washiTape', e.target.value as WashiTapeStyle)}
              className="bg-[#FFFDF9] border border-[#D9CDBA] rounded px-2 py-1 text-xs text-[#3E2723] font-medium focus:outline-none shrink-0"
              title="Washi tape style"
            >
              {WASHI_TAPES.map((tape) => (
                <option key={tape.id} value={tape.id}>
                  {tape.label}
                </option>
              ))}
            </select>

            {/* Paper Style Selector */}
            <select
              value={currentNote.paperStyle || 'ruled'}
              onChange={(e) => updateField('paperStyle', e.target.value as PaperStyle)}
              className="bg-[#FFFDF9] border border-[#D9CDBA] rounded px-2 py-1 text-xs text-[#3E2723] font-medium focus:outline-none shrink-0"
              title="Paper Style"
            >
              <option value="ruled">Ruled Paper</option>
              <option value="grid">Grid Paper</option>
              <option value="dots">Dotted Paper</option>
              <option value="plain">Plain Paper</option>
            </select>
          </div>
        </div>

        {/* Paper Editor Body */}
        <div className={`flex-1 p-4 sm:p-8 overflow-y-auto space-y-4 sm:space-y-6 ${getPaperBgClass()}`}>
          
          {/* Note Title Input */}
          <input
            type="text"
            value={currentNote.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Title of your note..."
            className={`w-full bg-transparent border-b border-[#D9CDBA] pb-2 text-xl sm:text-2xl font-bold text-[#3E2723] focus:outline-none placeholder-[#A6998A] ${getFontClass()}`}
          />

          {/* TEMPLATE SPECIFIC HEADERS */}

          {/* 1. Journal Template Fields */}
          {currentNote.template === 'journal' && (
            <div className="p-3 sm:p-4 bg-[#EAE4D9]/50 border border-[#D9CDBA] rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7B6A]">
                    Journal Date
                  </label>
                  <input
                    type="date"
                    value={
                      currentNote.journalData?.date ||
                      new Date().toISOString().split('T')[0]
                    }
                    onChange={(e) =>
                      updateField('journalData', {
                        ...currentNote.journalData,
                        date: e.target.value,
                      })
                    }
                    className="bg-[#FFFDF9] border border-[#D9CDBA] rounded px-2 py-1 font-sans text-xs text-[#3E2723]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7B6A] mb-1">
                    Today's Mood
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {MOODS.map((m) => {
                      const isSel = currentNote.journalData?.mood === `${m.emoji} ${m.label}`;
                      return (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() =>
                            updateField('journalData', {
                              ...currentNote.journalData,
                              mood: `${m.emoji} ${m.label}`,
                            })
                          }
                          className={`px-2 py-1 rounded-md text-xs transition-all ${
                            isSel
                              ? 'bg-[#4A3728] text-white shadow-2xs font-bold'
                              : 'bg-[#FFFDF9] border border-[#D9CDBA] text-[#3E2723] hover:bg-[#EAE4D9]'
                          }`}
                        >
                          {m.emoji} {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Quote Template Fields */}
          {currentNote.template === 'quote' && (
            <div className="p-4 sm:p-5 bg-[#F5F2ED] border-l-4 border-[#C6A969] rounded-r-xl space-y-3 shadow-2xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7B6A] mb-1">
                  Quote Text
                </label>
                <textarea
                  value={currentNote.quoteData?.quoteText || ''}
                  onChange={(e) =>
                    updateField('quoteData', {
                      ...currentNote.quoteData,
                      quoteText: e.target.value,
                    })
                  }
                  placeholder="Insert memorable quote here..."
                  rows={3}
                  className="w-full bg-[#FFFDF9] border border-[#D9CDBA] rounded-lg p-3 text-sm italic font-serif-vintage text-[#3E2723] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7B6A] mb-1">
                    Author / Source
                  </label>
                  <input
                    type="text"
                    value={currentNote.quoteData?.author || ''}
                    onChange={(e) =>
                      updateField('quoteData', {
                        ...currentNote.quoteData,
                        author: e.target.value,
                      })
                    }
                    placeholder="e.g. Virginia Woolf, Book Title"
                    className="w-full bg-[#FFFDF9] border border-[#D9CDBA] rounded px-3 py-1.5 text-xs text-[#3E2723] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7B6A] mb-1">
                    Personal Reflection
                  </label>
                  <input
                    type="text"
                    value={currentNote.quoteData?.interpretation || ''}
                    onChange={(e) =>
                      updateField('quoteData', {
                        ...currentNote.quoteData,
                        interpretation: e.target.value,
                      })
                    }
                    placeholder="Why this resonates with you..."
                    className="w-full bg-[#FFFDF9] border border-[#D9CDBA] rounded px-3 py-1.5 text-xs text-[#3E2723] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Story Template Fields */}
          {currentNote.template === 'story' && (
            <div className="p-3 sm:p-4 bg-[#EAE4D9]/40 border border-[#D9CDBA] rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7B6A] mb-1">
                  Project / Novel Name
                </label>
                <input
                  type="text"
                  value={currentNote.storyData?.project || ''}
                  onChange={(e) =>
                    updateField('storyData', {
                      ...currentNote.storyData,
                      project: e.target.value,
                    })
                  }
                  placeholder="e.g. My Novel Project"
                  className="w-full bg-[#FFFDF9] border border-[#D9CDBA] rounded px-2.5 py-1 text-xs text-[#3E2723]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7B6A] mb-1">
                  Character Involved
                </label>
                <input
                  type="text"
                  value={currentNote.storyData?.character || ''}
                  onChange={(e) =>
                    updateField('storyData', {
                      ...currentNote.storyData,
                      character: e.target.value,
                    })
                  }
                  placeholder="e.g. Main Character"
                  className="w-full bg-[#FFFDF9] border border-[#D9CDBA] rounded px-2.5 py-1 text-xs text-[#3E2723]"
                />
              </div>
            </div>
          )}

          {/* 4. Interactive Checklist Mode */}
          {currentNote.template === 'checklist' && (
            <div className="space-y-3 bg-[#FFFDF9] p-3 sm:p-4 border border-[#D9CDBA] rounded-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8C7B6A]">
                Checklist Items
              </p>

              {/* Add item */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  placeholder="Add new task..."
                  className="flex-1 bg-[#F5F2ED] border border-[#D9CDBA] rounded px-3 py-1.5 text-xs text-[#3E2723] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="px-3 py-1.5 bg-[#4A3728] text-white rounded text-xs font-bold hover:bg-[#3E2723]"
                >
                  Add
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2 mt-2">
                {currentNote.checklists?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded bg-[#F5F2ED]/60 text-xs"
                  >
                    <label className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(item.id)}
                        className="w-4 h-4 accent-[#4A3728] shrink-0"
                      />
                      <span
                        className={`font-medium truncate ${
                          item.completed ? 'line-through text-[#8C7B6A]' : 'text-[#3E2723]'
                        }`}
                      >
                        {item.text}
                      </span>
                    </label>

                    <button
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="p-1 text-[#8C5245] hover:bg-[#E59A9A]/20 rounded shrink-0 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Editor Formatting Toolbar */}
          <div className="flex items-center gap-1 p-2 bg-[#EAE4D9]/80 border border-[#D9CDBA] rounded-lg text-xs overflow-x-auto min-w-0 no-scrollbar">
            <button
              onClick={() => insertFormatting('**', '**')}
              className="p-2 sm:p-1.5 hover:bg-[#D9CDBA] rounded text-[#3E2723] shrink-0 min-w-[32px] flex items-center justify-center"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('*', '*')}
              className="p-2 sm:p-1.5 hover:bg-[#D9CDBA] rounded text-[#3E2723] shrink-0 min-w-[32px] flex items-center justify-center"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('<u>', '</u>')}
              className="p-2 sm:p-1.5 hover:bg-[#D9CDBA] rounded text-[#3E2723] shrink-0 min-w-[32px] flex items-center justify-center"
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-[1px] bg-[#D3C8B4] mx-1 shrink-0" />

            <button
              onClick={() => insertFormatting('# ')}
              className="p-2 sm:p-1.5 hover:bg-[#D9CDBA] rounded text-[#3E2723] shrink-0 min-w-[32px] flex items-center justify-center"
              title="Heading 1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('## ')}
              className="p-2 sm:p-1.5 hover:bg-[#D9CDBA] rounded text-[#3E2723] shrink-0 min-w-[32px] flex items-center justify-center"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-[1px] bg-[#D3C8B4] mx-1 shrink-0" />

            <button
              onClick={() => insertFormatting('- ')}
              className="p-2 sm:p-1.5 hover:bg-[#D9CDBA] rounded text-[#3E2723] shrink-0 min-w-[32px] flex items-center justify-center"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('1. ')}
              className="p-2 sm:p-1.5 hover:bg-[#D9CDBA] rounded text-[#3E2723] shrink-0 min-w-[32px] flex items-center justify-center"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('> ')}
              className="p-2 sm:p-1.5 hover:bg-[#D9CDBA] rounded text-[#3E2723] shrink-0 min-w-[32px] flex items-center justify-center"
              title="Quote block"
            >
              <QuoteIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('\n---\n')}
              className="p-2 sm:p-1.5 hover:bg-[#D9CDBA] rounded text-[#3E2723] shrink-0 min-w-[32px] flex items-center justify-center"
              title="Divider line"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-[1px] bg-[#D3C8B4] mx-1 shrink-0" />

            {/* Paper style quick picker */}
            <select
              value={currentNote.paperStyle || 'ruled'}
              onChange={(e) => updateField('paperStyle', e.target.value as PaperStyle)}
              className="bg-[#FFFDF9] border border-[#D9CDBA] rounded px-1.5 py-0.5 text-[10px] text-[#3E2723] shrink-0"
              title="Quick Paper Style"
            >
              <option value="ruled">Ruled</option>
              <option value="grid">Grid</option>
              <option value="dots">Dots</option>
              <option value="plain">Plain</option>
            </select>

            {/* Font quick picker */}
            <select
              value={currentNote.fontStyle || 'serif'}
              onChange={(e) => updateField('fontStyle', e.target.value as FontStyle)}
              className="bg-[#FFFDF9] border border-[#D9CDBA] rounded px-1.5 py-0.5 text-[10px] text-[#3E2723] shrink-0"
              title="Quick Font Style"
            >
              <option value="serif">Serif</option>
              <option value="sans">Sans</option>
              <option value="handwriting">Handwriting</option>
              <option value="typewriter">Typewriter</option>
            </select>
          </div>

          {/* Main Writing Area */}
          <textarea
            ref={contentAreaRef}
            value={currentNote.content}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="Write your thoughts, memories, quotes, or story ideas here..."
            rows={12}
            className={`w-full bg-transparent border-none text-sm sm:text-base text-[#3E2723] focus:outline-none resize-none leading-relaxed ${getFontClass()}`}
          />

          {/* Local Attachments Section */}
          {currentNote.attachments && currentNote.attachments.length > 0 && (
            <div className="border-t border-[#D9CDBA] pt-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8C7B6A]">
                Local Image Attachments
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentNote.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="relative group border border-[#D9CDBA] rounded-lg overflow-hidden bg-[#FFFDF9]"
                  >
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-1 bg-[#3E2723]/80 text-white text-[10px] truncate">
                      {att.name}
                    </div>
                    <button
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="absolute top-1 right-1 p-1 bg-[#8C5245] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Manager */}
          <div className="border-t border-[#D9CDBA] pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C7B6A]">
                Tags
              </span>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center space-x-1 text-xs text-[#4A3728] hover:underline"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Attach Local Image</span>
              </button>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {currentNote.tags?.map((t) => (
                <span
                  key={t}
                  className="flex items-center space-x-1 text-xs px-2 py-0.5 bg-[#EAE4D9] text-[#4A3728] rounded-full border border-[#D9CDBA]"
                >
                  <span>#{t}</span>
                  <button
                    onClick={() => handleRemoveTag(t)}
                    className="text-[#8C5245] hover:text-black ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag(newTagInput);
                  }
                }}
                placeholder="+ Add tag (Press Enter)"
                className="bg-transparent border-b border-[#D9CDBA] px-2 py-0.5 text-xs text-[#3E2723] focus:outline-none placeholder-[#A6998A]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
