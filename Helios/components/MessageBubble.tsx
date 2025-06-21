
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, MessageSender } from '../types';
import Avatar from './Avatar';
import TypingIndicator from './TypingIndicator';
import CodeBlock from './CodeBlock';
import { useTheme } from '../context/ThemeContext'; 
import {
  BOT_AVATAR_URL,
  USER_AVATAR_URL,
} from '../constants';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { text, sender, timestamp, avatar, isLoading } = message;
  const { chatDensity } = useTheme(); 

  const isUser = sender === MessageSender.USER;
  const isSystem = sender === MessageSender.SYSTEM;

  let alignment = isUser ? 'justify-end' : 'justify-start';
  let avatarSrc = isUser ? USER_AVATAR_URL : BOT_AVATAR_URL;
  if (avatar) avatarSrc = avatar;

  // These CSS variables are now set up for the black background theme
  const bubbleBgVar = isUser ? 'var(--message-user-bg)' : 'var(--message-ai-bg)';
  const bubbleTextVar = isUser ? 'var(--message-user-text)' : 'var(--message-ai-text)';

  const bubblePadding = chatDensity === 'compact' ? 'px-3 py-2.5' : 'px-5 py-4';
  const textSizeClass = chatDensity === 'compact' ? 'text-sm' : 'text-base'; 
  const timeTextSizeClass = chatDensity === 'compact' ? 'text-xs mt-1' : 'text-sm mt-1.5';
  const avatarSize = chatDensity === 'compact' ? 8 : 9;
  const bubbleMargin = 'my-3';
  const avatarBubbleSpace = isUser ? 'space-x-reverse space-x-3' : 'space-x-3';

  if (isSystem) {
    return (
      <div className={`flex justify-center ${bubbleMargin} animate-fadeIn`}>
        <p 
            className={`text-sm px-4 py-2 rounded-full ${chatDensity === 'compact' ? 'text-xs' : 'text-sm'}`}
            style={{ 
                color: 'var(--system-message-text)', 
                backgroundColor: 'var(--system-message-bg)',
                border: '1px solid var(--outline-primary)'
            }}
        >
          {text}
        </p>
      </div>
    );
  }
  
  if (isLoading && !text && sender === MessageSender.AI) {
     return (
      <div className={`flex items-end ${alignment} ${bubbleMargin} ${avatarBubbleSpace} animate-fadeIn`}>
        {!isUser && <div className="self-end shrink-0"><Avatar src={avatarSrc} alt={sender} size={avatarSize} /></div>}
        <div 
          className={`${bubblePadding} rounded-xl shadow-md max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl`}
          style={{ 
            backgroundColor: 'var(--message-ai-bg)', // AI bubble BG from palette
            border: '1px solid var(--outline-primary)'
          }} 
        >
          <TypingIndicator /> {/* Dots use --typing-indicator-dot which is light from palette */}
        </div>
        {isUser && <div className="self-end shrink-0"><Avatar src={avatarSrc} alt={sender} size={avatarSize} /></div>}
      </div>
    );
  }


  return (
    <div className={`flex ${alignment} ${bubbleMargin} animate-fadeIn`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start ${avatarBubbleSpace} max-w-[90%] sm:max-w-[80%] md:max-w-[75%]`}>
        <div className="self-end shrink-0">
          <Avatar src={avatarSrc} alt={sender} size={avatarSize} />
        </div>
        
        <div className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`${bubblePadding} ${textSizeClass} break-words rounded-xl shadow-md`}
            style={{ 
              backgroundColor: bubbleBgVar,
              color: bubbleTextVar,
              border: '1px solid var(--outline-primary)'
            }}
            role="log"
            aria-live={sender === MessageSender.AI && !isLoading ? "polite" : "off"}
          >
            {isLoading && text ? ( 
                <>
                 <ReactMarkdown
                    children={text + '▌'} 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code: (props) => <CodeBlock {...props} density={chatDensity} />,
                        p: ({node, ...props}) => <p className={`mb-1.5 last:mb-0 ${textSizeClass}`} {...props} />,
                        a: ({node, ...props}) => <a style={{color: 'var(--link-text)'}} className="underline hover:opacity-80" target="_blank" rel="noopener noreferrer" {...props} />,
                        ul: ({node, ...props}) => <ul className={`list-disc list-inside ml-4 mb-1.5 ${textSizeClass}`} {...props} />,
                        ol: ({node, ...props}) => <ol className={`list-decimal list-inside ml-4 mb-1.5 ${textSizeClass}`} {...props} />,
                    }}
                    />
                </>
            ) : (
                <ReactMarkdown
                children={text}
                remarkPlugins={[remarkGfm]}
                components={{
                    code: (props) => <CodeBlock {...props} density={chatDensity} />,
                    p: ({node, ...props}) => <p className={`mb-1.5 last:mb-0 ${textSizeClass}`} {...props} />,
                    a: ({node, ...props}) => <a style={{color: 'var(--link-text)'}} className="underline hover:opacity-80" target="_blank" rel="noopener noreferrer" {...props} />,
                    ul: ({node, ...props}) => <ul className={`list-disc list-inside ml-4 mb-1.5 ${textSizeClass}`} {...props} />,
                    ol: ({node, ...props}) => <ol className={`list-decimal list-inside ml-4 mb-1.5 ${textSizeClass}`} {...props} />,
                }}
                />
            )}
          </div>
          <div className={`${timeTextSizeClass} px-1.5 ${isUser ? 'text-right' : 'text-left'}`} style={{ color: 'var(--text-secondary)' }}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;