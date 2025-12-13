import React from 'react';
import { Sparkles, LayoutDashboard, ShoppingBag, Code2, Layers, Workflow } from 'lucide-react';
import { ToolCategory } from '../../types';

interface SidebarProps {
  activeCategory: ToolCategory;
  onSelectCategory: (c: ToolCategory) => void;
  isSidebarOpen: boolean;
  effectiveDesktopOpen: boolean;
  setSidebarHovered: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  onSelectCategory,
  isSidebarOpen,
  effectiveDesktopOpen,
  setSidebarHovered
}) => {
  
  const NavItem = ({ id, icon: Icon, label }: { id: ToolCategory, icon: any, label: string }) => (
    <button
      onClick={() => onSelectCategory(id)}
      className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 border border-transparent
        ${activeCategory === id 
          ? 'bg-gray-100 dark:bg-[#2a2a2a] text-accent-600 dark:text-white border-gray-200 dark:border-neutral-700' 
          : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#252525]'}
        ${effectiveDesktopOpen ? 'justify-start gap-3' : 'justify-center'}
      `}
      title={label}
    >
      <Icon size={20} className={`shrink-0 ${activeCategory === id ? 'text-accent-600 dark:text-white' : ''}`} />
      <span className={`transition-all duration-300 whitespace-nowrap opacity-100 ${effectiveDesktopOpen ? '' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <aside 
      onMouseEnter={() => setSidebarHovered(true)}
      onMouseLeave={() => setSidebarHovered(false)}
      className={`
        fixed lg:static inset-y-0 left-0 z-50 h-full
        bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-neutral-800
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${effectiveDesktopOpen ? 'lg:w-64' : 'lg:w-[72px]'}
        flex flex-col group/sidebar z-50 shadow-xl lg:shadow-none
      `}
    >
      {/* Sidebar Header */}
      <div className={`h-16 flex items-center border-b border-gray-200 dark:border-neutral-800 overflow-hidden whitespace-nowrap shrink-0 transition-all duration-300 ${effectiveDesktopOpen ? 'px-6 gap-3' : 'px-6 lg:px-0 lg:justify-center'}`}>
        <div className="flex items-center gap-3 font-semibold text-gray-900 dark:text-white tracking-tight">
          <div className="w-8 h-8 bg-accent-600 rounded-md flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles size={16} className="text-white fill-current" />
          </div>
          <span className={`transition-all duration-300 opacity-100 ${effectiveDesktopOpen ? '' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>
             Holo's DB
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-3 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
        <div className="space-y-1">
           <NavItem id="overview" icon={LayoutDashboard} label="Overview" />
        </div>

        <div className="space-y-1">
           <div className={`px-3 mb-2 text-[10px] font-bold text-gray-400 dark:text-neutral-600 uppercase tracking-widest transition-all duration-300 opacity-100 ${effectiveDesktopOpen ? '' : 'lg:opacity-0 lg:hidden'}`}>
              Workspaces
           </div>
           <NavItem id="shopify" icon={ShoppingBag} label="Shopify Tools" />
           <NavItem id="web" icon={Code2} label="Web Tools" />
           <NavItem id="builder" icon={Layers} label="Menu Builder" />
         
        </div>

        <div className="space-y-1">
        <div className={`px-3 mb-2 text-[10px] font-bold text-gray-400 dark:text-neutral-600 uppercase tracking-widest transition-all duration-300 opacity-100 ${effectiveDesktopOpen ? '' : 'lg:opacity-0 lg:hidden'}`}>
              Testing
           </div>
          <NavItem id="beta" icon={Workflow} label="Shopify workflow" />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
           <div className={`flex items-center gap-3 overflow-hidden ${effectiveDesktopOpen ? '' : 'justify-center'}`}>
              <div className="h-9 w-9 rounded-full bg-accent-600 flex items-center justify-center text-xs text-white font-medium shrink-0 shadow-sm">
                  HD
              </div>
              <div className={`transition-all duration-300 opacity-100 ${effectiveDesktopOpen ? '' : 'lg:opacity-0 lg:hidden lg:w-0'}`}>
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate w-32">Holo Drifter</div>
                  <div className="text-[10px] text-gray-500 dark:text-neutral-500">Administrator</div>
              </div>
           </div>
      </div>
    </aside>
  );
};