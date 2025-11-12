import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from './types';
import { getBotResponse, resetChat } from './services/chatbotService';
import { generateSpeech } from './services/ttsService';
import { decode, decodeAudioData } from './utils/audioUtils';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Header from './components/Header';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          return parsedMessages;
        }
      }
    } catch (error) {
      console.error("Failed to load messages from localStorage", error);
    }
    return [
      {
        id: 1,
        text: "Hello! I'm an AI-powered chatbot. I can now speak my responses! Ask me anything, and click the speaker icon to toggle my voice.",
        sender: 'bot'
      }
    ];
  });
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save messages to localStorage", error);
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
  }, []);

  const playAudio = useCallback(async (base64Audio: string) => {
    stopAudio();

    if (!audioContextRef.current) {
      // FIX: Cast window to any to support webkitAudioContext for older browsers.
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }

    const audioContext = audioContextRef.current;
    
    try {
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();

      audioSourceRef.current = source;
      source.onended = () => {
        if (audioSourceRef.current === source) {
          audioSourceRef.current = null;
        }
      };
    } catch (error) {
      console.error("Failed to play audio:", error);
    }
  }, [stopAudio]);

  const handleSendMessage = useCallback(async (text: string) => {
    stopAudio();
    const newUserMessage: Message = {
      id: Date.now(),
      text,
      sender: 'user',
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setIsTyping(true);

    const botResponseText = await getBotResponse(text);
    const newBotMessage: Message = {
      id: Date.now() + 1,
      text: botResponseText,
      sender: 'bot',
    };

    setMessages(prevMessages => [...prevMessages, newBotMessage]);

    if (isTtsEnabled && botResponseText) {
        const base64Audio = await generateSpeech(botResponseText);
        if (base64Audio) {
            await playAudio(base64Audio);
        }
    }

    setIsTyping(false);
  }, [isTtsEnabled, playAudio, stopAudio]);

  const handleClearChat = () => {
    stopAudio();
    resetChat();
    setMessages([
      {
        id: 1,
        text: "Chat cleared! Let's start a fresh conversation. What can I help you with?",
        sender: 'bot'
      }
    ]);
  };
  
  const handleToggleTts = () => {
    setIsTtsEnabled(prev => {
      const isDisabling = prev;
      if (isDisabling) {
        stopAudio();
      }
      return !prev;
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto font-sans bg-gray-900 text-white">
      <Header
        onClearChat={handleClearChat}
        isTtsEnabled={isTtsEnabled}
        onToggleTts={handleToggleTts}
      />
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-200 rounded-lg p-3 max-w-xs animate-pulse">
                Bot is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default App;