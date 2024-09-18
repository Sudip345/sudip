import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Settings, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserProfile: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (changePassword(oldPassword, newPassword)) {
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } else {
      toast.error('Current password is incorrect');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold dark:text-white">Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <User size={48} className="text-indigo-600" />
            <div>
              <h3 className="text-xl font-semibold dark:text-white">{user?.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-green-600">
            <Trophy size={20} />
            <span className="font-semibold dark:text-white">Total Wins: {user?.totalWins || 0}</span>
          </div>

          <div className="border-t pt-4 dark:border-gray-700">
            <h4 className="text-lg font-semibold mb-2 flex items-center dark:text-white">
              <Settings size={20} className="mr-2" />
              Change Password
            </h4>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Current Password"
                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};