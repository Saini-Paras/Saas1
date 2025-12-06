import React from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';
import { ToolCategory } from '../../types';
import { categoryTitles } from '../../config/tools';

interface HeaderProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  isDesktopSidebarOpen: boolean;
  setDesktopSidebarOpen: (v: boolean) => void;
  activeCategory: ToolCategory;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  setSidebarOpen,
  isDesktopSidebarOpen,
  setDesktopSidebarOpen,
  activeCategory,
  theme,
  toggleTheme
}) => {
  return (
    <header className="h-16 border-b border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 transition-colors duration-300">
      <div className="flex items-center gap-4">
         {/* Mobile Sidebar Toggle */}
         <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className="text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white lg:hidden"
         >
           <Menu size={20} />
         </button>

         {/* Desktop Sidebar Toggle */}
         <button 
            onClick={() => setDesktopSidebarOpen(!isDesktopSidebarOpen)} 
            className="text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hidden lg:block"
            title={isDesktopSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
         >
           {isDesktopSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
         </button>

         <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-500">
           <span className="hidden md:inline">Dashboard</span>
           <span className="text-gray-300 dark:text-neutral-700">/</span>
           <span className="text-gray-900 dark:text-white font-medium capitalize">
               {activeCategory === 'overview' ? 'Overview' : categoryTitles[activeCategory] || activeCategory + ' Tools'}
           </span>
         </div>
      </div>
      
      <button 
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
};