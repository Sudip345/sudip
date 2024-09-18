import React, { useState } from 'react';
import ChatBot from 'react-simple-chatbot';
import { MessageSquare, Minimize2 } from 'lucide-react';

const steps = [
  {
    id: '1',
    message: 'Welcome to our Lottery System! How can I assist you today?',
    trigger: 'options',
  },
  {
    id: 'options',
    options: [
      { value: 1, label: 'How to buy lottery tickets?', trigger: 'buyTickets' },
      { value: 2, label: 'How to deposit funds?', trigger: 'deposit' },
      { value: 3, label: 'How to withdraw funds?', trigger: 'withdraw' },
      { value: 4, label: 'How are winners selected?', trigger: 'winners' },
      { value: 5, label: 'Contact support', trigger: 'support' },
    ],
  },
  {
    id: 'buyTickets',
    message: 'To buy lottery tickets:\n1. Ensure you have sufficient balance\n2. Browse active lotteries\n3. Click "Buy Ticket" on your chosen lottery\n4. Confirm your purchase',
    trigger: 'askMore',
  },
  {
    id: 'deposit',
    message: 'To deposit funds:\n1. Go to "Manage Funds"\n2. Enter the amount you wish to deposit\n3. Click "Deposit"\n4. Follow the payment instructions',
    trigger: 'askMore',
  },
  {
    id: 'withdraw',
    message: 'To withdraw funds:\n1. Go to "Manage Funds"\n2. Enter withdrawal amount\n3. Click "Withdraw"\nNote: Withdrawals depend on system liquidity',
    trigger: 'askMore',
  },
  {
    id: 'winners',
    message: 'Winner selection process:\n1. Admin randomly selects a winner\n2. Winner receives notification\n3. Prize is distributed after admin confirmation\n4. Transaction history is updated',
    trigger: 'askMore',
  },
  {
    id: 'support',
    message: 'For additional support:\nEmail: support@lottery.com\nPhone: 1-800-LOTTERY\nAvailable 24/7',
    trigger: 'askMore',
  },
  {
    id: 'askMore',
    message: 'Is there anything else you would like to know?',
    trigger: 'moreOptions',
  },
  {
    id: 'moreOptions',
    options: [
      { value: 'yes', label: 'Yes', trigger: 'options' },
      { value: 'no', label: 'No, thank you', trigger: 'end' },
    ],
  },
  {
    id: 'end',
    message: 'Thank you for using our service! Good luck with the lottery!',
    end: true,
  },
];

export const CustomChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [key, setKey] = useState(0); // Add key to force re-render

  const handleEnd = () => {
    setTimeout(() => {
      setKey(prev => prev + 1); // Update key to force re-render
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700"
        >
          <MessageSquare size={24} />
        </button>
      )}
      {isOpen && (
        <div className={`bg-white rounded-lg shadow-xl ${isMinimized ? 'h-14' : ''}`}>
          <div className="flex justify-end p-2 border-b">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-500 hover:text-gray-700 mr-2"
            >
              <Minimize2 size={20} />
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          {!isMinimized && (
            <ChatBot
              key={key}
              steps={steps}
              headerTitle="Customer Support"
              floating={false}
              style={{ width: '350px' }}
              hideSubmitButton={true}
              cache={false}
              enableMobileAutoFocus={false}
              handleEnd={handleEnd}
              bubbleOptionStyle={{ backgroundColor: '#4F46E5', color: 'white' }}
            />
          )}
        </div>
      )}
    </div>
  );
};