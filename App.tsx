import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { loadScript } from './utils';
import { ToolId, Notification, ToolCategory } from './types';
import { Toast } from './components/Toast';
import { tools, categoryTitles } from './config/tools';
import { ToolRenderer } from './components/ToolRenderer';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

const App = () => {
  // --- State ---
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("overview");
  const [activeToolId, setActiveToolId] = useState<ToolId | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [isSidebarHovered, setSidebarHovered] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        if (saved) return saved as 'light' | 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // --- Effects ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'shortcut icon';
    link.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${theme === 'dark' ? 'white' : 'black'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`;
    document.getElementsByTagName('head')[0].appendChild(link);
  }, [theme]);

  useEffect(() => {
    const loadLibs = async () => {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
        setLibsLoaded(true);
      } catch (e) {
        console.error("Failed to load libraries", e);
      }
    };
    loadLibs();
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  // --- Handlers ---
  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type, id: Date.now() });
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleToolSelect = (toolId: ToolId) => {
    const tool = tools.find(t => t.id === toolId);
    if (tool) {
        setActiveCategory(tool.category);
        setActiveToolId(toolId);
    }
  };

  const handleCategorySelect = (category: ToolCategory) => {
      setActiveCategory(category);
      if (category === 'builder') {
          setActiveToolId('menu-builder');
      } 
      else if (category !== 'overview') {
          const firstTool = tools.find(t => t.category === category);
          if (firstTool && (!activeToolId || tools.find(t => t.id === activeToolId)?.category !== category)) {
              setActiveToolId(firstTool.id);
          }
      } else {
          setActiveToolId(null);
      }
  };

  // --- Render Helpers ---
  const renderContent = () => {
    // 1. Overview Dashboard
    if (activeCategory === 'overview') {
        return (
           <div className="w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
              <div className="mb-10 text-center md:text-left">
                  <h2 className="text-[45px] leading-tight font-semibold text-gray-900 dark:text-white mb-3 tracking-tight">Welcome back, Holo Drifter.</h2>
                  <p className="text-gray-500 dark:text-neutral-400 max-w-2xl">
                      Your personal command center is ready. Select a tool to begin managing your operations.
                  </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tools.map((tool) => (
                      <button 
                        key={tool.id}
                        onClick={() => handleToolSelect(tool.id)}
                        className="group bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-neutral-800 hover:border-accent-500 dark:hover:border-accent-500 p-6 rounded-md text-left transition-all hover:bg-white dark:hover:bg-[#1e1e1e] shadow-sm hover:shadow-md flex flex-col justify-between h-40"
                      >
                         <div className="flex justify-between items-start">
                             <div className="p-2.5 bg-gray-50 dark:bg-[#252525] group-hover:bg-accent-500/10 dark:group-hover:bg-accent-500/10 rounded-md text-gray-700 dark:text-gray-300 group-hover:text-accent-600 dark:group-hover:text-accent-500 transition-colors border border-gray-100 dark:border-neutral-700 group-hover:border-accent-200 dark:group-hover:border-accent-500/20">
                                 {tool.icon}
                             </div>
                             <ChevronRight className="text-gray-300 dark:text-neutral-600 group-hover:text-accent-500 dark:group-hover:text-white transition-colors" size={18} />
                         </div>
                         <div>
                             <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-accent-600 dark:group-hover:text-accent-500 transition-colors">{tool.label}</h3>
                             <p className="text-xs text-gray-500 dark:text-neutral-500">{tool.description}</p>
                         </div>
                      </button>
                  ))}
              </div>
           </div>
        );
    }

    // 2. Tool View
    const categoryTools = tools.filter(t => t.category === activeCategory);
    
    return (
        <div className="w-full mx-auto flex flex-col pb-20">
            <div className="mb-6 flex flex-col shrink-0 gap-4">
                <div>
                    <h2 className="text-[45px] leading-tight font-semibold text-gray-900 dark:text-white tracking-tight">
                        {categoryTitles[activeCategory] || 'Tools'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                        {activeCategory === 'shopify' ? 'Manage products, collections, and store data.' : 
                         activeCategory === 'web' ? 'Utilities for frontend development and HTML processing.' :
                         'Deeply nested menu construction for Shopify.'}
                    </p>
                </div>
                
                {categoryTools.length > 1 && (
                    <div className="flex p-1 bg-gray-100 dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-neutral-800 overflow-x-auto self-start custom-scrollbar max-w-full w-full shrink-0">
                        {categoryTools.map(tool => (
                            <button
                                key={tool.id}
                                onClick={() => setActiveToolId(tool.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap shrink-0
                                    ${activeToolId === tool.id 
                                        ? 'bg-white dark:bg-[#333] text-accent-600 dark:text-white shadow-sm' 
                                        : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'}
                                `}
                            >
                                {tool.icon}
                                {tool.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-visible">
                 <ToolRenderer activeToolId={activeToolId} notify={notify} libsLoaded={libsLoaded} />
            </div>
        </div>
    );
  };

  const effectiveDesktopOpen = isDesktopSidebarOpen || isSidebarHovered;

  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-[#141414] overflow-hidden transition-colors duration-300 font-sans">
      {notification && (
        <Toast key={notification.id} message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar 
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
        isSidebarOpen={isSidebarOpen}
        effectiveDesktopOpen={effectiveDesktopOpen}
        setSidebarHovered={setSidebarHovered}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Header 
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isDesktopSidebarOpen={isDesktopSidebarOpen}
          setDesktopSidebarOpen={setDesktopSidebarOpen}
          activeCategory={activeCategory}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;