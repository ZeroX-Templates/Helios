


import React, { useState, useEffect } from 'react';
import { BOT_NAME, AVAILABLE_MODELS, DEFAULT_SYSTEM_PROMPT, ChatDensity, HELIOS_LOGO_URL, AVAILABLE_MODELS as AvailableModelsArray } from '../constants'; // Renamed import to avoid conflict
import { useTheme } from '../context/ThemeContext';
import { Message, MessageSender } from '../types';
import { downloadFile } from '../utils/fileUtils';

// These are fixed for reference in HTML export if needed, but primary colors come from CSS vars
const PALETTE_COLORS_HEX = {
  softPink: '#FFDCDC',
  peachyCream: '#FFF2EB',
  lightPeach: '#FFE8CD',
  warmCoral: '#FFD6BA',
  black: '#000000',
  textOnPaletteLight: '#000000', // Pure Black text
};

// Define the SettingsPageProps interface
interface SettingsPageProps {
  onBackToChat: () => void;
  messages: Message[];
  currentModelApiKey: string | null;
  onUpdateModelApiKey: (key: string | null) => void;
  availableModels: typeof AvailableModelsArray; // Use the type of the imported constant
  currentSelectedModelId: string;
  onUpdateSelectedModelId: (modelId: string) => void;
  currentSystemPrompt: string;
  onUpdateSystemPrompt: (prompt: string) => void;
}


const getThemeColorsForExport = (themeStyle: 'light' | 'dark') => { 
  if (themeStyle === 'light') { // Corresponds to html.theme-light in CSS
    return {
      bgPrimary: PALETTE_COLORS_HEX.black,
      bgSecondary: PALETTE_COLORS_HEX.lightPeach, 
      textPrimary: PALETTE_COLORS_HEX.peachyCream,
      textSecondary: PALETTE_COLORS_HEX.warmCoral,
      messageUserBg: PALETTE_COLORS_HEX.softPink,
      messageUserText: PALETTE_COLORS_HEX.textOnPaletteLight, 
      messageAiBg: PALETTE_COLORS_HEX.lightPeach,
      messageAiText: PALETTE_COLORS_HEX.textOnPaletteLight, 
      systemMessageBg: PALETTE_COLORS_HEX.softPink,
      systemMessageText: PALETTE_COLORS_HEX.textOnPaletteLight,
      borderColor: PALETTE_COLORS_HEX.warmCoral, // This refers to palette border, not the new black outline
      codeBg: '#1A1A1A', 
      codeText: PALETTE_COLORS_HEX.peachyCream,
    };
  } else { // Corresponds to :root in CSS
    return {
      bgPrimary: PALETTE_COLORS_HEX.black,
      bgSecondary: PALETTE_COLORS_HEX.softPink, 
      textPrimary: PALETTE_COLORS_HEX.peachyCream,
      textSecondary: PALETTE_COLORS_HEX.warmCoral,
      messageUserBg: PALETTE_COLORS_HEX.lightPeach,
      messageUserText: PALETTE_COLORS_HEX.textOnPaletteLight, 
      messageAiBg: PALETTE_COLORS_HEX.softPink,
      messageAiText: PALETTE_COLORS_HEX.textOnPaletteLight, 
      systemMessageBg: PALETTE_COLORS_HEX.lightPeach,
      systemMessageText: PALETTE_COLORS_HEX.textOnPaletteLight,
      borderColor: PALETTE_COLORS_HEX.warmCoral, // This refers to palette border, not the new black outline
      codeBg: '#1A1A1A', 
      codeText: PALETTE_COLORS_HEX.peachyCream,
    };
  }
};


const SettingsPage: React.FC<SettingsPageProps> = ({ 
  onBackToChat, 
  messages,
  currentModelApiKey,
  onUpdateModelApiKey,
  availableModels, 
  currentSelectedModelId, 
  onUpdateSelectedModelId, 
  currentSystemPrompt, 
  onUpdateSystemPrompt, 
}) => {
  const { 
    theme, setTheme, 
    darkModeBgImageEnabled, setDarkModeBgImageEnabled, 
    chatDensity, setChatDensity 
  } = useTheme();
  const [modelApiKeyInput, setModelApiKeyInput] = useState('');
  const [apiKeySaveStatus, setApiKeySaveStatus] = useState<'idle' | 'saved' | 'cleared' | 'error'>('idle');
  
  const [systemPromptInput, setSystemPromptInput] = useState(currentSystemPrompt); 
  const [systemPromptSaveStatus, setSystemPromptSaveStatus] = useState<'idle' | 'saved'>('idle'); 

  // PALETTE_ICON_COLOR_HEX is for general content icons (e.g., customize, theme style icons)
  // These icons are typically on a dark page background or light card background, so peachyCream works.
  const PALETTE_ICON_COLOR_HEX = "FFF2EB"; 
  // SETTINGS_PAGE_HEADER_ICON_COLOR_HEX for the main settings icon in the page header
  const SETTINGS_PAGE_HEADER_ICON_COLOR_HEX = "000000"; // Black for high contrast on light header BG

  useEffect(() => {
    setModelApiKeyInput(currentModelApiKey || '');
  }, [currentModelApiKey]);

  useEffect(() => { 
    setSystemPromptInput(currentSystemPrompt);
  }, [currentSystemPrompt]);

  const getFormattedTimestamp = (date: Date) => {
    return date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0];
  };

  const handleExportJSON = () => { 
    if (messages.length === 0) { alert("No messages to export."); return; }
    const jsonData = JSON.stringify(messages.map(m => ({...m, avatar: undefined, isLoading: undefined})), null, 2); 
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, -5);
    downloadFile(`helios-chat-export-${timestamp}.json`, jsonData, 'application/json');
  };

  const handleExportTXT = () => { 
    if (messages.length === 0) { alert("No messages to export."); return; }
    let txtData = `${BOT_NAME} Chat Export\nExported on: ${getFormattedTimestamp(new Date())}\n\n------------------------------------\n`;
    messages.forEach(msg => {
      if (msg.sender === MessageSender.SYSTEM) return; 
      const senderName = msg.sender === MessageSender.USER ? 'User' : BOT_NAME;
      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      txtData += `[${time}] ${senderName}:\n${msg.text}\n------------------------------------\n`;
    });
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, -5);
    downloadFile(`helios-chat-export-${timestamp}.txt`, txtData, 'text/plain');
  };
  
  const handleExportMD = () => {
    if (messages.length === 0) { alert("No messages to export."); return; }
    let mdData = `# ${BOT_NAME} Chat Export\n\n**Exported on:** ${getFormattedTimestamp(new Date())}\n\n---\n`;
    messages.forEach(msg => {
      if (msg.sender === MessageSender.SYSTEM) return;
      const senderName = msg.sender === MessageSender.USER ? '**User**' : `**${BOT_NAME}**`;
      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const text = msg.text.replace(/([\\`*_{}[\]()#+.!-])/g, '\\$1'); // Basic MD escaping
      mdData += `${senderName} _(${time})_:\n${text}\n\n---\n`;
    });
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, -5);
    downloadFile(`helios-chat-export-${timestamp}.md`, mdData, 'text/markdown');
  };

  const handleExportHTML = () => {
    if (messages.length === 0) { alert("No messages to export."); return; }
    const currentThemeColors = getThemeColorsForExport(theme); 
    let htmlData = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${BOT_NAME} Chat Export</title>
    <style>
        body { font-family: 'Manrope', sans-serif; margin: 0; padding: 20px; background-color: ${currentThemeColors.bgPrimary}; color: ${currentThemeColors.textPrimary}; }
        .container { max-width: 800px; margin: auto; background-color: ${currentThemeColors.bgSecondary}; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(255,255,255,0.05); border: 1px solid #000000; } /* Added black border to container */
        h1 { color: ${PALETTE_COLORS_HEX.textOnPaletteLight}; text-align: center; margin-bottom: 10px; } /* Ensure export title is black */
        .export-meta {text-align: center; font-size: 0.9em; color: ${currentThemeColors.textSecondary}; margin-bottom: 25px;}
        .message { margin-bottom: 20px; padding: 15px; border-radius: 8px; line-height: 1.6; border: 1px solid #000000; } /* Added black border to messages */
        .message .meta { font-size: 0.85em; color: ${currentThemeColors.textSecondary}; margin-bottom: 8px; }
        .message.user { background-color: ${currentThemeColors.messageUserBg}; color: ${currentThemeColors.messageUserText}; }
        .message.ai { background-color: ${currentThemeColors.messageAiBg}; color: ${currentThemeColors.messageAiText}; }
        .message.system { background-color: ${currentThemeColors.systemMessageBg} ; color: ${currentThemeColors.systemMessageText}; text-align: center; font-style: italic; font-size: 0.9em; }
        .message p { margin: 0; white-space: pre-wrap; word-wrap: break-word; }
        pre { background-color: ${currentThemeColors.codeBg}; color: ${currentThemeColors.codeText}; padding: 12px; border-radius: 6px; overflow-x: auto; font-family: monospace; border: 1px solid #000000; } /* Added black border to pre */
        code { font-family: monospace; } /* Inline code will inherit from parent or needs specific styling if desired */
        hr { margin: 20px 0; border: 0; border-top: 1px solid #000000; } /* Changed hr to black */
    </style>
</head>
<body>
    <div class="container">
        <h1>${BOT_NAME} Chat Export</h1>
        <p class="export-meta">Exported on: ${getFormattedTimestamp(new Date())}</p>
        <hr>
`;
    messages.forEach(msg => {
      const senderClass = msg.sender === MessageSender.USER ? 'user' : msg.sender === MessageSender.AI ? 'ai' : 'system';
      const senderName = msg.sender === MessageSender.USER ? 'User' : msg.sender === MessageSender.AI ? BOT_NAME : 'System Event';
      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Basic HTML escaping
      const text = msg.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
      
      htmlData += `
        <div class="message ${senderClass}">
            <div class="meta">${senderName} - ${time}</div>
            <p>${text.replace(/\n/g, '<br>')}</p> 
        </div>`;
    });
    htmlData += `
    </div>
</body>
</html>`;
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, -5);
    downloadFile(`helios-chat-export-${timestamp}.html`, htmlData, 'text/html');
  };

  const handleSaveModelApiKey = () => {
    const trimmedKey = modelApiKeyInput.trim();
    if (trimmedKey) {
      onUpdateModelApiKey(trimmedKey);
      setApiKeySaveStatus('saved');
    } else {
      onUpdateModelApiKey(null); 
      setApiKeySaveStatus('cleared');
    }
    setTimeout(() => setApiKeySaveStatus('idle'), 2500);
  };

  const handleClearModelApiKey = () => {
    setModelApiKeyInput('');
    onUpdateModelApiKey(null);
    setApiKeySaveStatus('cleared');
    setTimeout(() => setApiKeySaveStatus('idle'), 2500);
  };

  const handleSaveSystemPrompt = () => {
    onUpdateSystemPrompt(systemPromptInput);
    setSystemPromptSaveStatus('saved');
    setTimeout(() => setSystemPromptSaveStatus('idle'), 2500);
  };

  const handleChatDensityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setChatDensity(event.target.value as ChatDensity);
  };

  const hasMessages = messages.filter(m => m.sender !== MessageSender.SYSTEM).length > 0;
  const textModelsForSelection = availableModels.filter(model => model.type === 'text');
  
  const settingsCardTextColor = 'var(--text-on-palette-light)'; // This is already black
  const settingsInputBg = 'var(--bg-tertiary)';

  const apiKeyErrorButtonStyle = { 
    backgroundColor: 'var(--palette-soft-pink)', 
    color: 'var(--palette-warm-coral)', // This will remain coral for error button, specific case
    border: '1px solid var(--outline-primary)'
  };


  return (
    <div className="flex flex-col h-full" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
      <header
        className="w-full p-5 border-b shadow-md flex justify-between items-center fixed top-0 left-0 right-0 z-10" 
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--outline-primary)'}}
      >
        <div className="flex items-center space-x-3">
            <img 
                src={`https://img.icons8.com/ios/50/${SETTINGS_PAGE_HEADER_ICON_COLOR_HEX}/settings.png`}
                alt="Settings Icon" 
                className="w-10 h-10 icon-img shadow-md"
            />
            <h1 className="text-3xl font-semibold" style={{color: 'var(--text-on-palette-light)'}}>Settings</h1>
        </div>
        <button onClick={onBackToChat} className="py-2.5 px-5 rounded-lg transition-colors text-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md" style={{ backgroundColor: 'var(--action-primary-bg)', color: 'var(--action-primary-text)', '--tw-ring-offset-color': 'var(--bg-secondary)', '--tw-ring-color': 'var(--focus-ring-color)', border: '1px solid var(--outline-primary)'} as React.CSSProperties} aria-label="Back to chat" > Back to Chat </button>
      </header>
      <main className="flex-1 flex flex-col items-center pt-28 text-center animate-fadeIn w-full p-6 md:p-8 space-y-10 pb-20" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
        
        <h2 className="text-4xl font-semibold flex items-center space-x-3" style={{color: 'var(--text-primary)'}}>
            <img 
                src={`https://img.icons8.com/ios/50/${PALETTE_ICON_COLOR_HEX}/maintenance.png`} 
                alt="Customize Icon" 
                className="w-10 h-10 icon-img"
            />
            <span>Customize {BOT_NAME}</span>
        </h2>
        
        {/* Appearance Card */}
        <div className="p-7 rounded-xl w-full max-w-lg shadow-xl" style={{backgroundColor: 'var(--settings-card-bg)', border: '1px solid var(--outline-primary)'}}> 
            <h3 className="text-2xl font-semibold mb-6 text-left" style={{color: 'var(--text-on-palette-light)'}}>Appearance</h3>
            <div className="space-y-5"> 
                <div className="flex items-center justify-between">
                    <span style={{color: settingsCardTextColor}} className="text-lg">Theme Style:</span> 
                    <div className="flex items-center space-x-3"> 
                        <button onClick={() => setTheme('dark')} className={`py-2.5 px-5 rounded-lg text-md font-medium transition-all flex items-center space-x-2 ${theme === 'dark' ? 'ring-2 ring-offset-2' : 'opacity-80 hover:opacity-100'}`} style={{ backgroundColor: theme === 'dark' ? 'var(--action-primary-bg)' : 'var(--bg-tertiary)', color: theme === 'dark' ? 'var(--action-primary-text)' : 'var(--text-on-palette-light)', '--tw-ring-offset-color': 'var(--settings-card-bg)', '--tw-ring-color': 'var(--focus-ring-color)', border: '1px solid var(--outline-primary)'} as React.CSSProperties} aria-pressed={theme === 'dark'} > 
                            <img src={`https://img.icons8.com/ios-filled/24/${PALETTE_ICON_COLOR_HEX}/fantasy.png`} alt="Theme Style 1 (Dark Palette)" className="w-5 h-5 icon-img" />
                            <span>Style 1</span> 
                        </button>
                        <button onClick={() => setTheme('light')} className={`py-2.5 px-5 rounded-lg text-md font-medium transition-all flex items-center space-x-2 ${theme === 'light' ? 'ring-2 ring-offset-2' : 'opacity-80 hover:opacity-100'}`} style={{ backgroundColor: theme === 'light' ? 'var(--action-primary-bg)' : 'var(--bg-tertiary)', color: theme === 'light' ? 'var(--action-primary-text)' : 'var(--text-on-palette-light)', '--tw-ring-offset-color': 'var(--settings-card-bg)', '--tw-ring-color': 'var(--focus-ring-color)', border: '1px solid var(--outline-primary)'} as React.CSSProperties} aria-pressed={theme === 'light'} > 
                            <img src={`https://img.icons8.com/ios-filled/24/${PALETTE_ICON_COLOR_HEX}/sun--v1.png`} alt="Theme Style 2 (Light Palette)" className="w-5 h-5 icon-img" />
                            <span>Style 2</span>
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="darkModeBgToggle" className="text-lg" style={{color: settingsCardTextColor}}>Background Image:</label> 
                    <button
                        id="darkModeBgToggle"
                        onClick={() => setDarkModeBgImageEnabled(!darkModeBgImageEnabled)}
                        className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        style={{
                            backgroundColor: darkModeBgImageEnabled ? 'var(--action-primary-bg)' : 'var(--bg-tertiary)',
                            '--tw-ring-offset-color': 'var(--settings-card-bg)',
                            '--tw-ring-color': 'var(--focus-ring-color)',
                            border: '1px solid var(--outline-primary)'
                        } as React.CSSProperties}
                        role="switch"
                        aria-checked={darkModeBgImageEnabled}
                    >
                        <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${darkModeBgImageEnabled ? 'translate-x-6' : 'translate-x-1'}`} style={{backgroundColor: 'var(--palette-peachy-cream)'}} />
                    </button>
                </div>
                 <div className="flex items-center justify-between">
                    <label htmlFor="chatDensitySelect" className="text-lg" style={{color: settingsCardTextColor}}>Message Density:</label>
                    <select
                        id="chatDensitySelect"
                        value={chatDensity}
                        onChange={handleChatDensityChange}
                        className="p-2.5 rounded-lg border text-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                            backgroundColor: settingsInputBg, 
                            borderColor: 'var(--outline-primary)', 
                            color: settingsCardTextColor,
                            '--tw-ring-offset-color': 'var(--settings-card-bg)',
                            '--tw-ring-color': 'var(--focus-ring-color)'
                        } as React.CSSProperties}
                    >
                        <option value="comfortable">Comfortable</option>
                        <option value="compact">Compact</option>
                    </select>
                </div>
            </div>
        </div>

        {/* AI Configuration Card */}
        <div className="p-7 rounded-xl w-full max-w-lg shadow-xl" style={{backgroundColor: 'var(--settings-card-bg)', border: '1px solid var(--outline-primary)'}}>
          <h3 className="text-2xl font-semibold mb-6 text-left" style={{color: 'var(--text-on-palette-light)'}}>AI Configuration</h3>
          <div className="space-y-6">
            <div>
              <label htmlFor="modelApiKey" className="block text-lg mb-2 text-left" style={{color: settingsCardTextColor}}>AI Service API Key (Legacy):</label>
              <input
                type="password"
                id="modelApiKey"
                value={modelApiKeyInput}
                onChange={(e) => { setModelApiKeyInput(e.target.value); setApiKeySaveStatus('idle'); }}
                placeholder="Overrides API_KEY env var if set"
                className="w-full p-3 rounded-lg border text-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                    backgroundColor: settingsInputBg, 
                    borderColor: 'var(--outline-primary)', 
                    color: settingsCardTextColor,
                    '--tw-ring-offset-color': 'var(--settings-card-bg)',
                    '--tw-ring-color': 'var(--focus-ring-color)'
                } as React.CSSProperties}
              />
              <p className="text-xs mt-2 text-left" style={{color: 'var(--text-on-palette-light)'}}>
                The application primarily uses the <code>API_KEY</code> environment variable. This field allows overriding it locally (stored in browser).
                Obtain a Gemini key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline" style={{color: 'var(--text-on-palette-light)'}}>Google AI Studio</a>.
              </p>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleSaveModelApiKey}
                  className={`py-2.5 px-5 rounded-lg text-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md ${apiKeySaveStatus === 'error' ? '' : 'flex-1'}`}
                  style={apiKeySaveStatus === 'error' ? { ...apiKeyErrorButtonStyle, '--tw-ring-offset-color': 'var(--settings-card-bg)', '--tw-ring-color': 'var(--focus-ring-color)' } as React.CSSProperties : { backgroundColor: 'var(--action-primary-bg)', color: 'var(--action-primary-text)', '--tw-ring-offset-color': 'var(--settings-card-bg)', '--tw-ring-color': 'var(--focus-ring-color)', border: '1px solid var(--outline-primary)' } as React.CSSProperties}
                  disabled={apiKeySaveStatus === 'saved' || apiKeySaveStatus === 'cleared' || apiKeySaveStatus === 'error'}
                >
                  {apiKeySaveStatus === 'saved' ? 'Key Saved!' : apiKeySaveStatus === 'cleared' ? 'Key Cleared!' : apiKeySaveStatus === 'error' ? 'Save Failed!' : 'Save/Update Key'}
                </button>
                 {currentModelApiKey && apiKeySaveStatus !== 'error' && (
                  <button
                    onClick={handleClearModelApiKey}
                    className="py-2.5 px-5 rounded-lg text-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md flex-1"
                     style={{backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-on-palette-light)', '--tw-ring-offset-color': 'var(--settings-card-bg)', '--tw-ring-color': 'var(--focus-ring-color)', border: '1px solid var(--outline-primary)'} as React.CSSProperties}
                  >
                    Clear Saved Key
                  </button>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="modelSelect" className="block text-lg mb-2 text-left" style={{color: settingsCardTextColor}}>Select AI Model:</label>
              <select
                id="modelSelect"
                value={currentSelectedModelId}
                onChange={(e) => onUpdateSelectedModelId(e.target.value)}
                className="w-full p-3 rounded-lg border text-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                    backgroundColor: settingsInputBg, 
                    borderColor: 'var(--outline-primary)', 
                    color: settingsCardTextColor,
                    '--tw-ring-offset-color': 'var(--settings-card-bg)',
                    '--tw-ring-color': 'var(--focus-ring-color)'
                } as React.CSSProperties}
              >
                {textModelsForSelection.map(model => (
                  <option key={model.id} value={model.id} disabled={model.disabled}>
                    {model.name} {model.disabled ? ` (${model.note || 'Coming Soon'})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="systemPrompt" className="block text-lg mb-2 text-left" style={{color: settingsCardTextColor}}>Custom System Prompt:</label>
              <textarea
                id="systemPrompt"
                value={systemPromptInput}
                onChange={(e) => { setSystemPromptInput(e.target.value); setSystemPromptSaveStatus('idle');}}
                placeholder={DEFAULT_SYSTEM_PROMPT}
                rows={4}
                className="w-full p-3 rounded-lg border text-md focus:outline-none focus:ring-2 focus:ring-offset-2 resize-y"
                 style={{ 
                    backgroundColor: settingsInputBg, 
                    borderColor: 'var(--outline-primary)', 
                    color: settingsCardTextColor,
                    '--tw-ring-offset-color': 'var(--settings-card-bg)',
                    '--tw-ring-color': 'var(--focus-ring-color)'
                } as React.CSSProperties}
              />
               <p className="text-xs mt-2 text-left" style={{color: 'var(--text-on-palette-light)'}}>
                This prompt guides the AI's behavior. Leave blank to use the default.
              </p>
              <button
                onClick={handleSaveSystemPrompt}
                className="mt-3 py-2.5 px-5 rounded-lg text-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md w-full"
                style={{ backgroundColor: 'var(--action-primary-bg)', color: 'var(--action-primary-text)', '--tw-ring-offset-color': 'var(--settings-card-bg)', '--tw-ring-color': 'var(--focus-ring-color)', border: '1px solid var(--outline-primary)'} as React.CSSProperties}
                disabled={systemPromptSaveStatus === 'saved'}
              >
                {systemPromptSaveStatus === 'saved' ? 'Prompt Saved!' : 'Save System Prompt'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Chat Data Card */}
        <div className="p-7 rounded-xl w-full max-w-lg shadow-xl" style={{backgroundColor: 'var(--settings-card-bg)', border: '1px solid var(--outline-primary)'}}>
            <h3 className="text-2xl font-semibold mb-6 text-left" style={{color: 'var(--text-on-palette-light)'}}>Chat Data</h3>
            <div className="space-y-4">
                <p className="text-left text-lg" style={{color: settingsCardTextColor}}>Export chat history:</p>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleExportJSON} disabled={!hasMessages} className="py-2.5 px-4 rounded-lg text-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md disabled:opacity-60" style={{ backgroundColor: 'var(--action-primary-bg)', color: 'var(--action-primary-text)', '--tw-ring-offset-color': 'var(--settings-card-bg)', '--tw-ring-color': 'var(--focus-ring-color)', border: '1px solid var(--outline-primary)'} as React.CSSProperties}>Export as JSON</button>
                    <button onClick={handleExportTXT} disabled={!hasMessages} className="py-2.5 px-4 rounded-lg text-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md disabled:opacity-60" style={{ backgroundColor: 'var(--action-primary-bg)', color: 'var(--action-primary-text)', '--tw-ring-offset-color': 'var(--settings-card-bg)', '--tw-ring-color': 'var(--focus-ring-color)', border: '1px solid var(--outline-primary)'} as React.CSSProperties}>Export as TXT</button>
                    <button onClick={handleExportMD} disabled={!hasMessages} className="py-2.5 px-4 rounded-lg text-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md disabled:opacity-60" style={{ backgroundColor: 'var(--action-primary-bg)', color: 'var(--action-primary-text)', '--tw-ring-offset-color': 'var(--settings-card-bg)', '--tw-ring-color': 'var(--focus-ring-color)', border: '1px solid var(--outline-primary)'} as React.CSSProperties}>Export as MD</button>
                    <button onClick={handleExportHTML} disabled={!hasMessages} className="py-2.5 px-4 rounded-lg text-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md disabled:opacity-60" style={{ backgroundColor: 'var(--action-primary-bg)', color: 'var(--action-primary-text)', '--tw-ring-offset-color': 'var(--settings-card-bg)', '--tw-ring-color': 'var(--focus-ring-color)', border: '1px solid var(--outline-primary)'} as React.CSSProperties}>Export as HTML</button>
                </div>
            </div>
        </div>
        
        {/* About Card */}
        <div className="p-7 rounded-xl w-full max-w-lg shadow-xl" style={{backgroundColor: 'var(--settings-card-bg)', border: '1px solid var(--outline-primary)'}}>
            <h3 className="text-2xl font-semibold mb-6 text-left flex items-center space-x-2" style={{color: 'var(--text-on-palette-light)'}}>
                <img src={HELIOS_LOGO_URL} alt="Helios Mini Logo" className="w-8 h-auto icon-img" />
                <span>About {BOT_NAME}</span>
            </h3>
            <ul className="space-y-2 text-left text-md list-disc list-inside" style={{color: settingsCardTextColor}}>
                <li>Helios is an AI-powered chatbot designed to provide helpful and informative responses.</li>
                <li>Current Version: 1.0.0</li>
                <li>Built with React, TypeScript, and the Google Gemini API.</li>
                <li>Remember that AI can make mistakes. Verify important information.</li>
            </ul>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
