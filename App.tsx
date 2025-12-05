import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Upload, 
  FileJson, 
  Database,
  Link as LinkIcon,
  Menu,
  ChevronRight,
  Sparkles,
  Moon,
  Sun,
  Code2,
  Type,
  Scaling,
  FileArchive,
} from 'lucide-react';
import { loadScript } from './utils';
import { Tool, ToolId, Notification, ToolCategory } from './types';

// Components
import { Toast } from './components/Toast';
import { TagAutomationTool } from './components/tools/TagAutomation';
import { JsonCreatorTool } from './components/tools/JsonCreator';
import { ImporterTool } from './components/tools/Importer';
import { CollectionExtractorTool } from './components/tools/Extractor';
import { ClassyPrefixerTool } from './components/tools/ClassyPrefixer';
import { RemToPxTool } from './components/tools/RemToPx';
import { ShopifyScraperTool } from './components/tools/ShopifyScraper';

const App = () => {
  // Navigation State
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("overview");
  const [activeToolId, setActiveToolId] = useState<ToolId | null>(null);
  
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        if (saved) return saved as 'light' | 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Default to dark if unknown
  });

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Set Favicon
  useEffect(() => {
    const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'shortcut icon';
    // Use a terminal/command prompt style icon
    link.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${theme === 'dark' ? 'white' : 'black'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`;
    document.getElementsByTagName('head')[0].appendChild(link);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    // Load external libs required for Tag Automation
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

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type, id: Date.now() });
  };

  // --- Tool Definitions ---
  const tools: Tool[] = [
    // Shopify Tools
    { 
        id: "tag-automation", 
        label: "Tag Automation", 
        icon: <Database size={18} />, 
        description: "Auto-tag products via CSV & ZIP processing.",
        category: "shopify"
    },
    { 
        id: "json-creator", 
        label: "JSON Creator", 
        icon: <FileJson size={18} />, 
        description: "Build Smart Collection JSONs visually.",
        category: "shopify"
    },
    { 
        id: "importer", 
        label: "Collection Importer", 
        icon: <Upload size={18} />, 
        description: "Bulk upload collections via API.",
        category: "shopify"
    },
    { 
        id: "extractor", 
        label: "Collection Extractor", 
        icon: <LinkIcon size={18} />, 
        description: "Scrape public collection data.",
        category: "shopify"
    },
    {
        id: "shopify-scraper",
        label: "Shopify Bulk Scraper",
        icon: <FileArchive size={18} />,
        description: "Download products from multiple collections.",
        category: "shopify"
    },
    // Web Tools
    {
        id: "classy-prefixer",
        label: "Classy Prefixer",
        icon: <Type size={18} />,
        description: "Intelligent HTML class prefixer.",
        category: "web"
    },
    {
        id: "rem-to-px",
        label: "Rem to Px",
        icon: <Scaling size={18} />,
        description: "Convert CSS units instantly.",
        category: "web"
    }
  ];

  // --- Handlers ---
  const handleToolSelect = (toolId: ToolId) => {
    const tool = tools.find(t => t.id === toolId);
    if (tool) {
        setActiveCategory(tool.category);
        setActiveToolId(toolId);
    }
  };

  const handleCategorySelect = (category: ToolCategory) => {
      setActiveCategory(category);
      // If switching to a tool category, select the first tool by default if none selected
      if (category !== 'overview') {
          const firstTool = tools.find(t => t.category === category);
          if (firstTool && (!activeToolId || tools.find(t => t.id === activeToolId)?.category !== category)) {
              setActiveToolId(firstTool.id);
          }
      } else {
          setActiveToolId(null);
      }
  };

  // --- Content Renderers ---
  const renderTool = (id: ToolId) => {
      switch(id) {
          case 'tag-automation': return <TagAutomationTool libsLoaded={libsLoaded} notify={notify} />;
          case 'json-creator': return <JsonCreatorTool notify={notify} />;
          case 'importer': return <ImporterTool notify={notify} />;
          case 'extractor': return <CollectionExtractorTool notify={notify} />;
          case 'shopify-scraper': return <ShopifyScraperTool notify={notify} libsLoaded={libsLoaded} />;
          case 'classy-prefixer': return <ClassyPrefixerTool notify={notify} />;
          case 'rem-to-px': return <RemToPxTool notify={notify} />;
          default: return null;
      }
  };

  const renderContent = () => {
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

    // Category View (Tabs)
    const categoryTools = tools.filter(t => t.category === activeCategory);
    
    return (
        <div className="w-full mx-auto flex flex-col pb-20">
            <div className="mb-6 flex flex-col shrink-0 gap-4">
                <div>
                    <h2 className="text-[45px] leading-tight font-semibold text-gray-900 dark:text-white tracking-tight">
                        {activeCategory === 'shopify' ? 'Shopify Tools' : 'Web Dev Tools'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                        {activeCategory === 'shopify' ? 'Manage products, collections, and store data.' : 'Utilities for frontend development and HTML processing.'}
                    </p>
                </div>
                
                {/* Tabs - Moved below Heading */}
                <div className="flex p-1 bg-gray-100 dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-neutral-800 overflow-x-auto self-start custom-scrollbar max-w-full">
                    {categoryTools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveToolId(tool.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap
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
            </div>

            <div className="flex-1 overflow-visible">
                 {activeToolId && renderTool(activeToolId)}
            </div>
        </div>
    );
  };

  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-[#141414] overflow-hidden transition-colors duration-300 font-sans">
      
      {/* Notifications */}
      {notification && (
        <Toast 
          key={notification.id}
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 h-full
        bg-white dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-neutral-800
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-[72px] lg:hover:w-64'}
        flex flex-col group/sidebar z-50 shadow-xl lg:shadow-none
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-neutral-800 overflow-hidden whitespace-nowrap shrink-0">
          <div className="flex items-center gap-3 font-semibold text-gray-900 dark:text-white tracking-tight">
            <div className="w-8 h-8 bg-accent-600 rounded-md flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles size={16} className="text-white fill-current" />
            </div>
            <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'lg:opacity-0 lg:group-hover/sidebar:opacity-100'}`}>
               Holo's DB
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="p-3 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          <div className="space-y-1">
             <button
               onClick={() => handleCategorySelect('overview')}
               className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 border border-transparent
                 ${activeCategory === 'overview' 
                   ? 'bg-gray-100 dark:bg-[#2a2a2a] text-accent-600 dark:text-white border-gray-200 dark:border-neutral-700' 
                   : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#252525]'}
               `}
               title="Dashboard"
             >
               <LayoutDashboard size={20} className={`shrink-0 ${activeCategory === 'overview' ? 'text-accent-600 dark:text-white' : ''}`} />
               <span className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'lg:opacity-0 lg:group-hover/sidebar:opacity-100'}`}>
                 Overview
               </span>
             </button>
          </div>

          <div className="space-y-1">
             <div className={`px-3 mb-2 text-[10px] font-bold text-gray-400 dark:text-neutral-600 uppercase tracking-widest transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'lg:opacity-0 lg:group-hover/sidebar:opacity-100'}`}>
                Workspaces
             </div>

             <button
               onClick={() => handleCategorySelect('shopify')}
               className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 border border-transparent
                 ${activeCategory === 'shopify' 
                   ? 'bg-gray-100 dark:bg-[#2a2a2a] text-accent-600 dark:text-white border-gray-200 dark:border-neutral-700' 
                   : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#252525]'}
               `}
             >
               <ShoppingBag size={20} className={`shrink-0 ${activeCategory === 'shopify' ? 'text-accent-600 dark:text-white' : ''}`} />
               <span className={`whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'lg:opacity-0 lg:group-hover/sidebar:opacity-100'}`}>
                 Shopify Tools
               </span>
             </button>

             <button
               onClick={() => handleCategorySelect('web')}
               className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 border border-transparent
                 ${activeCategory === 'web' 
                   ? 'bg-gray-100 dark:bg-[#2a2a2a] text-accent-600 dark:text-white border-gray-200 dark:border-neutral-700' 
                   : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#252525]'}
               `}
             >
               <Code2 size={20} className={`shrink-0 ${activeCategory === 'web' ? 'text-accent-600 dark:text-white' : ''}`} />
               <span className={`whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'lg:opacity-0 lg:group-hover/sidebar:opacity-100'}`}>
                 Web Tools
               </span>
             </button>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
             <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-9 w-9 rounded-full bg-accent-600 flex items-center justify-center text-xs text-white font-medium shrink-0 shadow-sm">
                    HD
                </div>
                <div className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'lg:opacity-0 lg:group-hover/sidebar:opacity-100'}`}>
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate w-32">Holo Drifter</div>
                    <div className="text-[10px] text-gray-500 dark:text-neutral-500">Administrator</div>
                </div>
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)} 
                className="text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white lg:hidden"
             >
               <Menu size={20} />
             </button>
             <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-500">
               <span className="hidden md:inline">Dashboard</span>
               <span className="text-gray-300 dark:text-neutral-700">/</span>
               <span className="text-gray-900 dark:text-white font-medium capitalize">
                   {activeCategory === 'overview' ? 'Overview' : activeCategory + ' Tools'}
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

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;