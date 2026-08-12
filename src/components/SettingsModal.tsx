import React, { useState, useRef } from 'react';
import { AppSettings, ThemeStyle, PaperStyle, FontStyle, CustomFont } from '../types';
import {
  X,
  Settings,
  Shield,
  Download,
  Upload,
  Trash2,
  Check,
  AlertTriangle,
  Type,
  Plus,
  Info,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  customFonts: CustomFont[];
  onClose: () => void;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onClearAllData: () => void;
  onAddCustomFont: (font: CustomFont) => void;
  onDeleteCustomFont: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  customFonts,
  onClose,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onClearAllData,
  onAddCustomFont,
  onDeleteCustomFont,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [isUploadingFont, setIsUploadingFont] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingImportFile(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (pendingImportFile) {
      onImportBackup(pendingImportFile);
      setPendingImportFile(null);
    }
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['woff2', 'woff', 'ttf', 'otf'].includes(ext)) {
      alert('Please select a valid font file (.woff2, .woff, .ttf, .otf)');
      return;
    }

    setIsUploadingFont(true);
    const reader = new FileReader();
    reader.onload = () => {
      const fontName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const newFont: CustomFont = {
        id: `font-${Date.now()}`,
        name: fontName,
        fileType: ext,
        dataUrl: reader.result as string,
        createdAt: Date.now(),
      };
      onAddCustomFont(newFont);
      setIsUploadingFont(false);
      if (fontInputRef.current) fontInputRef.current.value = '';
    };
    reader.onerror = () => {
      alert('Failed to read font file.');
      setIsUploadingFont(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3E2723]/50 backdrop-blur-xs">
      <div className="bg-[#FFFDF9] border border-[#D9CDBA] rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#F5F2ED] flex items-center justify-between bg-[#F5F2ED]/40">
          <div className="flex items-center space-x-2.5">
            <Settings className="w-5 h-5 text-[#4A3728]" />
            <h2 className="font-serif-vintage italic text-lg font-bold text-[#3E2723]">
              Settings & Font Library
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8C7B6A] hover:text-[#3E2723] rounded-lg hover:bg-[#EAE4D9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Privacy & Backup Warning Banner */}
          <div className="p-4 bg-[#9EB384]/20 border border-[#9EB384]/50 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-[#4E5B3D] font-bold text-xs">
              <Shield className="w-4 h-4 shrink-0" />
              <span>100% Private Local Storage</span>
            </div>
            <p className="text-xs text-[#3E2723]/90 font-medium leading-relaxed font-sans">
              Your notes are stored locally on this device. They are not uploaded to a server.
            </p>
            <p className="text-xs text-[#8C5245] italic font-semibold">
              Local storage is not a substitute for backup. Export your notes regularly.
            </p>
          </div>

          {/* Aesthetic Theme */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7B6A] mb-2">
              Color Atmosphere
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'vintage-parchment', name: 'Parchment', bg: '#F5F2ED', border: '#D9CDBA', text: '#3E2723' },
                { id: 'espresso-dark', name: 'Dark Espresso', bg: '#1F1917', border: '#3E322D', text: '#F0E8DF' },
                { id: 'warm-sepia', name: 'Warm Sepia', bg: '#F4EAD3', border: '#D2BF9C', text: '#432E18' },
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => onUpdateSettings({ ...settings, theme: th.id as ThemeStyle })}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between h-20 ${
                    settings.theme === th.id
                      ? 'ring-2 ring-[#4A3728] ring-offset-1 font-bold'
                      : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: th.bg, borderColor: th.border, color: th.text }}
                >
                  <span className="text-xs font-serif-vintage italic">{th.name}</span>
                  {settings.theme === th.id && (
                    <Check className="w-4 h-4 self-end shrink-0 text-[#4A3728]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Paper Texture */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7B6A] mb-2">
              Default Paper Background
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'ruled', label: 'Ruled Lines' },
                { id: 'grid', label: 'Grid Paper' },
                { id: 'dots', label: 'Dot Grid' },
                { id: 'plain', label: 'Plain' },
              ].map((paper) => (
                <button
                  key={paper.id}
                  onClick={() => onUpdateSettings({ ...settings, paperStyle: paper.id as PaperStyle })}
                  className={`py-2 px-2 text-center rounded-lg border text-xs font-medium transition-colors ${
                    settings.paperStyle === paper.id
                      ? 'bg-[#4A3728] text-[#F5F2ED] border-[#3E2723]'
                      : 'bg-[#F5F2ED]/60 text-[#3E2723] border-[#D9CDBA] hover:bg-[#EAE4D9]'
                  }`}
                >
                  {paper.label}
                </button>
              ))}
            </div>
          </div>

          {/* Built-In Typography */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7B6A] mb-2">
              Default System Font
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'serif', name: 'Classic Serif', preview: 'Newsreader / Lora', fontClass: 'font-serif-vintage' },
                { id: 'sans', name: 'Clean Modern', preview: 'Plus Jakarta Sans', fontClass: 'font-sans-clean' },
                { id: 'handwriting', name: 'Handwritten', preview: 'Caveat Script', fontClass: 'font-handwriting text-base' },
                { id: 'typewriter', name: 'Typewriter', preview: 'Special Elite', fontClass: 'font-typewriter' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      fontStyle: f.id as FontStyle,
                      defaultCustomFontId: undefined,
                    })
                  }
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    settings.fontStyle === f.id && !settings.defaultCustomFontId
                      ? 'bg-[#4A3728] text-[#F5F2ED] border-[#3E2723]'
                      : 'bg-[#F5F2ED]/60 text-[#3E2723] border-[#D9CDBA] hover:bg-[#EAE4D9]'
                  }`}
                >
                  <p className="text-xs font-bold">{f.name}</p>
                  <p className={`text-xs mt-0.5 opacity-80 ${f.fontClass}`}>{f.preview}</p>
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM FONT LIBRARY SECTION */}
          <div className="border-t border-[#F5F2ED] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7B6A]">
                  Font Library (WOFF2, WOFF, TTF, OTF)
                </label>
                <p className="text-[10px] text-[#8C7B6A] italic">
                  Upload custom fonts from your device. Fonts stay 100% local.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fontInputRef.current?.click()}
                disabled={isUploadingFont}
                className="px-3 py-1.5 bg-[#4A3728] text-[#F5F2ED] rounded-lg text-xs font-bold hover:bg-[#3E2723] transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Font</span>
              </button>
              <input
                type="file"
                ref={fontInputRef}
                onChange={handleFontUpload}
                accept=".woff2,.woff,.ttf,.otf"
                className="hidden"
              />
            </div>

            {/* List installed custom fonts */}
            {customFonts.length > 0 ? (
              <div className="space-y-2">
                {customFonts.map((font) => {
                  const isDefault = settings.defaultCustomFontId === font.id;
                  return (
                    <div
                      key={font.id}
                      className="p-3 border border-[#D9CDBA] rounded-lg bg-[#F5F2ED]/50 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-[#3E2723] truncate">{font.name}</p>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#EAE4D9] text-[#8C7B6A] rounded border border-[#D9CDBA]">
                            {font.fileType}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 text-[#3E2723] font-custom-${font.id} truncate`}>
                          The quick brown fox jumps over the lazy dog
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateSettings({
                              ...settings,
                              defaultCustomFontId: isDefault ? undefined : font.id,
                            })
                          }
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                            isDefault
                              ? 'bg-[#9EB384] text-white border-[#879B6E]'
                              : 'bg-[#FFFDF9] text-[#4A3728] border-[#D9CDBA] hover:bg-[#EAE4D9]'
                          }`}
                        >
                          {isDefault ? 'Default' : 'Set Default'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (isDefault) {
                              onUpdateSettings({ ...settings, defaultCustomFontId: undefined });
                            }
                            onDeleteCustomFont(font.id);
                          }}
                          className="p-1 text-[#8C5245] hover:bg-[#E59A9A]/20 rounded"
                          title="Delete font"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#8C7B6A] italic bg-[#F5F2ED]/40 p-3 rounded-lg text-center border border-dashed border-[#D9CDBA]">
                No custom fonts uploaded yet. Tap "Add Font" to install fonts from your phone or PC.
              </p>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="space-y-3 border-t border-[#F5F2ED] pt-4">
            <label className="flex items-center justify-between text-xs text-[#3E2723] font-medium cursor-pointer">
              <span>Show Decorative Washi Tape on Notes</span>
              <input
                type="checkbox"
                checked={settings.showWashiTape}
                onChange={(e) => onUpdateSettings({ ...settings, showWashiTape: e.target.checked })}
                className="w-4 h-4 accent-[#4A3728]"
              />
            </label>
          </div>

          {/* Backup & Data Management */}
          <div className="border-t border-[#F5F2ED] pt-4 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7B6A]">
              Backup & Restore (Offline JSON)
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onExportBackup}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-[#EAE4D9] hover:bg-[#D9CDBA] text-[#4A3728] rounded-lg text-xs font-bold border border-[#D9CDBA] transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Backup</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-[#EAE4D9] hover:bg-[#D9CDBA] text-[#4A3728] rounded-lg text-xs font-bold border border-[#D9CDBA] transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Restore Backup</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Confirmation modal for restore/import */}
          {pendingImportFile && (
            <div className="p-4 bg-[#C6A969]/20 border border-[#C6A969] rounded-xl space-y-3">
              <div className="flex items-center space-x-2 text-[#4A3728] font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#C6A969]" />
                <span>Confirm Restore / Merge Data</span>
              </div>
              <p className="text-xs text-[#3E2723]">
                Importing <strong>{pendingImportFile.name}</strong> will restore or merge notes, collections, custom fonts, and preferences into your local journal.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={handleConfirmImport}
                  className="py-1.5 px-3 bg-[#4A3728] text-white rounded-md text-xs font-bold hover:bg-[#3E2723]"
                >
                  Yes, Restore Data
                </button>
                <button
                  onClick={() => setPendingImportFile(null)}
                  className="py-1.5 px-3 bg-[#EAE4D9] text-[#3E2723] rounded-md text-xs font-medium hover:bg-[#D9CDBA]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reset / Danger Zone */}
          <div className="border-t border-[#F5F2ED] pt-4">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-xs text-[#8C5245] hover:text-[#3E2723] flex items-center space-x-1.5 underline underline-offset-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all local device data...</span>
              </button>
            ) : (
              <div className="p-3.5 bg-[#E59A9A]/20 border border-[#E59A9A] rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-[#8C5245] font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Are you absolutely sure?</span>
                </div>
                <p className="text-xs text-[#3E2723]">
                  This will permanently delete all local notes, collections, custom fonts, and settings stored in this browser.
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onClearAllData();
                      setShowClearConfirm(false);
                    }}
                    className="py-1.5 px-3 bg-[#8C5245] text-white rounded-md text-xs font-bold hover:bg-[#6E3C32]"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="py-1.5 px-3 bg-[#EAE4D9] text-[#3E2723] rounded-md text-xs font-medium hover:bg-[#D9CDBA]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

