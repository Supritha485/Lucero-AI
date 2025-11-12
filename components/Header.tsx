
import React from 'react';
import SpeakerIcon from './SpeakerIcon';

interface HeaderProps {
    onClearChat: () => void;
    isTtsEnabled: boolean;
    onToggleTts: () => void;
}

const Header: React.FC<HeaderProps> = ({ onClearChat, isTtsEnabled, onToggleTts }) => {
    return (
        <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 shadow-lg">
            <h1 className="text-xl font-bold text-sky-400">AI Chatbot</h1>
            <div className="flex items-center space-x-4">
                 <button
                    onClick={onToggleTts}
                    className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500 ${isTtsEnabled ? 'text-sky-400 bg-gray-700' : 'text-gray-400 hover:bg-gray-700'}`}
                    aria-label={isTtsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
                >
                    <SpeakerIcon enabled={isTtsEnabled} className="w-6 h-6" />
                </button>
                <button
                    onClick={onClearChat}
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 transition-colors"
                    aria-label="Clear chat history"
                >
                    Clear Chat
                </button>
            </div>
        </header>
    );
};

export default Header;