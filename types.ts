export interface Participant {
  id: string;
  name: string;
  exclusions: string[]; // IDs of people they cannot draw
}

export interface DrawResult {
  [giverId: string]: string; // receiverId
}

export interface AppState {
  participants: Participant[];
  draw: DrawResult | null;
  timestamp: number;
}

export enum AppMode {
  LANDING = 'LANDING',
  SETUP = 'SETUP',
  PARTICIPANT = 'PARTICIPANT'
}