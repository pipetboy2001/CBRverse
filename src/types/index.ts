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

// Window extensions for external libraries
declare global {
  interface Window {
    loadArchiveFormats?: (formats: string[], callback: () => void) => void;
    archiveOpenFile?: (file: File, password: string | null, callback: (archive: any, err: any) => void) => void;
    JSZip?: any;
  }
}
