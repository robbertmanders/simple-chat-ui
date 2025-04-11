import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { SendHorizontal } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

const ChatPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Improved auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiTyping) return;

    const currentInputText = inputText;
    setInputText('');

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      content: currentInputText,
      isUser: true
    };
    
    // Prepare the messages to send, including the new user message
    const messagesToSend = [...messages, userMessage];

    // Add user message and placeholder for AI response to the UI state
    const aiMessageId = `ai-${Date.now()}`;
    setMessages([...messagesToSend, {
      id: aiMessageId,
      content: '', // Start with empty content
      isUser: false
    }]);
    
    // Auto-focus input after sending
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    setIsAiTyping(true);

    try {
      // Get required environment variables
      const apiBaseUrl = import.meta.env.VITE_BACKEND_API_URL;
      const chatPath = import.meta.env.VITE_BACKEND_API_PATH;

      if (!apiBaseUrl || !chatPath) {
        console.error("Error: VITE_BACKEND_API_URL and VITE_BACKEND_API_PATH must be set in your .env file.");
        // Update the placeholder message with an error
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, content: "Configuration error: API URL or Path not set." }
              : msg
          )
        );
        setIsAiTyping(false);
        return; // Stop execution if config is missing
      }

      const apiUrl = `${apiBaseUrl}${chatPath}`; // Construct the full URL

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Accept header if your backend specifically expects it for streaming
          // 'Accept': 'text/event-stream', 
        },
        // Send the full messages array including the latest user message
        body: JSON.stringify({ messages: messagesToSend }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Handle the stream
      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let streamedContent = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          streamedContent += chunk;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, content: streamedContent } 
                : msg
            )
          );
          scrollToBottom(); // Scroll as content streams in
        }
      }

    } catch (error) {
      console.error("Error fetching or streaming chat response:", error);
      // Update the placeholder message with an error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: "Sorry, I encountered an error. Please try again." } 
            : msg
        )
      );
    } finally {
      setIsAiTyping(false); // Set typing to false when stream ends or errors
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If Enter is pressed without Shift, submit the form
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
    // If Shift+Enter is pressed, allow the default behavior (new line)
  };

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]">
      <div className="w-full md:w-1/2 md:mx-auto px-2">
        <ScrollArea className="h-[calc(100vh-80px)]" ref={scrollAreaRef}>
          <div className={`${isMobile ? 'h-[80px]' : 'h-[200px]'}`}></div>
          
          <div className={`${isMobile ? 'pr-2' : 'pr-10'}`}>
            <h1 className={`text-heading-1 mb-10 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Chat</h1>
            
            <div className="mb-0">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`mb-4 ${message.isUser ? 'flex justify-end' : 'flex justify-beginning'}`}
                >
                  <div 
                    className={`rounded-lg py-2 px-3 max-w-[80%] ${
                      message.isUser 
                        ? 'bg-white ml-auto text-body-medium' 
                        : 'bg-white text-body-medium'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
              ))}
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Reduced height for less whitespace */}
            <div className={`${isMobile ? 'h-4' : 'h-4'}`}></div>
          </div>
        </ScrollArea>
      </div>
      
      <div className="w-full md:w-1/2 md:mx-auto fixed bottom-4 left-0 right-0 py-4 bg-[hsl(var(--background))]">
        <div className="w-full mx-auto px-4">
          <form onSubmit={handleSendMessage}>
            <div className="flex items-center bg-white rounded-lg overflow-hidden">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 py-2 px-3 outline-none text-sm resize-none min-h-[38px] max-h-[120px] overflow-y-auto text-body-medium"
                rows={1}
                disabled={isAiTyping}
              />
              <button 
                type="submit" 
                className="py-2 px-7 bg-white self-start default-icon"
                disabled={!inputText.trim() || isAiTyping}
              >
                <SendHorizontal size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 