export interface Message {
  text?: string;
  sender: 'me' | 'peer';
  timestamp: Date;
  file?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
  reactions?: {
    emoji: string;
    sender: 'me' | 'peer';
  }[];
  id: string;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  isSelf: boolean;
}
