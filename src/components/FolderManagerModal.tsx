import React, { useState } from 'react';
import { Folder } from '../types';
import { X, FolderPlus, Trash2 } from 'lucide-react';

interface FolderManagerModalProps {
  isOpen: boolean;
  folders: Folder[];
  onClose: () => void;
  onCreateFolder: (name: string, color: string) => void;
  onDeleteFolder: (id: string) => void;
}

const PRESET_COLORS = [
  '#4A3728', // Coffee Brown
  '#9EB384', // Sage Green
  '#E59A9A', // Soft Rose
  '#C6A969', // Vintage Gold
  '#7D8F9F', // Slate Blue
  '#B39CD0', // Muted Lavender
  '#D4A373', // Terracotta
  '#81B29A', // Soft Mint
];

export const FolderManagerModal: React.FC<FolderManagerModalProps> = ({
  isOpen,
  folders,
  onClose,
  onCreateFolder,
  onDeleteFolder,
}) => {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    onCreateFolder(folderName.trim(), selectedColor);
    setFolderName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3E2723]/50 backdrop-blur-xs">
      <div className="bg-[#FFFDF9] border border-[#D9CDBA] rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#F5F2ED] pb-3">
          <div className="flex items-center space-x-2">
            <FolderPlus className="w-5 h-5 text-[#4A3728]" />
            <h2 className="font-serif-vintage italic text-lg font-bold text-[#3E2723]">
              Manage Collections
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8C7B6A] hover:text-[#3E2723] rounded-lg hover:bg-[#EAE4D9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Folder Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7B6A] mb-1.5">
              Collection Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g., Recipe Book, Poetry, Travel..."
              className="w-full bg-[#F5F2ED]/60 border border-[#D9CDBA] rounded-lg px-3.5 py-2 text-sm text-[#3E2723] focus:outline-none focus:border-[#4A3728] focus:bg-[#FFFDF9]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7B6A] mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center space-x-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === color ? 'scale-110 ring-2 ring-offset-2 ring-[#4A3728]' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!folderName.trim()}
            className="w-full py-2.5 bg-[#4A3728] text-[#F5F2ED] rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#3E2723] disabled:opacity-50 transition-colors"
          >
            Create Collection
          </button>
        </form>

        {/* Existing Custom Folders List */}
        <div className="border-t border-[#F5F2ED] pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8C7B6A] mb-2">
            Your Collections
          </p>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {folders.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[#F5F2ED]/40 text-xs font-medium text-[#3E2723]"
              >
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: f.color }}
                  />
                  <span>{f.name}</span>
                  {f.isDefault && (
                    <span className="text-[9px] uppercase tracking-tighter text-[#8C7B6A] bg-[#EAE4D9] px-1.5 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>

                {!f.isDefault && (
                  <button
                    onClick={() => onDeleteFolder(f.id)}
                    className="p-1 text-[#8C5245] hover:bg-[#E59A9A]/20 rounded transition-colors"
                    title="Delete collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
