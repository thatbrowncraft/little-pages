import React from 'react';
import { Note, Folder } from '../types';
import { Pin, Heart, BookOpen, Quote, CheckSquare, Sparkles, Feather, Image as ImageIcon } from 'lucide-react';
function stripMarkdown(markdown?: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/^\s*[\*\-\+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

interface NoteCardProps {
  note: Note;
  folders: Folder[];
  viewMode: 'grid' | 'list';
  onSelectNote: (note: Note) => void;
  onTogglePin: (e: React.MouseEvent, note: Note) => void;
  onToggleFavorite: (e: React.MouseEvent, note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  folders,
  viewMode,
  onSelectNote,
  onTogglePin,
  onToggleFavorite,
}) => {
  const folder = folders.find((f) => f.id === note.folderId) || {
    name: 'Uncategorized',
    color: '#8C7B6A',
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const washiClassMap: Record<string, string> = {
    beige: 'washi-tape-beige',
    rose: 'washi-tape-rose',
    gold: 'washi-tape-gold',
    sage: 'washi-tape-sage',
    grid: 'washi-tape-grid',
  };

  // Decorative Washi tape element
  const renderWashiTape = () => {
    if (!note.washiTape || note.washiTape === 'none') return null;
    const tapeClass = washiClassMap[note.washiTape] || 'washi-tape-beige';
    return (
      <div
        className={`absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 z-10 rotate-1 border-b opacity-90 shadow-2xs pointer-events-none ${tapeClass}`}
        style={{
          clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)',
        }}
      />
    );
  };

  // Template icon
  const getTemplateIcon = () => {
    switch (note.template) {
      case 'journal':
        return <BookOpen className="w-3 h-3 text-[#9EB384]" />;
      case 'quote':
        return <Quote className="w-3 h-3 text-[#C6A969]" />;
      case 'checklist':
        return <CheckSquare className="w-3 h-3 text-[#E59A9A]" />;
      case 'story':
        return <Feather className="w-3 h-3 text-[#7D8F9F]" />;
      default:
        return null;
    }
  };

  // Custom font or built-in font class
  const getFontClass = () => {
    if (note.customFontId) {
      return `font-custom-${note.customFontId}`;
    }
    switch (note.fontStyle) {
      case 'serif':
        return 'font-serif-vintage';
      case 'sans':
        return 'font-sans';
      case 'handwriting':
        return 'font-handwriting';
      case 'typewriter':
        return 'font-typewriter';
      default:
        return '';
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onSelectNote(note)}
        className="group relative bg-[#FFFDF9] border border-[#E9E4DB] hover:border-[#D9CDBA] p-4 rounded-lg shadow-2xs transition-all duration-200 cursor-pointer flex items-center justify-between space-x-4 hover:shadow-sm"
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <button
            onClick={(e) => onTogglePin(e, note)}
            className={`p-1 rounded transition-colors ${
              note.isPinned ? 'text-[#4A3728] opacity-100' : 'text-[#8C7B6A] opacity-30 hover:opacity-100'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-[#4A3728]' : ''}`} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              {getTemplateIcon()}
              <h3 className={`font-bold text-sm text-[#3E2723] truncate group-hover:text-[#8C5245] transition-colors ${getFontClass()}`}>
                {note.title || 'Untitled Note'}
              </h3>
            </div>
            <p className="text-xs text-[#8C7B6A] line-clamp-1 mt-0.5 font-sans">
              {note.template === 'quote' && note.quoteData?.quoteText
                ? `"${note.quoteData.quoteText}"`
                : note.content || 'Empty note...'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0 text-xs">
          {note.tags && note.tags.length > 0 && (
            <div className="hidden md:flex items-center space-x-1">
              {note.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 text-[10px] bg-[#EAE4D9]/60 text-[#5D4037] rounded border border-[#D9CDBA]/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <span
            className="px-2 py-0.5 text-[10px] rounded uppercase font-bold tracking-tight text-white"
            style={{ backgroundColor: folder.color || '#8C7B6A' }}
          >
            {folder.name}
          </span>

          <span className="text-[10px] italic text-[#8C7B6A] shrink-0 font-sans">
            {formatDate(note.updatedAt)}
          </span>

          <button
            onClick={(e) => onToggleFavorite(e, note)}
            className={`p-1 rounded transition-colors ${
              note.isFavorite ? 'text-[#E59A9A] opacity-100' : 'text-[#8C7B6A] opacity-30 hover:opacity-100'
            }`}
            title={note.isFavorite ? 'Remove favorite' : 'Mark favorite'}
          >
            <Heart className={`w-3.5 h-3.5 ${note.isFavorite ? 'fill-[#E59A9A]' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelectNote(note)}
      className="group relative bg-[#FFFDF9] p-5 shadow-xs border border-[#E9E4DB] hover:border-[#D9CDBA] rounded-lg transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[190px] hover:shadow-md"
    >
      {renderWashiTape()}

      {/* Card Header Actions */}
      <div className="flex items-center justify-between mb-2 z-10">
        <div className="flex items-center space-x-1.5">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: folder.color }}
          />
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7B6A] truncate max-w-[120px]">
            {folder.name}
          </span>
          {note.journalData?.mood && (
            <span className="text-xs px-1.5 py-0.5 bg-[#EAE4D9]/70 rounded text-[#3E2723]">
              {note.journalData.mood}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => onToggleFavorite(e, note)}
            className={`p-1 rounded transition-colors ${
              note.isFavorite ? 'text-[#E59A9A] opacity-100' : 'text-[#8C7B6A] opacity-30 hover:opacity-100'
            }`}
            title="Favorite"
          >
            <Heart className={`w-3.5 h-3.5 ${note.isFavorite ? 'fill-[#E59A9A]' : ''}`} />
          </button>
          <button
            onClick={(e) => onTogglePin(e, note)}
            className={`p-1 rounded transition-colors ${
              note.isPinned ? 'text-[#4A3728] opacity-100' : 'text-[#8C7B6A] opacity-30 hover:opacity-100'
            }`}
            title="Pin"
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-[#4A3728]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 my-1">
        <h3 className={`font-bold text-base text-[#3E2723] mb-1.5 leading-tight group-hover:text-[#8C5245] transition-colors line-clamp-2 ${getFontClass()}`}>
          {note.title || 'Untitled Note'}
        </h3>

        {/* Template specific preview */}
        {note.template === 'quote' && note.quoteData?.quoteText ? (
          <div className="my-2 p-2.5 bg-[#F5F2ED]/60 rounded border-l-2 border-[#C6A969] italic font-serif-vintage text-xs text-[#4A3728]">
            &ldquo;{note.quoteData.quoteText}&rdquo;
            {note.quoteData.author && (
              <p className="text-[10px] text-right font-sans not-italic text-[#8C7B6A] mt-1">
                — {note.quoteData.author}
              </p>
            )}
          </div>
        ) : note.template === 'checklist' && note.checklists && note.checklists.length > 0 ? (
          <div className="space-y-1 my-2">
            {note.checklists.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center text-xs text-[#5D4037]">
                <div
                  className={`w-3 h-3 border border-[#3E2723] rounded-xs mr-2 shrink-0 flex items-center justify-center ${
                    item.completed ? 'bg-[#4A3728] text-white' : ''
                  }`}
                >
                  {item.completed && <span className="text-[8px] font-bold">✓</span>}
                </div>
                <span className={`truncate text-xs ${item.completed ? 'line-through opacity-50' : ''}`}>
                  {item.text}
                </span>
              </div>
            ))}
            {note.checklists.length > 3 && (
              <p className="text-[10px] text-[#8C7B6A] italic pl-5">
                +{note.checklists.length - 3} more items
              </p>
            )}
          </div>
            ) : note.template === 'story' && note.storyData ? (
      <div className="text-xs text-[#0504037] line-clamp-3 space-y-0.5">
        {note.storyData.project && (
          <p className="font-semibold text-[#0C5245]">Project: {note.storyData.project}</p>
        )}
        <p className="line-clamp-2 opacity-80">{stripMarkdown(note.content) || note.storyData.sceneIdea}</p>
      </div>
    ) : (
      <p className="text-xs text-[#0504037] leading-relaxed line-clamp-3 opacity-80 font-sans">
        {stripMarkdown(note.content) || 'Empty page waiting for thoughts...'}
      </p>
    )}
      </div>

      {/* Footer Info */}
      <div className="mt-3 border-t border-[#F5F2ED] pt-2.5 flex items-center justify-between">
        <span className="text-[10px] italic text-[#8C7B6A] font-sans">
          {formatDate(note.updatedAt)}
        </span>

        <div className="flex items-center space-x-1.5">
          {note.attachments && note.attachments.length > 0 && (
            <span className="flex items-center text-[10px] text-[#8C7B6A] bg-[#EAE4D9]/60 px-1.5 py-0.5 rounded">
              <ImageIcon className="w-3 h-3 mr-1" />
              {note.attachments.length}
            </span>
          )}

          {note.tags && note.tags.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-[#D9CDBA]/40 text-[#4A3728] rounded font-medium truncate max-w-[100px]">
              #{note.tags[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
