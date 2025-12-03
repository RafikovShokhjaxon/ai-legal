export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  isPinned: boolean;
  lastModified: number;
}

export enum AppMode {
  TEXT = 'TEXT',
  VOICE = 'VOICE'
}

export interface LiveAudioContextState {
  isConnected: boolean;
  isSpeaking: boolean;
  volume: number;
}
