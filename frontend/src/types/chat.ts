export interface User {
  _id: string;
  username: string;
  full_name?: string;
}

export interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    full_name?: string;
  };
  receiver: {
    _id: string;
    username: string;
    full_name?: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
} 