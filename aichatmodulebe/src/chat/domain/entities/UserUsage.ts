export interface UserUsage {
  id: string;
  userId: string;
  freeMessagesUsed: number;
  lastResetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUsageCreate {
  userId: string;
  freeMessagesUsed: number;
  lastResetDate: Date;
}
