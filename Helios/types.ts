export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  avatar?: string;
  isLoading?: boolean; // Used for AI message while content is streaming
}

// Added User interface
export interface User {
  id: string;
  email: string;
  // Add other user-specific fields if needed
}
