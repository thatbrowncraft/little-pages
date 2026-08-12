import { Note, Folder, AppSettings, CustomFont } from '../types';

const DB_NAME = 'LittlePagesDB';
const DB_VERSION = 2;

const STORES = {
  NOTES: 'notes',
  FOLDERS: 'folders',
  SETTINGS: 'settings',
  FONTS: 'fonts',
};

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'all', name: 'All Notes', color: '#4A3728', isDefault: true },
  { id: 'journal', name: 'Journal', color: '#9EB384', isDefault: true },
  { id: 'personal', name: 'Personal', color: '#E59A9A', isDefault: true },
  { id: 'writing', name: 'Writing', color: '#C6A969', isDefault: true },
  { id: 'research', name: 'Research', color: '#7D8F9F', isDefault: true },
  { id: 'ideas', name: 'Ideas', color: '#B39CD0', isDefault: true },
  { id: 'quotes', name: 'Quotes', color: '#D4A373', isDefault: true },
  { id: 'study', name: 'Study', color: '#81B29A', isDefault: true },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'vintage-parchment',
  paperStyle: 'ruled',
  fontStyle: 'serif',
  defaultTemplate: 'standard',
  defaultFolderId: 'all',
  showWashiTape: true,
  showPaperLines: true,
};

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        const noteStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
        noteStore.createIndex('folderId', 'folderId', { unique: false });
        noteStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        noteStore.createIndex('isDeleted', 'isDeleted', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.FOLDERS)) {
        db.createObjectStore(STORES.FOLDERS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains(STORES.FONTS)) {
        db.createObjectStore(STORES.FONTS, { keyPath: 'id' });
      }
    };
  });

  return dbPromise;
}

export async function initSeedDataIfNeeded(): Promise<void> {
  const db = await getDB();

  // Check if folders exist
  const folderTx = db.transaction(STORES.FOLDERS, 'readonly');
  const folderStore = folderTx.objectStore(STORES.FOLDERS);
  const folderCountReq = folderStore.count();

  folderCountReq.onsuccess = async () => {
    if (folderCountReq.result === 0) {
      const writeFolderTx = db.transaction(STORES.FOLDERS, 'readwrite');
      const store = writeFolderTx.objectStore(STORES.FOLDERS);
      DEFAULT_FOLDERS.forEach((f) => store.put(f));
    }
  };

  // Check settings
  const settingsTx = db.transaction(STORES.SETTINGS, 'readonly');
  const settingsStore = settingsTx.objectStore(STORES.SETTINGS);
  const settingsReq = settingsStore.get('app_settings');

  settingsReq.onsuccess = () => {
    if (!settingsReq.result) {
      const writeSettingsTx = db.transaction(STORES.SETTINGS, 'readwrite');
      writeSettingsTx.objectStore(STORES.SETTINGS).put({
        key: 'app_settings',
        value: DEFAULT_SETTINGS,
      });
    }
  };
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.NOTES, 'readonly');
    const store = tx.objectStore(STORES.NOTES);
    const req = store.getAll();

    req.onsuccess = () => {
      // Sort by pinned first, then by updatedAt descending
      const notes = (req.result as Note[]) || [];
      notes.sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }
        return b.updatedAt - a.updatedAt;
      });
      resolve(notes);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function saveNote(note: Note): Promise<Note> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.NOTES, 'readwrite');
    const store = tx.objectStore(STORES.NOTES);
    const updatedNote = { ...note, updatedAt: Date.now() };
    const req = store.put(updatedNote);

    req.onsuccess = () => resolve(updatedNote);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteNotePermanently(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.NOTES, 'readwrite');
    const store = tx.objectStore(STORES.NOTES);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllFolders(): Promise<Folder[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FOLDERS, 'readonly');
    const store = tx.objectStore(STORES.FOLDERS);
    const req = store.getAll();

    req.onsuccess = () => {
      const folders = (req.result as Folder[]) || [];
      resolve(folders.length > 0 ? folders : DEFAULT_FOLDERS);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function saveFolder(folder: Folder): Promise<Folder> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FOLDERS, 'readwrite');
    const store = tx.objectStore(STORES.FOLDERS);
    const req = store.put(folder);

    req.onsuccess = () => resolve(folder);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FOLDERS, 'readwrite');
    const store = tx.objectStore(STORES.FOLDERS);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAppSettings(): Promise<AppSettings> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SETTINGS, 'readonly');
    const store = tx.objectStore(STORES.SETTINGS);
    const req = store.get('app_settings');

    req.onsuccess = () => {
      if (req.result && req.result.value) {
        resolve({ ...DEFAULT_SETTINGS, ...req.result.value });
      } else {
        resolve(DEFAULT_SETTINGS);
      }
    };

    req.onerror = () => reject(req.error);
  });
}

export async function saveAppSettings(settings: AppSettings): Promise<AppSettings> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SETTINGS, 'readwrite');
    const store = tx.objectStore(STORES.SETTINGS);
    const req = store.put({ key: 'app_settings', value: settings });

    req.onsuccess = () => resolve(settings);
    req.onerror = () => reject(req.error);
  });
}

// CUSTOM FONT OPERATIONS
export async function getAllCustomFonts(): Promise<CustomFont[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(STORES.FONTS)) {
      resolve([]);
      return;
    }
    const tx = db.transaction(STORES.FONTS, 'readonly');
    const store = tx.objectStore(STORES.FONTS);
    const req = store.getAll();

    req.onsuccess = () => {
      resolve((req.result as CustomFont[]) || []);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveCustomFont(font: CustomFont): Promise<CustomFont> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FONTS, 'readwrite');
    const store = tx.objectStore(STORES.FONTS);
    const req = store.put(font);

    req.onsuccess = () => {
      applyCustomFontToDOM(font);
      resolve(font);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteCustomFont(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FONTS, 'readwrite');
    const store = tx.objectStore(STORES.FONTS);
    const req = store.delete(id);

    req.onsuccess = () => {
      const styleEl = document.getElementById(`font-style-${id}`);
      if (styleEl) styleEl.remove();
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

export function applyCustomFontToDOM(font: CustomFont) {
  let styleEl = document.getElementById(`font-style-${font.id}`);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = `font-style-${font.id}`;
    document.head.appendChild(styleEl);
  }
  const fontFormat = font.fileType === 'ttf' ? 'truetype' : font.fileType === 'otf' ? 'opentype' : font.fileType;
  styleEl.textContent = `
    @font-face {
      font-family: 'custom-font-${font.id}';
      src: url('${font.dataUrl}') format('${fontFormat}');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    .font-custom-${font.id} {
      font-family: 'custom-font-${font.id}', serif, sans-serif !important;
    }
  `;
}

export async function loadAndApplyAllCustomFonts(): Promise<CustomFont[]> {
  const fonts = await getAllCustomFonts();
  fonts.forEach((f) => applyCustomFontToDOM(f));
  return fonts;
}

export async function exportAllDataJSON(): Promise<string> {
  const notes = await getAllNotes();
  const folders = await getAllFolders();
  const settings = await getAppSettings();
  const fonts = await getAllCustomFonts();

  const backupObj = {
    appName: 'Little Pages',
    version: '1.0',
    exportDate: new Date().toISOString(),
    notes,
    folders,
    settings,
    fonts,
  };

  return JSON.stringify(backupObj, null, 2);
}

export async function importDataJSON(jsonString: string): Promise<{ notesCount: number; foldersCount: number; fontsCount: number }> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.notes)) {
      throw new Error('Invalid backup file format.');
    }

    const db = await getDB();

    // Import folders
    if (Array.isArray(parsed.folders) && parsed.folders.length > 0) {
      const folderTx = db.transaction(STORES.FOLDERS, 'readwrite');
      const folderStore = folderTx.objectStore(STORES.FOLDERS);
      parsed.folders.forEach((f: Folder) => folderStore.put(f));
    }

    // Import notes
    const noteTx = db.transaction(STORES.NOTES, 'readwrite');
    const noteStore = noteTx.objectStore(STORES.NOTES);
    parsed.notes.forEach((n: Note) => noteStore.put(n));

    // Import fonts
    let importedFontsCount = 0;
    if (Array.isArray(parsed.fonts) && parsed.fonts.length > 0) {
      const fontTx = db.transaction(STORES.FONTS, 'readwrite');
      const fontStore = fontTx.objectStore(STORES.FONTS);
      parsed.fonts.forEach((font: CustomFont) => {
        fontStore.put(font);
        applyCustomFontToDOM(font);
      });
      importedFontsCount = parsed.fonts.length;
    }

    // Import settings if present
    if (parsed.settings) {
      await saveAppSettings(parsed.settings);
    }

    return {
      notesCount: parsed.notes.length,
      foldersCount: parsed.folders ? parsed.folders.length : 0,
      fontsCount: importedFontsCount,
    };
  } catch (err) {
    console.error('Failed to import backup:', err);
    throw err;
  }
}

export async function clearAllLocalData(): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const storeNames = [STORES.NOTES, STORES.FOLDERS, STORES.SETTINGS];
    if (db.objectStoreNames.contains(STORES.FONTS)) {
      storeNames.push(STORES.FONTS);
    }
    const tx = db.transaction(storeNames, 'readwrite');
    tx.objectStore(STORES.NOTES).clear();
    tx.objectStore(STORES.FOLDERS).clear();
    tx.objectStore(STORES.SETTINGS).clear();
    if (db.objectStoreNames.contains(STORES.FONTS)) {
      tx.objectStore(STORES.FONTS).clear();
    }

    tx.oncomplete = () => {
      // Re-seed default folders
      const reSeedTx = db.transaction(STORES.FOLDERS, 'readwrite');
      const store = reSeedTx.objectStore(STORES.FOLDERS);
      DEFAULT_FOLDERS.forEach((f) => store.put(f));
      resolve();
    };

    tx.onerror = () => reject(tx.error);
  });
}
