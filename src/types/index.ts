// Types for CBRverse application

export interface ComicState {
  images: string[];
  currentPanel: number;
  comicName: string;
  isLoading: boolean;
  loadingProgress: number;
  showButtons: boolean;
}

export interface ViewMode {
  cascadeMode: boolean;
  isFullscreen: boolean;
}

export interface UIState {
  showConfigMenu: boolean;
}

export interface AppState extends ComicState, ViewMode, UIState {}

// File handling types
export interface FileHandler {
  handleFile: (file: File) => void;
  handleFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Navigation types
export interface NavigationControls {
  currentPanel: number;
  totalPanels: number;
  onPrevious: () => void;
  onNext: () => void;
  onGoToPage: (page: number) => void;
}

// Config types
export interface ConfigOption {
  id: string;
  icon: string;
  title: string;
  description: string;
  status: string;
  action: () => void;
  disabled?: boolean;
}

// Entrada de un archivo CBR/CBZ, tal como la expone public/lib/uncompress.js
export interface ArchiveEntry {
  name: string;
  is_file: boolean;
  readData: (cb: (data: ArrayBuffer | null, err: unknown) => void) => void;
}

export interface Archive {
  archive_type: string;
  entries: ArchiveEntry[];
}

// Window extensions for external libraries
declare global {
  interface Window {
    loadArchiveFormats?: (formats: string[], callback: () => void) => void;
    archiveOpenFile?: (file: File, password: string | null, callback: (archive: Archive | null, err: unknown) => void) => void;
    JSZip?: unknown;
  }
}
