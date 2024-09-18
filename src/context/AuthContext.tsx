import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  signup: (email: string, password: string, name: string) => boolean;
  updateBalance: (amount: number) => void;
  updateUser: (updates: Partial<User>) => void;
  changePassword: (oldPassword: string, newPassword: string) => boolean;
  adminBalance: number;
  updateAdminBalance: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminBalance, setAdminBalance] = useState(10000);

  const login = (email: string, password: string) => {
    if (email === "sudipbag035@gmail.com" && password === "Sudip123") {
      setUser({
        email,
        name: "Admin",
        balance: adminBalance,
        isAdmin: true,
        totalWins: 0
      });
      return true;
    } else if (localStorage.getItem(email) === password) {
      const userData = JSON.parse(localStorage.getItem(`userData_${email}`) || '{}');
      setUser({
        email,
        name: userData.name,
        balance: userData.balance || 0,
        isAdmin: false,
        totalWins: userData.totalWins || 0,
        password
      });
      return true;
    }
    return false;
  };

  const signup = (email: string, password: string, name: string) => {
    if (localStorage.getItem(email)) {
      return false;
    }
    localStorage.setItem(email, password);
    localStorage.setItem(`userData_${email}`, JSON.stringify({ 
      name, 
      balance: 0,
      totalWins: 0,
      password 
    }));
    return true;
  };

  const updateBalance = (amount: number) => {
    if (user && !user.isAdmin) {
      if (amount < 0 && Math.abs(amount) > adminBalance) {
        toast.error("Sorry, withdrawal not possible at the moment due to insufficient admin funds. Please try again later.");
        return false;
      }
      
      const newBalance = user.balance + amount;
      setUser({ ...user, balance: newBalance });
      localStorage.setItem(`userData_${user.email}`, JSON.stringify({
        ...user,
        balance: newBalance
      }));
      
      // Update admin balance for withdrawals/deposits
      if (amount < 0) {
        setAdminBalance(prev => prev + Math.abs(amount));
      } else {
        setAdminBalance(prev => prev - amount);
      }
      return true;
    }
    return false;
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      if (!user.isAdmin) {
        localStorage.setItem(`userData_${user.email}`, JSON.stringify(updatedUser));
      }
    }
  };

  const changePassword = (oldPassword: string, newPassword: string) => {
    if (user && user.password === oldPassword) {
      localStorage.setItem(user.email, newPassword);
      updateUser({ password: newPassword });
      return true;
    }
    return false;
  };

  const updateAdminBalance = (amount: number) => {
    setAdminBalance(prev => prev + amount);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      signup, 
      updateBalance, 
      updateUser,
      changePassword,
      adminBalance,
      updateAdminBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};