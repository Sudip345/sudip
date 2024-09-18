import React, { useState } from 'react';
import { useLottery } from '../context/LotteryContext';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Trash2, Gift, Download, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const { lotteries, transactions, addLottery, removeLottery, addTransaction, updateLottery } = useLottery();
  const { adminBalance, updateAdminBalance } = useAuth();
  const [newLottery, setNewLottery] = useState({
    name: '',
    price: 0,
    prize: 0,
    endDate: ''
  });
  const [fundAmount, setFundAmount] = useState('');

  const handleAddLottery = (e: React.FormEvent) => {
    e.preventDefault();
    addLottery(newLottery);
    setNewLottery({ name: '', price: 0, prize: 0, endDate: '' });
    toast.success('Lottery added successfully!');
  };

  const selectWinner = (lotteryId: string) => {
    const lottery = lotteries.find(l => l.id === lotteryId);
    if (!lottery) return;

    if (lottery.winner) {
      toast.error('Winner has already been selected for this lottery!');
      return;
    }

    if (lottery.participants.length === 0) {
      toast.error('No participants in this lottery');
      return;
    }

    const randomIndex = Math.floor(Math.random() * lottery.participants.length);
    const winnerEmail = lottery.participants[randomIndex];

    // Update lottery with winner
    updateLottery(lotteryId, { winner: winnerEmail });
    toast.success(`Winner selected: ${winnerEmail}`);
  };

  const distributePrize = (lotteryId: string) => {
    const lottery = lotteries.find(l => l.id === lotteryId);
    if (!lottery || !lottery.winner) return;

    if (lottery.prizeDistributed) {
      toast.error('Prize has already been distributed!');
      return;
    }

    if (adminBalance < lottery.prize) {
      toast.error('Insufficient admin balance to distribute prize');
      return;
    }

    // Add transaction for prize
    addTransaction({
      userId: lottery.winner,
      type: 'PRIZE',
      amount: lottery.prize,
      status: 'COMPLETED',
      description: `Won ${lottery.name} lottery`
    });

    // Update admin balance
    updateAdminBalance(-lottery.prize);

    // Update winner's total wins and balance
    const winnerData = JSON.parse(localStorage.getItem(`userData_${lottery.winner}`) || '{}');
    localStorage.setItem(`userData_${lottery.winner}`, JSON.stringify({
      ...winnerData,
      totalWins: (winnerData.totalWins || 0) + 1,
      balance: (winnerData.balance || 0) + lottery.prize
    }));

    // Mark lottery as distributed and remove it
    updateLottery(lotteryId, { prizeDistributed: true });
    toast.success('Prize distributed successfully!');
  };

  const handleAdminFunds = (type: 'add' | 'withdraw') => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (type === 'withdraw' && amount > adminBalance) {
      toast.error('Insufficient balance');
      return;
    }

    updateAdminBalance(type === 'add' ? amount : -amount);
    setFundAmount('');
    toast.success(`Successfully ${type === 'add' ? 'added' : 'withdrawn'} funds`);
  };

  const downloadTransactions = () => {
    const csv = [
      ['User', 'Type', 'Amount', 'Date', 'Status', 'Description'],
      ...transactions.map(t => [
        t.userId,
        t.type,
        t.amount,
        new Date(t.date).toLocaleString(),
        t.status,
        t.description
      ])
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold dark:text-white">Admin Balance</h3>
            <DollarSign className="text-indigo-600" size={24} />
          </div>
          <p className="text-2xl font-bold mt-2 dark:text-white">${adminBalance}</p>
          <div className="mt-4 space-y-2">
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAdminFunds('add')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Add Funds
              </button>
              <button
                onClick={() => handleAdminFunds('withdraw')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Add New Lottery</h2>
        <form onSubmit={handleAddLottery} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Lottery Name"
              value={newLottery.name}
              onChange={(e) => setNewLottery({ ...newLottery, name: e.target.value })}
              className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            <input
              type="number"
              placeholder="Ticket Price"
              value={newLottery.price || ''}
              onChange={(e) => setNewLottery({ ...newLottery, price: Number(e.target.value) })}
              className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            <input
              type="number"
              placeholder="Prize Amount"
              value={newLottery.prize || ''}
              onChange={(e) => setNewLottery({ ...newLottery, prize: Number(e.target.value) })}
              className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            <input
              type="datetime-local"
              value={newLottery.endDate}
              onChange={(e) => setNewLottery({ ...newLottery, endDate: e.target.value })}
              className="rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <PlusCircle className="mr-2" size={18} />
            Add Lottery
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Active Lotteries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lotteries.map((lottery) => (
            <div key={lottery.id} className="border rounded-lg p-4 dark:border-gray-700">
              <h3 className="text-lg font-semibold dark:text-white">{lottery.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">Price: ${lottery.price}</p>
              <p className="text-gray-600 dark:text-gray-400">Prize: ${lottery.prize}</p>
              <p className="text-gray-600 dark:text-gray-400">
                Participants: {lottery.participants.length}
              </p>
              {lottery.winner && (
                <p className="text-green-600 font-semibold">Winner: {lottery.winner}</p>
              )}
              <div className="mt-4 space-y-2">
                {!lottery.winner && (
                  <button
                    onClick={() => selectWinner(lottery.id)}
                    className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Gift className="mr-2" size={18} />
                    Select Winner
                  </button>
                )}
                {lottery.winner && !lottery.prizeDistributed && (
                  <button
                    onClick={() => distributePrize(lottery.id)}
                    className="flex items-center justify-center w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
                    <Gift className="mr-2" size={18} />
                    Distribute Prize
                  </button>
                )}
                <button
                  onClick={() => {
                    removeLottery(lottery.id);
                    toast.success('Lottery removed successfully!');
                  }}
                  className="flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <Trash2 className="mr-2" size={18} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 flex justify-between items-center dark:text-white">
          Recent Transactions
          <button
            onClick={downloadTransactions}
            className="text-indigo-600 hover:text-indigo-700"
            title="Download All Transactions"
          >
            <Download size={20} />
          </button>
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {transaction.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    ${transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {new Date(transaction.date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};