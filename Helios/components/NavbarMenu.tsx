
import React from 'react';

interface NavbarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
  onNewChat: () => void;
  onGoToSettings: () => void;
}

const NavbarMenu: React.FC<NavbarMenuProps> = ({
  isOpen,
  onClose,
  menuRef,
  onNewChat,
  onGoToSettings,
}) => {
  if (!isOpen) return null;

  const handleMenuItemClick = (action: () => void) => {
    action();
    onClose();
  };
  
  const NAV_MENU_ICON_COLOR_HEX = "000000"; // Black for icons on light menu background

  return (
    <div
      id="navbar-menu"
      ref={menuRef}
      className="absolute right-0 mt-3 w-60 rounded-lg shadow-xl z-50 py-2" 
      style={{
        backgroundColor: 'var(--navbar-menu-bg)', // Uses palette color for menu BG
        border: '1px solid var(--outline-primary)', // Changed to black outline
        color: 'var(--navbar-menu-text)' // Uses palette color for menu text
      }}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-menu-button" 
    >
      <button
        onClick={() => handleMenuItemClick(onNewChat)}
        className="w-full text-left px-5 py-3 text-md flex items-center space-x-3 transition-colors" 
        style={{color: 'inherit'}} // Inherits from parent's --navbar-menu-text
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--navbar-menu-hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        role="menuitem"
      >
        <img 
          src={`https://img.icons8.com/ios/50/${NAV_MENU_ICON_COLOR_HEX}/plus-math.png`} 
          alt="New Chat" 
          className="w-5 h-5 icon-img opacity-80" 
        />
        <span>New Chat</span>
      </button>
      
      <div className="my-1.5 mx-3" style={{borderTop: '1px solid var(--navbar-menu-border)'}}></div> 
      
      <button
        onClick={() => handleMenuItemClick(onGoToSettings)}
        className="w-full text-left px-5 py-3 text-md flex items-center space-x-3 transition-colors" 
        style={{color: 'inherit'}} // Inherits from parent's --navbar-menu-text
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--navbar-menu-hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        role="menuitem"
      >
        <img 
          src={`https://img.icons8.com/ios/50/${NAV_MENU_ICON_COLOR_HEX}/settings.png`} 
          alt="Settings" 
          className="w-5 h-5 icon-img opacity-80" 
        />
        <span>Settings</span>
      </button>
    </div>
  );
};

export default NavbarMenu;