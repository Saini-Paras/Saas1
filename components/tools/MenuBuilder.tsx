import React, { useState, useEffect, useRef } from 'react';
import { Layers, Tag, Trash2, Search, Plus, Check, CloudUpload, CornerDownRight, ShoppingBag, LogOut, ChevronRight, ChevronDown, X, Key, Globe, FileText, Link as LinkIcon, GripVertical } from 'lucide-react';
import { Card, Button, Input } from '../Common';
import { NotificationType } from '../../types';

interface Props {
  notify: (msg: string, type?: NotificationType) => void;
}

interface MenuItemData {
  id: string;
  title: string;
  type: 'HTTP' | 'COLLECTION' | 'PAGE';
  url: string;
  resourceId?: string;
  items: MenuItemData[];
}

interface AuthState {
  shop: string;
  token: string;
  isAuthenticated: boolean;
}

interface ResourceItem {
    id: string;
    title: string;
    handle: string;
    type: 'COLLECTION' | 'PAGE';
    productsCount?: number;
}

// --- RECURSIVE COMPONENT ---
interface RecursiveItemProps {
  item: MenuItemData;
  level: number;
  selectedId: string | null;
  editingId: string | null;
  draggedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onUpdate: (id: string, updates: Partial<MenuItemData>) => void;
  onDragStart: (id: string) => void;
  onDrop: (targetId: string) => void;
}

const RecursiveMenuItem: React.FC<RecursiveItemProps> = ({ 
    item, level, selectedId, editingId, draggedId,
    onSelect, onEdit, onDelete, onUpdate, onDragStart, onDrop 
}) => {
  const isSelected = selectedId === item.id;
  const isEditing = editingId === item.id;
  const isDragged = draggedId === item.id;
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasChildren = item.items && item.items.length > 0;
  
  // Icon based on Type
  const TypeIcon = {
      'HTTP': LinkIcon,
      'COLLECTION': Tag,
      'PAGE': FileText
  }[item.type];

  // Colors for the Type Badge
  const badgeColors = {
      'HTTP': 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400',
      'COLLECTION': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'PAGE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  };

  return (
      <div 
        className={`relative transition-all duration-300 ${isDragged ? 'opacity-40' : 'opacity-100'}`}
        draggable
        onDragStart={(e) => {
            e.stopPropagation();
            onDragStart(item.id);
            // Required for Firefox
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', item.id); 
        }}
        onDragOver={(e) => {
            e.preventDefault(); // Allow dropping
            e.stopPropagation();
        }}
        onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDrop(item.id);
        }}
      >
          {/* Main Card */}
          <div 
              onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
              onDoubleClick={(e) => { e.stopPropagation(); onEdit(item.id); }}
              className={`
                  group mb-3 rounded-lg border transition-all select-none overflow-hidden cursor-pointer
                  ${isSelected 
                      ? 'bg-gray-50 dark:bg-neutral-800/60 border-gray-300 dark:border-neutral-600 shadow-sm' 
                      : 'bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700'}
              `}
          >
              {/* Header / Summary Row */}
              <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                      {/* Drag Handle */}
                      <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors text-gray-300 dark:text-neutral-600">
                        <GripVertical size={14} />
                      </div>

                      {/* Collapse Toggle */}
                      <button 
                          onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
                          className={`text-gray-400 hover:text-accent-500 transition-colors p-1 shrink-0 ${!hasChildren ? 'opacity-20 pointer-events-none' : ''}`}
                      >
                          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs shrink-0 ${badgeColors[item.type]}`}>
                          <TypeIcon size={14} />
                      </div>

                      {/* Title Preview */}
                      <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {item.title}
                          </p>
                          {!isEditing && (
                              <p className="text-[10px] text-gray-400 font-mono truncate max-w-[200px]">{item.url}</p>
                          )}
                      </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pl-2 shrink-0">
                       <span className="text-[10px] text-gray-400 font-medium bg-gray-50 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-neutral-700">
                          {level === 0 ? 'Root' : `Lvl ${level}`}
                      </span>
                      <button 
                          onClick={(e) => onDelete(e, item.id)} 
                          className="h-8 w-8 flex items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition"
                          title="Delete Item"
                      >
                          <Trash2 size={14} />
                      </button>
                  </div>
              </div>

              {/* Expanded Edit Form (Only visible when editingId matches) */}
              {isEditing && (
                  <div className="px-3 pb-4 pt-1 border-t border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-900/30 grid gap-4 grid-cols-1 md:grid-cols-2 animate-in slide-in-from-top-2 duration-200 cursor-default" onClick={e => e.stopPropagation()}>
                       {/* Label Input */}
                       <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Label</label>
                            <input 
                                type="text"
                                value={item.title}
                                onChange={(e) => onUpdate(item.id, { title: e.target.value })}
                                className="w-full bg-white dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded px-3 py-2 text-sm focus:border-accent-500 outline-none transition-colors text-gray-900 dark:text-white"
                            />
                       </div>

                       {/* Link Input with Badge */}
                       <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Link</label>
                            <div className="relative">
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeColors[item.type]}`}>
                                        <TypeIcon size={10} />
                                        {item.type}
                                    </div>
                                </div>
                                <input 
                                    type="text"
                                    value={item.url}
                                    onChange={(e) => onUpdate(item.id, { url: e.target.value })}
                                    className="w-full bg-white dark:bg-[#141414] border border-gray-200 dark:border-neutral-800 rounded px-3 py-2 text-sm pl-28 focus:border-accent-500 outline-none transition-colors font-mono text-gray-600 dark:text-gray-300"
                                />
                            </div>
                       </div>
                  </div>
              )}
          </div>

          {/* Nested Children */}
          {!isCollapsed && hasChildren && (
              <div className="pl-6 ml-4 border-l border-gray-200 dark:border-neutral-800 mb-4">
                  {item.items.map(child => (
                      <RecursiveMenuItem 
                        key={child.id} 
                        item={child} 
                        level={level + 1} 
                        selectedId={selectedId}
                        editingId={editingId}
                        draggedId={draggedId}
                        onSelect={onSelect}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                        onDragStart={onDragStart}
                        onDrop={onDrop}
                      />
                  ))}
              </div>
          )}
          
          {/* Drop Zone Visual (Only when selected) */}
          {!isCollapsed && isSelected && !hasChildren && (
              <div className="pl-6 ml-4 border-l border-dashed border-gray-300 dark:border-neutral-700 mb-4 py-2">
                  <div className="text-xs text-gray-500 dark:text-neutral-500 px-3 flex items-center gap-2 opacity-80">
                      <CornerDownRight size={14} />
                      <span className="font-medium">Selected:</span> Click a resource on the left to add as sub-item.
                  </div>
              </div>
          )}
      </div>
  );
};

export const MenuBuilderTool: React.FC<Props> = ({ notify }) => {
  const [authState, setAuthState] = useState<AuthState>({ shop: '', token: '', isAuthenticated: false });
  const [loginForm, setLoginForm] = useState({ shop: '', clientId: '', clientSecret: '', accessToken: '' });
  const [authMode, setAuthMode] = useState<'oauth' | 'token'>('token');
  
  // Data State
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  // Menu State
  const [menuStructure, setMenuStructure] = useState<MenuItemData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<'idle' | 'pushing' | 'success' | 'error'>('idle');

  // --- INITIALIZATION ---
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const storedAuth = localStorage.getItem('shopify_menu_auth');
      const storedCreds = localStorage.getItem('shopify_menu_creds');

      if (storedCreds) setLoginForm(prev => ({ ...prev, ...JSON.parse(storedCreds) }));

      if (code && storedCreds) {
          handleOAuthCallback(code, JSON.parse(storedCreds));
      } else if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          setAuthState({ ...parsed, isAuthenticated: true });
          fetchResources(parsed.shop, parsed.token);
      }
  }, []);

  // --- DRAG & DROP LOGIC ---
  const handleDragStart = (id: string) => {
      setDraggedId(id);
  };

  const handleDrop = (targetId: string) => {
      if (!draggedId || draggedId === targetId) return;

      // Deep clone to avoid mutation issues
      const newStructure = JSON.parse(JSON.stringify(menuStructure));

      // 1. Check if we are trying to drag a parent into its own child (Invalid)
      const isDescendant = (items: MenuItemData[], target: string): boolean => {
          for(const i of items) {
              if (i.id === target) return true;
              if (i.items && isDescendant(i.items, target)) return true;
          }
          return false;
      };

      // Find dragged item to check its children
      let draggedItemData: MenuItemData | null = null;
      const findDragged = (items: MenuItemData[]) => {
          for(const i of items) {
              if (i.id === draggedId) { draggedItemData = i; return; }
              if (i.items) findDragged(i.items);
          }
      };
      findDragged(newStructure);

      if (draggedItemData && isDescendant((draggedItemData as any).items, targetId)) {
          notify("Cannot move a parent into its own child.", "error");
          setDraggedId(null);
          return;
      }

      // 2. Remove dragged item from its current position
      let movedItem: MenuItemData | null = null;
      const remove = (items: MenuItemData[]) => {
          for (let i = 0; i < items.length; i++) {
              if (items[i].id === draggedId) {
                  movedItem = items[i];
                  items.splice(i, 1);
                  return true;
              }
              if (items[i].items && remove(items[i].items)) return true;
          }
          return false;
      };

      if (!remove(newStructure) || !movedItem) {
          setDraggedId(null);
          return;
      }

      // 3. Insert dragged item before the target item
      const insert = (items: MenuItemData[]) => {
          for (let i = 0; i < items.length; i++) {
              if (items[i].id === targetId) {
                  items.splice(i, 0, movedItem!);
                  return true;
              }
              if (items[i].items && insert(items[i].items)) return true;
          }
          return false;
      };

      if (insert(newStructure)) {
          setMenuStructure(newStructure);
          notify("Item reordered.", "success");
      }
      
      setDraggedId(null);
  };


  // --- AUTH LOGIC ---
  const initiateLogin = () => {
      const { shop, clientId, clientSecret, accessToken } = loginForm;
      if (!shop) { notify("Please enter the store URL.", "error"); return; }

      let shopUrl = shop.replace('https://', '').replace(/\/$/, '');
      if (!shopUrl.includes('.myshopify.com')) shopUrl += '.myshopify.com';

      if (authMode === 'token') {
          if (!accessToken) { notify("Please enter the Access Token.", "error"); return; }
          const newAuth = { shop: shopUrl, token: accessToken };
          setAuthState({ ...newAuth, isAuthenticated: true });
          localStorage.setItem('shopify_menu_auth', JSON.stringify(newAuth));
          notify("Connected successfully!", "success");
          fetchResources(shopUrl, accessToken);
          return;
      }

      if (!clientId || !clientSecret) { notify("Please fill in Client ID and Secret.", "error"); return; }

      localStorage.setItem('shopify_menu_creds', JSON.stringify({ shop: shopUrl, clientId, clientSecret }));
      const redirectUri = window.location.origin;
      const scopes = 'read_products,write_content,read_content';
      window.location.href = `https://${shopUrl}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;
  };

  const handleOAuthCallback = async (code: string, creds: any) => {
      setLoading(true);
      const { shop, clientId, clientSecret } = creds;
      try {
          const res = await fetch('/api/oauth_exchange', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ shop, client_id: clientId, client_secret: clientSecret, code })
          });
          const data = await res.json();
          if (data.access_token) {
              const newAuth = { shop, token: data.access_token };
              setAuthState({ ...newAuth, isAuthenticated: true });
              localStorage.setItem('shopify_menu_auth', JSON.stringify(newAuth));
              window.history.replaceState({}, document.title, window.location.pathname);
              notify("Authentication successful!", "success");
              fetchResources(shop, data.access_token);
          } else {
              throw new Error(data.error || "Failed to exchange token");
          }
      } catch (e: any) {
          notify(e.message, "error");
      } finally {
          setLoading(false);
      }
  };

  const logout = () => {
      localStorage.removeItem('shopify_menu_auth');
      setAuthState({ shop: '', token: '', isAuthenticated: false });
      setMenuStructure([]);
      setResources([]);
  };

  // --- API LOGIC ---
  const fetchResources = async (shop: string, token: string) => {
      setLoading(true);
      try {
          // 1. Fetch Collections
          const colRes = await fetch('/api/fetch_collections', {
              method: 'POST',
              headers: { 'x-shopify-shop': shop, 'x-shopify-token': token }
          });
          const colData = await colRes.json();
          
          // 2. Fetch Pages
          const pageRes = await fetch('/api/fetch_pages', {
            method: 'POST',
            headers: { 'x-shopify-shop': shop, 'x-shopify-token': token }
          });
          const pageData = await pageRes.json();

          // Merge
          const merged: ResourceItem[] = [
              ...(Array.isArray(colData) ? colData.map((c: any) => ({ ...c, type: 'COLLECTION' })) : []),
              ...(Array.isArray(pageData) ? pageData.map((p: any) => ({ ...p, type: 'PAGE' })) : [])
          ];
          
          setResources(merged);
      } catch (e: any) {
          notify(`Failed to fetch resources: ${e.message}`, "error");
      } finally {
          setLoading(false);
      }
  };

  const pushToShopify = async () => {
      if (menuStructure.length === 0) return;
      setPushStatus('pushing');
      try {
          const res = await fetch('/api/create_menu', {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'x-shopify-shop': authState.shop,
                  'x-shopify-token': authState.token
              },
              body: JSON.stringify({
                  title: "Mega Menu (From App)",
                  handle: "mega-menu-app-" + Date.now(),
                  items: menuStructure
              })
          });
          const data = await res.json();
          const errors = data.menuCreate ? data.menuCreate.userErrors : data.userErrors;
          if (errors && errors.length > 0) {
              notify(`Error: ${errors[0].message}`, "error");
              setPushStatus('error');
              return;
          }
          setPushStatus('success');
          notify("Menu created successfully in Shopify!", "success");
          setTimeout(() => setPushStatus('idle'), 3000);
      } catch (e: any) {
          notify(`System Error: ${e.message}`, "error");
          setPushStatus('error');
      }
  };

  // --- DATA MANIPULATION ---
  const modifyItem = (items: MenuItemData[], targetId: string, action: (item: MenuItemData) => MenuItemData | null): MenuItemData[] => {
      return items.map(item => {
          if (item.id === targetId) {
              return action(item);
          }
          if (item.items && item.items.length > 0) {
              // @ts-ignore
              return { ...item, items: modifyItem(item.items, targetId, action) };
          }
          return item;
      }).filter((item): item is MenuItemData => item !== null);
  };

  const handleUpdateItem = (id: string, updates: Partial<MenuItemData>) => {
      const updated = modifyItem(menuStructure, id, (node) => ({
          ...node,
          ...updates
      }));
      setMenuStructure(updated);
  };

  const addMainGroup = () => {
      const newId = Date.now().toString();
      setMenuStructure([...menuStructure, {
          id: newId,
          title: "New Group",
          type: 'HTTP',
          url: '#',
          items: []
      }]);
      setSelectedId(newId);
      setEditingId(null);
  };

  const addResourceToSelection = (resource: ResourceItem) => {
      if (!selectedId) {
          notify("Please select a Group or Item on the right first!", "error");
          return;
      }

      const urlPrefix = resource.type === 'COLLECTION' ? '/collections/' : '/pages/';

      const newItem: MenuItemData = {
          id: Date.now().toString() + Math.random().toString(),
          title: resource.title,
          type: resource.type,
          resourceId: resource.id,
          url: `${urlPrefix}${resource.handle}`,
          items: []
      };

      const updated = modifyItem(menuStructure, selectedId, (node) => {
          return { ...node, items: [...(node.items || []), newItem] };
      });
      
      setMenuStructure(updated);
  };

  const deleteItem = (e: React.MouseEvent, targetId: string) => {
      e.stopPropagation();
      const recursiveDelete = (nodes: MenuItemData[]): MenuItemData[] => {
          return nodes.filter(node => node.id !== targetId).map(node => ({
              ...node,
              items: recursiveDelete(node.items || [])
          }));
      };
      setMenuStructure(recursiveDelete(menuStructure));
      if (selectedId === targetId) setSelectedId(null);
      if (editingId === targetId) setEditingId(null);
  };

  // --- RENDER LOGIN ---
  if (!authState.isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in slide-in-from-bottom-4">
            <Card className="w-full max-w-lg p-8 border-t-4 border-t-accent-500">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-accent-50 dark:bg-accent-900/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag size={32} className="text-accent-600 dark:text-accent-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shopify Connect</h2>
                    <p className="text-sm text-gray-500 dark:text-neutral-500 mt-2">Connect your store to start building menus.</p>
                </div>
                
                {/* Auth Mode Toggle */}
                <div className="flex bg-gray-100 dark:bg-neutral-900 p-1 rounded-lg mb-6">
                    <button
                        onClick={() => setAuthMode('token')}
                        className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${authMode === 'token' ? 'bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500'}`}
                    >
                        Access Token
                    </button>
                    <button
                        onClick={() => setAuthMode('oauth')}
                        className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${authMode === 'oauth' ? 'bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500'}`}
                    >
                        OAuth (Legacy)
                    </button>
                </div>

                <div className="space-y-4">
                    <Input 
                        placeholder="my-store.myshopify.com" 
                        value={loginForm.shop}
                        onChange={e => setLoginForm({...loginForm, shop: e.target.value})}
                        label="Store URL"
                        icon={Globe}
                    />

                     {authMode === 'token' ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <Input 
                                type="password"
                                placeholder="shpat_xxxxxxxxxxxxxxxx" 
                                value={loginForm.accessToken}
                                onChange={e => setLoginForm({...loginForm, accessToken: e.target.value})}
                                label="Admin API Access Token"
                                icon={Key}
                            />
                            <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-2">
                                Generated in Shopify Admin &rarr; Settings &rarr; Apps &rarr; Develop apps.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            <Input 
                                placeholder="Provided by Shopify App Setup" 
                                value={loginForm.clientId}
                                onChange={e => setLoginForm({...loginForm, clientId: e.target.value})}
                                label="Client ID"
                            />
                            <Input 
                                type="password"
                                placeholder="Client Secret" 
                                value={loginForm.clientSecret}
                                onChange={e => setLoginForm({...loginForm, clientSecret: e.target.value})}
                                label="Client Secret"
                            />
                        </div>
                    )}

                    <Button onClick={initiateLogin} className="w-full mt-6" disabled={loading}>
                        {loading ? 'Connecting...' : (authMode === 'oauth' ? 'Authorize App' : 'Connect Store')}
                    </Button>
                </div>
            </Card>
        </div>
      );
  }

  // --- RENDER BUILDER ---
  const lowerSearch = search.toLowerCase();
  const filteredResources = resources.filter(r => 
      r.title.toLowerCase().includes(lowerSearch) || 
      (r.handle && r.handle.toLowerCase().includes(lowerSearch))
  );

  return (
      <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-in fade-in pb-6 relative">
          
          {/* Left Panel: Resources (Collections & Pages) */}
          <Card className="w-full md:w-80 flex flex-col p-0 overflow-hidden shrink-0 h-80 md:h-full">
              <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#1e1e1e]">
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                         <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center text-green-700 dark:text-green-400 shrink-0">
                            <ShoppingBag size={16} />
                         </div>
                         <div className="min-w-0 overflow-hidden">
                            <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider truncate">Store Resources</h2>
                            <span className="text-[10px] text-gray-500 dark:text-neutral-500 truncate block">{authState.shop}</span>
                         </div>
                      </div>
                      <Button variant="secondary" onClick={logout} className="h-7 px-2 text-xs gap-1.5 shrink-0 bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 ml-2">
                         <LogOut size={12} />
                      </Button>
                  </div>
                  <Input 
                      placeholder="Search pages, collections..." 
                      value={search} 
                      onChange={e => setSearch(e.target.value)}
                      icon={Search}
                      className="bg-transparent dark:bg-transparent"
                  />
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {loading && <div className="text-center p-4 text-xs text-gray-400">Loading resources...</div>}
                  
                  {!loading && filteredResources.map(r => (
                      <div key={r.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#252525] rounded-md transition cursor-default border border-transparent hover:border-gray-200 dark:hover:border-neutral-700">
                          <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-2 mb-0.5">
                                  {r.type === 'PAGE' 
                                    ? <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-1 rounded uppercase font-bold tracking-wide">Page</span>
                                    : <span className="text-[9px] bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-1 rounded uppercase font-bold tracking-wide">Col</span>
                                  }
                                  <p className="font-medium text-gray-700 dark:text-neutral-300 text-sm truncate">{r.title}</p>
                              </div>
                              <p className="text-[10px] text-gray-500/50 truncate max-w-[150px] font-mono">{r.handle}</p>
                          </div>
                          <button 
                              onClick={() => addResourceToSelection(r)}
                              className="h-7 w-7 rounded bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 hover:bg-accent-600 hover:text-white dark:hover:bg-accent-600 dark:hover:text-white transition flex items-center justify-center shrink-0"
                              title="Add to selected parent"
                          >
                              <Plus size={14} />
                          </button>
                      </div>
                  ))}
              </div>
          </Card>

          {/* Right Panel: Builder Tree */}
          <div className="flex-1 flex flex-col gap-4 min-h-0 h-full">
               {/* Toolbar */}
              <Card className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                  <div>
                      <h2 className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-wider mb-1">Menu Structure</h2>
                      <p className="text-xs text-gray-400">Double-click items to edit label/link. Drag to reorder.</p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                      <Button variant="secondary" onClick={addMainGroup} className="text-xs h-9 flex-1 md:flex-none">
                          <Layers size={14} /> Add Main Group
                      </Button>
                      <Button 
                          onClick={pushToShopify} 
                          disabled={pushStatus === 'pushing' || menuStructure.length === 0}
                          className={`text-xs h-9 min-w-[140px] flex-1 md:flex-none ${pushStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      >
                          {pushStatus === 'pushing' ? 'Pushing...' : pushStatus === 'success' ? 'Created!' : 'Push to Shopify'}
                          {pushStatus === 'success' ? <Check size={14} /> : <CloudUpload size={14} />}
                      </Button>
                  </div>
              </Card>

              {/* Tree View */}
              <Card className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50 dark:bg-[#141414]/50">
                  {menuStructure.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-neutral-600 opacity-60 border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-xl m-4">
                          <Layers size={48} className="mb-4 opacity-50" />
                          <p className="text-lg font-medium">Menu is empty</p>
                          <p className="text-sm">Click "Add Main Group" to start building</p>
                      </div>
                  ) : (
                      <div className="space-y-4 max-w-4xl mx-auto pb-20">
                          {menuStructure.map((item) => (
                              <RecursiveMenuItem 
                                key={item.id} 
                                item={item} 
                                level={0} 
                                selectedId={selectedId}
                                editingId={editingId}
                                draggedId={draggedId}
                                onSelect={(id) => { setSelectedId(id); setEditingId(null); }}
                                onEdit={(id) => { setEditingId(id); setSelectedId(id); }}
                                onDelete={deleteItem}
                                onUpdate={handleUpdateItem}
                                onDragStart={handleDragStart}
                                onDrop={handleDrop}
                              />
                          ))}
                      </div>
                  )}
              </Card>
          </div>
      </div>
  );
};