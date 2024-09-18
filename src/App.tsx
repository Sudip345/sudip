import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Auth } from './components/Auth';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LotteryProvider } from './context/LotteryContext';
import { ThemeProvider } from './context/ThemeContext';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { CustomChatBot } from './components/ChatBot';

const DashboardContent: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Lottery System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                <LogOut className="mr-2" size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {user.isAdmin ? <AdminDashboard /> : <UserDashboard />}
      <CustomChatBot />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LotteryProvider>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Toaster position="top-right" />
            <DashboardContent />
          </div>
        </LotteryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;