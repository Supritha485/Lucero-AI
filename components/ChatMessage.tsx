
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start';
  const bubbleClasses = isUser
    ? 'bg-sky-700 text-white rounded-br-none'
    : 'bg-gray-700 text-gray-200 rounded-bl-none';

  return (
    <div className={`${containerClasses} animate-fade-in-up`}>
      <div className={`rounded-lg p-3 max-w-sm md:max-w-md ${bubbleClasses}`}>
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;