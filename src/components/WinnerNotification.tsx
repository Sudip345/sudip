import React from 'react';
import { Trophy } from 'lucide-react';

interface WinnerNotificationProps {
  lotteryName: string;
  prizeAmount: number;
  onClose: () => void;
}

export const WinnerNotification: React.FC<WinnerNotificationProps> = ({
  lotteryName,
  prizeAmount,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full text-center">
        <Trophy className="mx-auto text-yellow-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Congratulations!</h2>
        <p className="text-lg mb-4 dark:text-gray-300">
          You won the {lotteryName} lottery!
        </p>
        <p className="text-3xl font-bold text-green-600 mb-6">
          ${prizeAmount.toLocaleString()}
        </p>
        <button
          onClick={onClose}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Claim Prize
        </button>
      </div>
    </div>
  );
};