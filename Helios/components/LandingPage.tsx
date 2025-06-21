
import React from 'react';
import { HELIOS_LOGO_URL } from '../constants'; // Import the logo URL

interface LandingPageProps {
  onStartChat: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}> 
      <div 
        className="animate-fadeIn max-w-lg p-6 rounded-lg" 
        style={{ border: '1px solid var(--outline-primary)' }}
      > 
        {/* Replace with actual logo. User needs to place helios-logo.png in /assets */}
        <img 
            src={HELIOS_LOGO_URL} 
            alt="Helios Logo" 
            className="w-48 h-auto sm:w-56 mx-auto mb-6 animate-pulse-subtle" // Adjusted size and margin for logo
        />
        {/* The "Helios" text is part of the logo, so the h1 below might be redundant or styled differently */}
        {/* <h1 className="text-5xl sm:text-6xl font-bold mb-4" style={{color: 'var(--landing-title-text)'}}>Helios</h1>  */}
        <p className="text-xl sm:text-2xl mb-10" style={{color: 'var(--landing-subtitle-text)'}}>Illuminate Your Ideas with AI</p> 
        <p className="text-lg sm:text-xl max-w-md mx-auto mb-12" style={{color: 'var(--landing-description-text)'}}>
          Chat with Helios, your intelligent assistant. Explore ideas, get creative, and find answers with state-of-the-art AI.
        </p> 
        <button
          onClick={onStartChat}
          className="text-lg font-semibold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] transition-all duration-150 ease-in-out transform hover:scale-105" 
          style={{ 
            backgroundColor: 'var(--action-primary-bg)', 
            color: 'var(--action-primary-text)',
            border: '1px solid var(--outline-primary)',
            // @ts-ignore
            '--tw-ring-color': 'var(--focus-ring-color)' 
          }}
          aria-label="Start chatting with Helios AI"
        >
          Start Chatting
        </button>
      </div>
      <p className="text-sm mt-20 absolute bottom-8 px-4 text-center animate-fadeIn" style={{animationDelay: '0.5s', color: 'var(--text-secondary)'}}> 
        Powered by Generative AI. Messages may be processed by AI.
      </p>
    </div>
  );
};

export default LandingPage;