export type NoteTemplate = 'standard' | 'journal' | 'quote' | 'story' | 'checklist';

export type WashiTapeStyle = 'none' | 'beige' | 'rose' | 'gold' | 'sage' | 'grid';

export type PaperStyle = 'ruled' | 'grid' | 'dots' | 'plain';

export type FontStyle = 'serif' | 'sans' | 'handwriting' | 'typewriter';

export type ThemeStyle = 'vintage-parchment' | 'espresso-dark' | 'warm-sepia';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface JournalData {
  mood?: string;
  date?: string;
}

export interface QuoteData {
  quoteText?: string;
  author?: string;
  interpretation?: string;
}

export interface StoryData {
  project?: string;
  character?: string;
  sceneIdea?: string;
  dialogue?: string;
  plotPoint?: string;
}

export interface NoteAttachment {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
  size: number;
}

export interface CustomFont {
  id: string;
  name: string;
  fileType: 'woff2' | 'woff' | 'ttf' | 'otf' | string;
  dataUrl: string;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  template: NoteTemplate;
  folderId: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt?: number;
  createdAt: number;
  updatedAt: number;
  washiTape: WashiTapeStyle;
  paperStyle?: PaperStyle;
  fontStyle?: FontStyle;
  customFontId?: string;
  journalData?: JournalData;
  quoteData?: QuoteData;
  storyData?: StoryData;
  checklists?: ChecklistItem[];
  attachments?: NoteAttachment[];
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
}

export interface AppSettings {
  theme: ThemeStyle;
  paperStyle: PaperStyle;
  fontStyle: FontStyle;
  defaultCustomFontId?: string;
  defaultTemplate: NoteTemplate;
  defaultFolderId: string;
  showWashiTape: boolean;
  showPaperLines: boolean;
}
