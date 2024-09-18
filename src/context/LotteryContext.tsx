import React, { createContext, useContext, useState } from 'react';
import { Lottery, Transaction } from '../types';
import { useAuth } from './AuthContext';

interface LotteryContextType {
  lotteries: Lottery[];
  transactions: Transaction[];
  addLottery: (lottery: Omit<Lottery, 'id' | 'participants'>) => void;
  removeLottery: (id: string) => void;
  purchaseTicket: (lotteryId: string, userId: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updateLottery: (id: string, updates: Partial<Lottery>) => void;
}

const LotteryContext = createContext<LotteryContextType | undefined>(undefined);

export const LotteryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { updateBalance } = useAuth();

  const addLottery = (lottery: Omit<Lottery, 'id' | 'participants'>) => {
    setLotteries([...lotteries, {
      ...lottery,
      id: Math.random().toString(36).substr(2, 9),
      participants: []
    }]);
  };

  const removeLottery = (id: string) => {
    setLotteries(lotteries.filter(lottery => lottery.id !== id));
  };

  const updateLottery = (id: string, updates: Partial<Lottery>) => {
    setLotteries(lotteries.map(lottery =>
      lottery.id === id ? { ...lottery, ...updates } : lottery
    ));
  };

  const purchaseTicket = (lotteryId: string, userId: string) => {
    setLotteries(lotteries.map(lottery => 
      lottery.id === lotteryId 
        ? { ...lottery, participants: [...lottery.participants, userId] }
        : lottery
    ));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };
    setTransactions([...transactions, newTransaction]);

    // Update user balance for prize transactions
    if (transaction.type === 'PRIZE') {
      updateBalance(transaction.amount);
    }
  };

  return (
    <LotteryContext.Provider value={{
      lotteries,
      transactions,
      addLottery,
      removeLottery,
      purchaseTicket,
      addTransaction,
      updateLottery
    }}>
      {children}
    </LotteryContext.Provider>
  );
};

export const useLottery = () => {
  const context = useContext(LotteryContext);
  if (context === undefined) {
    throw new Error('useLottery must be used within a LotteryProvider');
  }
  return context;
};