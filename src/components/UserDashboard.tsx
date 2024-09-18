import React, { useState, useEffect } from 'react';
import { useLottery } from '../context/LotteryContext';
import { useAuth } from '../context/AuthContext';
import { Ticket, DollarSign, History, Download, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { WinnerNotification } from './WinnerNotification';
import { UserProfile } from './UserProfile';

export const UserDashboard: React.FC = () => {
  const { lotteries, transactions, purchaseTicket, addTransaction } = useLottery();
  const { user, updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [winningLottery, setWinningLottery] = useState<{name: string; prize: number} | null>(null);

  useEffect(() => {
    // Check if user has won any lottery
    const wonLottery = lotteries.find(
      lottery => lottery.winner === user?.email && !lottery.prizeDistributed
    );
    if (wonLottery) {
      setWinningLottery({
        name: wonLottery.name,
        prize: wonLottery.prize
      });
    }
  }, [lotteries, user?.email]);

  const handlePurchase = (lotteryId: string, price: number) => {
    if (user && user.balance >= price) {
      purchaseTicket(lotteryId, user.email);
      addTransaction({
        userId: user.email,
        type: 'PURCHASE',
        amount: price,
        status: 'COMPLETED',
        description: `Lottery ticket purchase`
      });
      updateBalance(-price);
      toast.success('Ticket purchased successfully!');
    } else {
      toast.error('Insufficient balance!');
    }
  };

  const handleFundOperation = (type: 'DEPOSIT' | 'WITHDRAWAL') => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (type === 'WITHDRAWAL') {
      if (!user || user.balance < value) {
        toast.error('Insufficient balance');
        return;
      }
      
      const success = updateBalance(-value);
      if (!success) {
        return; // Error message is shown by updateBalance
      }
    } else {
      updateBalance(value);
    }

    addTransaction({
      userId: user?.email || '',
      type,
      amount: value,
      status: 'COMPLETED',
      description: `${type === 'DEPOSIT' ? 'Added' : 'Withdrawn'} funds`
    });
    
    setAmount('');
    toast.success(`${type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'} successful!`);
  };

  const downloadTransactions = () => {
    const userTransactions = transactions
      .filter((t) => t.userId === user?.email)
      .map((t) => ({
        type: t.type,
        amount: t.amount,
        date: new Date(t.date).toLocaleString(),
        status: t.status,
        description: t.description
      }));

    const csv = [
      ['Type', 'Amount', 'Date', 'Status', 'Description'],
      ...userTransactions.map(t => [t.type, t.amount, t.date, t.status, t.description])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {winningLottery && (
        <WinnerNotification
          lotteryName={winningLottery.name}
          prizeAmount={winningLottery.prize}
          onClose={() => setWinningLottery(null)}
        />
      )}

      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setShowProfile(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          <UserCircle className="mr-2" size={18} />
          Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white">Balance</h3>
            <DollarSign className="text-indigo-600" size={24} />
          </div>
          <p className="text-2xl font-bold mt-2 dark:text-white">${user?.balance || 0}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white">My Tickets</h3>
            <Ticket className="text-indigo-600" size={24} />
          </div>
          <p className="text-2xl font-bold mt-2 dark:text-white">
            {lotteries.reduce((acc, lottery) => 
              acc + lottery.participants.filter(p => p === user?.email).length, 0
            )}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Active Lotteries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lotteries.filter(l => !l.prizeDistributed).map((lottery) => (
            <div key={lottery.id} className="border rounded-lg p-4 dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white">{lottery.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">Price: ${lottery.price}</p>
              <p className="text-gray-600 dark:text-gray-400">Prize: ${lottery.prize}</p>
              <p className="text-gray-600 dark:text-gray-400">
                Ends: {new Date(lottery.endDate).toLocaleDateString()}
              </p>
              <button
                onClick={() => handlePurchase(lottery.id, lottery.price)}
                className="mt-2 flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Ticket className="mr-2" size={18} />
                Buy Ticket
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Manage Funds</h2>
          <div className="space-y-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleFundOperation('DEPOSIT')}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <DollarSign className="mr-2" size={18} />
                Deposit
              </button>
              <button
                onClick={() => handleFundOperation('WITHDRAWAL')}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <DollarSign className="mr-2" size={18} />
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 flex justify-between items-center dark:text-white">
            Recent Transactions
            <button
              onClick={downloadTransactions}
              className="text-indigo-600 hover:text-indigo-700"
              title="Download Transactions"
            >
              <Download size={20} />
            </button>
          </h2>
          <div className="space-y-2">
            {transactions
              .filter((t) => t.userId === user?.email)
              .slice(0, 5)
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-2 border-b dark:border-gray-700"
                >
                  <div>
                    <p className="font-semibold dark:text-white">{transaction.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleString()}
                    </p>
                  </div>
                  <p className={`font-bold ${
                    transaction.type === 'DEPOSIT' || transaction.type === 'PRIZE'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'DEPOSIT' || transaction.type === 'PRIZE' ? '+' : '-'}${transaction.amount}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};