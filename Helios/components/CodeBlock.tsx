
import React, { useState, useEffect } from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
// For black background, vscDarkPlus is a good starting point.
// Or a custom style that strictly uses the palette could be made if necessary.
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; 
import { useTheme } from '../context/ThemeContext'; 
import { ChatDensity } from '../constants';

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  density?: ChatDensity; 
}

const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children, density = 'comfortable' }) => {
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme(); // Theme might influence syntax highlighting style if desired

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const langMatch = /language-(\w+)/.exec(className || '');
  const language = langMatch && langMatch[1] ? langMatch[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const PALETTE_ICON_COLOR_HEX = "FFF2EB"; // Peachy Cream for icons on black/dark surfaces

  const handleCopy = () => {
    if (!isMounted || !navigator.clipboard) {
      alert('Clipboard API not available. Cannot copy.');
      return;
    }
    navigator.clipboard.writeText(codeString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text. See console for details.');
    });
  };

  // vscDarkPlus is generally good for dark backgrounds.
  // If strict palette adherence is needed for syntax colors themselves, this would need a custom style.
  const highlighterStyle = vscDarkPlus; 
  
  const baseFontSize = density === 'compact' ? '0.85rem' : '0.9rem'; 
  const baseLineHeight = density === 'compact' ? '1.4' : '1.6';

  const lineNumberStyle = {
    color: 'var(--code-block-line-number-text)', 
    fontSize: density === 'compact' ? '0.75em' : '0.85em', 
    marginRight: '1.5em' 
  };
  
  const codeBlockFontSize = density === 'compact' ? '!text-sm' : '!text-[15px]';


  if (inline) {
    return (
      <code 
        className={`${className} px-1.5 py-1 rounded-md font-mono ${density === 'compact' ? 'text-xs' : 'text-sm'}`}
        // Inline code uses header bg/text for consistency from palette
        style={{
          backgroundColor: 'var(--code-block-header-bg)', 
          color: 'var(--code-block-header-text)',
          border: '1px solid var(--outline-primary)'
        }}
      >
        {children}
      </code>
    );
  }

  const copiedBgColor = 'var(--palette-light-peach)'; // Use a light palette color for "Copied!" button BG
  const copiedTextColor = 'var(--palette-warm-coral)'; // Text for "Copied!" button

  return (
    <div 
        className={`code-block relative group my-4 rounded-lg shadow-lg overflow-hidden`} 
        style={{
            backgroundColor: 'var(--code-block-bg)', // Uses near-black from CSS vars
            border: '1px solid var(--outline-primary)'
        }} 
    >
      <div 
        className={`flex items-center justify-between px-4 py-2 text-sm`}
        style={{backgroundColor: 'var(--code-block-header-bg)', color: 'var(--code-block-header-text)'}}
      >
        <span className="font-medium">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className={`font-medium py-1.5 px-3 rounded-md transition-all duration-150 flex items-center space-x-1.5 text-sm`} 
          style={{
            backgroundColor: copied ? copiedBgColor : 'var(--code-block-copy-btn-bg)', 
            color: copied ? copiedTextColor : 'var(--code-block-copy-btn-text)',
            border: '1px solid var(--outline-primary)'
          }}
          onMouseEnter={e => { if(!copied) e.currentTarget.style.backgroundColor = 'var(--code-block-copy-btn-hover-bg)'}}
          onMouseLeave={e => { if(!copied) e.currentTarget.style.backgroundColor = 'var(--code-block-copy-btn-bg)'}}
          aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
        >
          <img 
            src={copied ? `https://img.icons8.com/ios-glyphs/20/${PALETTE_ICON_COLOR_HEX}/checkmark--v1.png` : `https://img.icons8.com/ios/20/${PALETTE_ICON_COLOR_HEX}/copy.png`}
            alt={copied ? "Copied" : "Copy"}
            className="w-4 h-4 icon-img"
           />
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={highlighterStyle}
        PreTag="div"
        className={`!p-4 !m-0 ${codeBlockFontSize} leading-relaxed overflow-x-auto`}
        customStyle={{ fontSize: baseFontSize, lineHeight: baseLineHeight, background: 'transparent' }} // Ensure highlighter BG is transparent if main block has BG
        showLineNumbers={codeString.split('\n').length > 3}
        lineNumberStyle={lineNumberStyle}
        codeTagProps={{ style: { fontSize: 'inherit', lineHeight: 'inherit' } }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;