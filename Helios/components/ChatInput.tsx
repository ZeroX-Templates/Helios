

import React, { KeyboardEvent, FormEvent, useRef } from 'react';

interface ChatInputProps {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSendMessage: (event?: FormEvent) => void;
  isLoading: boolean;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
  isFileProcessing: boolean;
  fileProcessingError: string | null;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  inputValue, 
  onInputChange, 
  onSendMessage, 
  isLoading,
  onFileSelect,
  selectedFile,
  onClearFile,
  isFileProcessing,
  fileProcessingError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (inputValue.trim() || selectedFile)) {
        onSendMessage();
      }
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset file input to allow selecting the same file again if cleared
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const TEXT_INPUT_ICON_COLOR_HEX = "000000"; // Black for icons within input area on light BG

  return (
    <div className="p-4 md:p-5 border-t" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--outline-primary)'}}>
      {fileProcessingError && (
        <div className="mb-2 text-xs p-2 rounded-md" style={{ color: 'var(--palette-warm-coral)', backgroundColor: 'var(--palette-soft-pink)', border: '1px solid var(--outline-primary)'}}>
          Error: {fileProcessingError}
        </div>
      )}
      {selectedFile && !fileProcessingError && (
        <div 
            className="mb-2 p-2.5 rounded-lg flex justify-between items-center text-sm"
            style={{backgroundColor: 'var(--bg-secondary)', color: 'var(--text-on-palette-light)', border: '1px solid var(--outline-primary)'}}
        >
          <div className="flex items-center space-x-2">
            <img 
                src={`https://img.icons8.com/ios-glyphs/20/${TEXT_INPUT_ICON_COLOR_HEX}/document.png`} 
                alt="document icon" 
                className="w-5 h-5 opacity-70 icon-img"
            />
            <span className="truncate max-w-[200px] md:max-w-xs">{selectedFile.name}</span>
            {isFileProcessing && <span className="text-xs opacity-70">(Processing...)</span>}
          </div>
          <button
            onClick={onClearFile}
            className="p-1 rounded-full hover:bg-[var(--navbar-menu-hover-bg)] transition-colors"
            aria-label="Clear selected file"
            disabled={isFileProcessing || isLoading}
          >
            <img 
                src={`https://img.icons8.com/ios-glyphs/20/${TEXT_INPUT_ICON_COLOR_HEX}/multiply.png`} 
                alt="clear file" 
                className="w-4 h-4 icon-img"
            />
          </button>
        </div>
      )}
      <form
        onSubmit={(e) => { 
          e.preventDefault();
          if (!isLoading && (inputValue.trim() || selectedFile)) {
            onSendMessage();
          }
        }}
        className="flex items-center space-x-3" 
        aria-label="Chat input form"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.docx"
          style={{ display: 'none' }}
          disabled={isLoading || isFileProcessing || !!selectedFile}
        />
        <button
          type="button"
          onClick={handleFileButtonClick}
          className="p-3 rounded-full hover:bg-[var(--bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-[var(--focus-ring-color)] transition-colors"
          style={{ border: '1px solid var(--outline-primary)', backgroundColor: 'var(--bg-secondary)'}}
          aria-label="Attach file"
          disabled={isLoading || isFileProcessing || !!selectedFile} 
        >
          <img 
            src={`https://img.icons8.com/ios-glyphs/24/${TEXT_INPUT_ICON_COLOR_HEX}/attach.png`} 
            alt="Attach file" 
            className="w-6 h-6 icon-img"
          />
        </button>
        <textarea
          value={inputValue}
          onChange={onInputChange}
          onKeyPress={handleKeyPress}
          placeholder={selectedFile ? "Ask about the uploaded document..." : "Type your message... (Enter to send, Shift+Enter for new line)"}
          className={`flex-1 p-4 resize-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] focus:ring-[var(--focus-ring-color)] focus:outline-none placeholder-[var(--text-placeholder)] placeholder:text-center rounded-[28px] min-h-[68px] max-h-[200px] text-base leading-tight ${isLoading ? 'opacity-70' : ''}`}
          style={{ 
            backgroundColor: 'var(--bg-tertiary)', 
            borderColor: 'var(--outline-primary)', 
            color: 'var(--text-on-palette-light)', 
            scrollbarWidth: 'thin',
            scrollbarColor: `var(--scrollbar-thumb) var(--bg-tertiary)`
          }}
          rows={2}
          disabled={isLoading || isFileProcessing}
          aria-label="Message input"
          aria-multiline="true"
          autoFocus 
        />
      </form>
    </div>
  );
};

export default ChatInput;