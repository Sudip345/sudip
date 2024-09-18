export interface User {
  email: string;
  name: string;
  balance: number;
  isAdmin: boolean;
  totalWins?: number;
  password?: string;
}

export interface Lottery {
  id: string;
  name: string;
  price: number;
  prize: number;
  endDate: string;
  participants: string[];
  winner?: string;
  prizeDistributed?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'PURCHASE' | 'DEPOSIT' | 'WITHDRAWAL' | 'PRIZE';
  amount: number;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  description: string;
}

export interface AdminState {
  balance: number;
}