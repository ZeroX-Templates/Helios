

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth.js';
import { Message, MessageSender } from './types';
import {
    BOT_NAME,
    BOT_AVATAR_URL,
    USER_AVATAR_URL,
    AVAILABLE_MODELS,
    SELECTED_MODEL_ID_LS_KEY,
    CUSTOM_SYSTEM_PROMPT_LS_KEY,
    DEFAULT_SYSTEM_PROMPT,
    HELIOS_FLOWER_ICON_URL,
    CHAT_BACKGROUND_IMAGE_URL 
} from './constants';
import MessageBubble from './components/MessageBubble';
import ChatInput from './components/ChatInput';
import LandingPage from './components/LandingPage';
import NavbarMenu from './components/NavbarMenu';
import SettingsPage from './components/SettingsPage';
import useChatScroll from './hooks/useChatScroll';
import { useTheme } from './context/ThemeContext';

type View = 'landing' | 'chat' | 'settings';

const MODEL_API_KEY_LS_KEY = 'helios-model-api-key';

const getEnvVariable = (nodeKey: string, replitKey?: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env && process.env[nodeKey]) {
    return process.env[nodeKey];
  }
  if (typeof window !== 'undefined' && (window as any).env) {
    const keyToUse = replitKey || nodeKey;
    if ((window as any).env[keyToUse]) {
      return (window as any).env[keyToUse];
    }
  }
  return undefined;
};

const getDefaultModelApiKey = (): string | null => {
  const storedKey = localStorage.getItem(MODEL_API_KEY_LS_KEY);
  if (storedKey) return storedKey;

  const envKey = getEnvVariable('GEMINI_API_KEY', 'REPL_PUBLIC_GEMINI_API_KEY');
  if (envKey) return envKey;

  return null;
};


const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('landing');

  const [userModelApiKey, setUserModelApiKey] = useState<string | null>(getDefaultModelApiKey());
  const [aiClient, setAiClient] = useState<GoogleGenAI | null>(null);
  const [modelApiStatus, setModelApiStatus] = useState<'initializing' | 'ready' | 'error' | 'missing_key'>('missing_key');

  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    const savedModelId = localStorage.getItem(SELECTED_MODEL_ID_LS_KEY);
    if (savedModelId && AVAILABLE_MODELS.find(m => m.id === savedModelId && m.type === 'text' && !m.disabled)) {
      return savedModelId;
    }
    return AVAILABLE_MODELS.find(m => m.type === 'text' && !m.disabled)?.id || 'gemini-2.5-flash-preview-04-17';
  });

  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>(
    () => localStorage.getItem(CUSTOM_SYSTEM_PROMPT_LS_KEY) || DEFAULT_SYSTEM_PROMPT
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedFileText, setExtractedFileText] = useState<string | null>(null);
  const [isFileProcessing, setIsFileProcessing] = useState<boolean>(false);
  const [fileProcessingError, setFileProcessingError] = useState<string | null>(null);

  const chatContainerRef = useChatScroll([messages, isAiLoading]);
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const { theme, darkModeBgImageEnabled } = useTheme();
  const PALETTE_ICON_COLOR_HEX = "FFF2EB"; 
  const HEADER_ICON_COLOR_HEX = "000000"; 

  useEffect(() => {
    // Setup PDF.js worker
    // Make sure the worker is available at this path in your deployment
    // For local dev, you might need to copy it to your public folder or adjust path
     try {
        const workerSrc = (pdfjsLib as any).GlobalWorkerOptions?.workerSrc || `https://esm.sh/pdfjs-dist@4.4.170/build/pdf.worker.min.js`;
        if (workerSrc && typeof workerSrc === 'string') {
           (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;
        } else {
            console.warn('PDF.js workerSrc could not be determined. PDF processing might fail.');
        }
    } catch (e) {
        console.error("Error setting PDF.js worker source:", e);
    }
  }, []);


  useEffect(() => {
    const apiKeyFromEnv = process.env.API_KEY;

    if (apiKeyFromEnv) {
        setUserModelApiKey(apiKeyFromEnv); 
    } else if (userModelApiKey) {
        //Proceed with userModelApiKey
    } else { 
        setAiClient(null);
        setModelApiStatus('missing_key');
        console.info("AI Model API key not found. AI features will be disabled until a key is provided via environment variable (API_KEY) or in Settings (legacy).");
        return;
    }

    const effectiveApiKey = apiKeyFromEnv || userModelApiKey;

    if (effectiveApiKey) {
        setModelApiStatus('initializing');
        try {
            const client = new GoogleGenAI({ apiKey: effectiveApiKey });
            setAiClient(client);
            setModelApiStatus('ready');
            console.info("AI client initialized successfully.");
        } catch (error) {
            console.error("Failed to initialize AI client:", error);
            setAiClient(null);
            setModelApiStatus('error');
        }
    } else { 
        setAiClient(null);
        setModelApiStatus('missing_key');
        console.info("AI Model API key not found.");
    }
  }, [userModelApiKey]); 


  const handleUserModelApiKeyUpdate = (newKey: string | null) => {
    if (newKey) {
      localStorage.setItem(MODEL_API_KEY_LS_KEY, newKey);
      setUserModelApiKey(newKey);
    } else {
      localStorage.removeItem(MODEL_API_KEY_LS_KEY);
      const envApiKey = process.env.API_KEY || getEnvVariable('GEMINI_API_KEY', 'REPL_PUBLIC_GEMINI_API_KEY'); 
      setUserModelApiKey(envApiKey || null);
    }
  };

  const handleSelectedModelUpdate = (modelId: string) => {
    const modelExists = AVAILABLE_MODELS.find(m => m.id === modelId && m.type === 'text' && !m.disabled);
    if (modelExists) {
        localStorage.setItem(SELECTED_MODEL_ID_LS_KEY, modelId);
        setSelectedModelId(modelId);
    } else {
        const defaultTextModel = AVAILABLE_MODELS.find(m => m.type === 'text' && !m.disabled);
        if (defaultTextModel) {
            localStorage.setItem(SELECTED_MODEL_ID_LS_KEY, defaultTextModel.id);
            setSelectedModelId(defaultTextModel.id);
        }
        console.warn(`Attempted to select a disabled or non-existent model: ${modelId}. Reverted to default.`);
    }
  };

  const handleCustomSystemPromptUpdate = (prompt: string) => {
    const finalPrompt = prompt.trim() === '' ? DEFAULT_SYSTEM_PROMPT : prompt;
    localStorage.setItem(CUSTOM_SYSTEM_PROMPT_LS_KEY, finalPrompt);
    setCustomSystemPrompt(finalPrompt);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node) &&
          hamburgerRef.current && !hamburgerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleStartChat = () => setCurrentView('chat');
  const handleNewChat = () => { 
    setMessages([]); 
    setIsAiLoading(false); 
    setInputValue(''); 
    setCurrentView('chat'); 
    setIsMenuOpen(false); 
    setSelectedFile(null);
    setExtractedFileText(null);
    setFileProcessingError(null);
    setIsFileProcessing(false);
  };
  const handleGoToSettings = () => { setCurrentView('settings'); setIsMenuOpen(false); };
  const navigateToChat = () => setCurrentView('chat');
  const navigateToLanding = () => setCurrentView('landing');

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent += text.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
        }
        return textContent;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
    }
  };

  const handleFileSelected = async (file: File) => {
    if (!file) return;
    // Max file size: 5MB
    if (file.size > 5 * 1024 * 1024) {
        setFileProcessingError('File is too large (max 5MB).');
        setSelectedFile(null);
        setExtractedFileText(null);
        return;
    }

    setSelectedFile(file);
    setExtractedFileText(null);
    setFileProcessingError(null);
    setIsFileProcessing(true);
    try {
        const text = await extractTextFromFile(file);
        setExtractedFileText(text);
        setMessages(prev => [...prev, {
            id: `system-${Date.now()}`,
            text: `File "${file.name}" processed. You can now ask questions about it.`,
            sender: MessageSender.SYSTEM,
            timestamp: new Date(),
        }]);
    } catch (error: any) {
        console.error('Error processing file:', error);
        setFileProcessingError(error.message || 'Failed to process file.');
        setExtractedFileText(null);
        setSelectedFile(null); // Clear invalid file
    } finally {
        setIsFileProcessing(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setExtractedFileText(null);
    setFileProcessingError(null);
    setIsFileProcessing(false);
  };


  const handleSendMessage = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    const trimmedInput = inputValue.trim();
    if ((!trimmedInput && !extractedFileText) || isAiLoading || modelApiStatus !== 'ready' || !aiClient) return;

    let messageText = trimmedInput;
    if (extractedFileText) {
        messageText = `CONTEXT FROM UPLOADED DOCUMENT ("${selectedFile?.name}"):\n\`\`\`\n${extractedFileText}\n\`\`\`\n\nUSER QUESTION:\n${trimmedInput || "Please summarize or tell me about the document."}`;
    }

    const userMessage: Message = { id: `user-${Date.now()}`, text: messageText, sender: MessageSender.USER, timestamp: new Date(), avatar: USER_AVATAR_URL };
    setMessages((prev) => [...prev, userMessage]);
    
    setInputValue('');
    setIsAiLoading(true);
    // Clear file context after sending message with it
    if(extractedFileText) {
        handleClearFile();
    }


    const aiMessageId = `ai-${Date.now()}`;
    const aiMessagePlaceholder: Message = { id: aiMessageId, text: '', sender: MessageSender.AI, timestamp: new Date(), avatar: BOT_AVATAR_URL, isLoading: true };
    setMessages((prev) => [...prev, aiMessagePlaceholder]);


    try {
      const currentActiveModel = AVAILABLE_MODELS.find(m => m.id === selectedModelId && !m.disabled && m.type === 'text');
      if (!currentActiveModel) {
        throw new Error("Selected model is not available or disabled.");
      }

      const systemInstructionForThisTurn = customSystemPrompt || DEFAULT_SYSTEM_PROMPT;

      const stream = await aiClient.models.generateContentStream({
        model: currentActiveModel.id,
        contents: [{role: "user", parts: [{text: messageText}]}], // Send the combined text
        config: { systemInstruction: systemInstructionForThisTurn }
      });


      let accumulatedText = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          accumulatedText += chunkText;
          setMessages((prev) => prev.map((msg) => msg.id === aiMessageId ? { ...msg, text: accumulatedText, isLoading: true } : msg));
        }
      }
      setMessages((prev) => prev.map((msg) => msg.id === aiMessageId ? { ...msg, isLoading: false } : msg));
    } catch (error: any) {
      console.error('Error fetching AI response:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      if (error.message && (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID'))) {
        errorMessage = 'The API key is invalid or has insufficient permissions. Please check your API key in Settings or environment variables.';
        setModelApiStatus('error');
      } else if (error.message && error.message.includes('quota')) {
        errorMessage = 'You have exceeded your API quota. Please check your usage or try again later.';
      } else if (error.message && error.message.includes("Selected model is not available")) {
        errorMessage = 'The selected AI model is currently not available. Please choose another model in Settings.';
      }
      setMessages((prev) => prev.map((msg) => msg.id === aiMessageId ? { ...msg, text: errorMessage, isLoading: false } : msg));
    } finally {
      setIsAiLoading(false);
    }
  };

  const isChatOrSettingsView = currentView === 'chat' || currentView === 'settings';

 if (isChatOrSettingsView && (modelApiStatus === 'missing_key' || modelApiStatus === 'error')) {
    const errorTitle = modelApiStatus === 'missing_key' ? `AI Service Requires API Key` : `AI Service Offline`;
    const errorMessageText = modelApiStatus === 'missing_key'
      ? "An API key is required for chat functionality. Please ensure the API_KEY environment variable is set. For local setup, you might need to configure it. If using a hosted environment, ensure it's provided by the platform."
      : "The AI service could not be initialized. This may be due to an invalid API key, network issues, or a temporary service problem. Please verify the API_KEY environment variable or check your API key in Settings (if manually overridden).";
    const errorDetails = modelApiStatus === 'missing_key'
      ? "For Gemini models, an API key can be obtained from Google AI Studio. This app prioritizes the API_KEY environment variable."
      : "If the problem persists, ensure your internet connection is stable and check the AI provider's status page. Verify the API_KEY environment variable.";

    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
        <img
            src={`https://img.icons8.com/ios/100/${PALETTE_ICON_COLOR_HEX}/error--v1.png`}
            alt="Warning"
            className="w-24 h-24 mx-auto mb-8 icon-img"
        />
        <h1 className="text-4xl font-semibold mb-4" style={{color: 'var(--text-primary)'}}>{errorTitle}</h1>
        <p className="text-lg mb-3" style={{color: 'var(--text-primary)'}}>{errorMessageText}</p>
        <p className="text-md mt-2 mb-8" style={{color: 'var(--text-primary)'}}>{errorDetails}</p>
        {(modelApiStatus === 'missing_key' || modelApiStatus === 'error') && (
             <button onClick={handleGoToSettings} className="mt-6 py-3 px-6 rounded-lg transition-colors text-md font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--focus-ring-color)]" style={{ backgroundColor: 'var(--action-primary-bg)', color: 'var(--action-primary-text)', '--tw-ring-offset-color': 'var(--bg-primary)', border: '1px solid var(--outline-primary)'} as React.CSSProperties}>Go to Settings (Legacy Key)</button>
        )}
         <button onClick={navigateToLanding} className="mt-4 py-3 px-6 rounded-lg transition-colors text-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--focus-ring-color)]" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-on-palette-light)', '--tw-ring-offset-color': 'var(--bg-primary)', border: '1px solid var(--outline-primary)'} as React.CSSProperties}>Go to Homepage</button>
      </div>
    );
  }

  if (currentView === 'landing') return <LandingPage onStartChat={handleStartChat} />;

  if (currentView === 'settings') {
    return <SettingsPage
              onBackToChat={navigateToChat}
              messages={messages}
              currentModelApiKey={userModelApiKey} 
              onUpdateModelApiKey={handleUserModelApiKeyUpdate}
              availableModels={AVAILABLE_MODELS}
              currentSelectedModelId={selectedModelId}
              onUpdateSelectedModelId={handleSelectedModelUpdate}
              currentSystemPrompt={customSystemPrompt}
              onUpdateSystemPrompt={handleCustomSystemPromptUpdate}
            />;
  }

  if (currentView === 'chat') {
    return (
      <div className="flex flex-col h-full" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
        <header
          className="p-5 border-b shadow-md flex justify-between items-center relative"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--outline-primary)' }}
        >
          <div
            onClick={navigateToLanding}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <img
              src={HELIOS_FLOWER_ICON_URL}
              alt="Helios Icon"
              className="w-9 h-9 icon-img group-hover:opacity-80 transition-opacity"
            />
            <h1 className="text-3xl font-semibold group-hover:opacity-80 transition-opacity" style={{color: 'var(--text-on-palette-light)'}}>{BOT_NAME}</h1>
          </div>
          <div className="relative">
            <button
              ref={hamburgerRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-[var(--navbar-menu-hover-bg)] focus:outline-none focus:ring-2 ring-offset-2 ring-offset-[var(--bg-secondary)] focus:ring-[var(--focus-ring-color)] transition-all"
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              aria-controls="navbar-menu"
              style={{ border: '1px solid var(--outline-primary)' }}
            >
              <img
                src={isMenuOpen ? `https://img.icons8.com/ios/50/${HEADER_ICON_COLOR_HEX}/delete-sign.png` : `https://img.icons8.com/ios/50/${HEADER_ICON_COLOR_HEX}/menu--v1.png`}
                alt={isMenuOpen ? "Close menu" : "Open menu"}
                className="w-7 h-7 icon-img"
              />
            </button>
            <NavbarMenu
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              menuRef={menuRef}
              onNewChat={handleNewChat}
              onGoToSettings={handleGoToSettings}
            />
          </div>
        </header>

        <main
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5"
          style={{
            backgroundColor: 'var(--bg-primary)',
            backgroundImage: darkModeBgImageEnabled ? `url("${CHAT_BACKGROUND_IMAGE_URL}")` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            color: 'var(--text-primary)'
          }}
        >
          {messages.length === 0 && (<div className="text-center pt-12 px-4 animate-fadeIn text-lg" style={{color: 'var(--text-secondary)'}}>Conversation started. Type your first message to {BOT_NAME}.</div>)}
          {messages.map((msg) => (<MessageBubble key={msg.id} message={msg} />))}
          {isAiLoading &&
           messages.length > 0 &&
           messages[messages.length - 1]?.sender === MessageSender.USER &&
           !messages.some(m => m.isLoading && m.sender === MessageSender.AI && m.id === `ai-${parseInt(messages[messages.length - 1].id.split('-')[1]) +1 }`) &&
              (<MessageBubble key="typing-indicator-explicit" message={{ id: 'typing-indicator-explicit-placeholder', text: '', sender: MessageSender.AI, timestamp: new Date(), avatar: BOT_AVATAR_URL, isLoading: true }} />
          )}
        </main>

        <ChatInput
          inputValue={inputValue}
          onInputChange={(e) => setInputValue(e.target.value)}
          onSendMessage={handleSendMessage}
          isLoading={isAiLoading || modelApiStatus !== 'ready' || isFileProcessing}
          onFileSelect={handleFileSelected}
          selectedFile={selectedFile}
          onClearFile={handleClearFile}
          isFileProcessing={isFileProcessing}
          fileProcessingError={fileProcessingError}
        />
      </div>
    );
  }

  if (currentView !== 'landing' && currentView !== 'settings' && modelApiStatus === 'ready') {
    setCurrentView('chat');
    return null;
  }
  return <LandingPage onStartChat={handleStartChat} />;
};

export default App;
