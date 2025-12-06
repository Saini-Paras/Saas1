import React, { useState, useEffect, useRef } from 'react';
import { Layers, Tag, Trash2, Search, Plus, Check, CloudUpload, CornerDownRight, AlertCircle, ShoppingBag, LogOut, ChevronRight, ChevronDown, X } from 'lucide-react';
import { Card, Button, Input } from '../Common';
import { NotificationType } from '../../types';

interface Props {
  notify: (msg: string, type?: NotificationType) => void;
}

interface MenuItemData {
  id: string;
  title: string;
  type: 'HTTP' | 'COLLECTION';
  url: string;
  resourceId?: string;
  items: MenuItemData[];
}

interface AuthState {
  shop: string;
  token: string;
  isAuthenticated: boolean;
}

// --- RECURSIVE COMPONENT ---
interface RecursiveItemProps {
  item: MenuItemData;
  level: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const RecursiveMenuItem: React.FC<RecursiveItemProps> = ({ item, level, selectedId, onSelect, onDelete }) => {
  const isSelected = selectedId === item.id;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasChildren = item.items && item.items.length > 0;
  
  return (
      <div className="relative">
          <div 
              onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
              className={`
                  group flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer border transition-all select-none
                  ${isSelected 
                      ? 'bg-accent-50/50 border-accent-500 shadow-sm ring-1 ring-accent-500 dark:bg-accent-900/20 dark:border-accent-500' 
                      : 'bg-white border-gray-200 hover:border-accent-300 dark:bg-[#1e1e1e] dark:border-neutral-800 dark:hover:border-accent-500/50'}
              `}
          >
              <div className="flex items-center gap-3">
                  {/* Collapse Toggle */}
                  {hasChildren ? (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
                        className="text-gray-400 hover:text-accent-500 transition-colors p-1"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </button>
                  ) : (
                    <div className="w-[22px]" /> // Spacer
                  )}

                  <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs shadow-sm shrink-0
                      ${item.type === 'HTTP' 
                          ? 'bg-gray-800 text-white dark:bg-neutral-700' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}
                  >
                      {item.type === 'HTTP' ? <Layers size={14} /> : <Tag size={14} />}
                  </div>
                  <div className="min-w-0">
                      <p className={`font-medium text-sm truncate ${isSelected ? 'text-accent-700 dark:text-accent-400' : 'text-gray-700 dark:text-neutral-200'}`}>
                          {item.title}
                      </p>
                  </div>
              </div>
              
              <div className="flex items-center gap-2 pl-2">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mr-2 hidden sm:block whitespace-nowrap">
                      {level === 0 ? 'Header' : `Level ${level}`}
                  </span>
                  <button 
                      onClick={(e) => onDelete(e, item.id)} 
                      className="h-7 w-7 flex items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition shrink-0"
                  >
                      <Trash2 size={14} />
                  </button>
              </div>
          </div>

          {/* Nested Children */}
          {!isCollapsed && hasChildren && (
              <div className="pl-6 ml-4 border-l border-gray-200 dark:border-neutral-800 mb-2">
                  {item.items.map(child => (
                      <RecursiveMenuItem 
                        key={child.id} 
                        item={child} 
                        level={level + 1} 
                        selectedId={selectedId}
                        onSelect={onSelect}
                        onDelete={onDelete}
                      />
                  ))}
              </div>
          )}
          
          {/* Drop Zone Visual */}
          {!isCollapsed && isSelected && !hasChildren && (
              <div className="pl-6 ml-4 border-l border-dashed border-accent-200 dark:border-accent-900 mb-2 py-1">
                  <div className="text-xs text-accent-500 dark:text-accent-400 px-2 flex items-center gap-2 opacity-80">
                      <CornerDownRight size={14} />
                      Add sub-items from the list...
                  </div>
              </div>
          )}
      </div>
  );
};

export const MenuBuilderTool: React.FC<Props> = ({ notify }) => {
  const [authState, setAuthState] = useState<AuthState>({ shop: '', token: '', isAuthenticated: false });
  const [loginForm, setLoginForm] = useState({ shop: '', clientId: '', clientSecret: '' });
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  const [menuStructure, setMenuStructure] = useState<MenuItemData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null); 
  const [pushStatus, setPushStatus] = useState<'idle' | 'pushing' | 'success' | 'error'>('idle');

  // Modal State
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const groupInputRef = useRef<HTMLInputElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const storedAuth = localStorage.getItem('shopify_menu_auth');
      const storedCreds = localStorage.getItem('shopify_menu_creds');

      if (storedCreds) setLoginForm(JSON.parse(storedCreds));

      if (code && storedCreds) {
          handleOAuthCallback(code, JSON.parse(storedCreds));
      } else if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          setAuthState({ ...parsed, isAuthenticated: true });
          fetchCollections(parsed.shop, parsed.token);
      }
  }, []);

  // --- FOCUS MODAL INPUT ---
  useEffect(() => {
      if (isGroupModalOpen && groupInputRef.current) {
          setTimeout(() => groupInputRef.current?.focus(), 50);
      }
  }, [isGroupModalOpen]);

  // --- AUTH LOGIC ---
  const initiateLogin = () => {
      const { shop, clientId, clientSecret } = loginForm;
      if (!shop || !clientId || !clientSecret) {
          notify("Please fill in all fields.", "error");
          return;
      }
      let shopUrl = shop.replace('https://', '').replace(/\/$/, '');
      if (!shopUrl.includes('.myshopify.com')) shopUrl += '.myshopify.com';

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
              fetchCollections(shop, data.access_token);
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
      setCollections([]);
  };

  // --- API LOGIC ---
  const fetchCollections = async (shop: string, token: string) => {
      setLoading(true);
      try {
          const res = await fetch('/api/fetch_collections', {
              method: 'POST',
              headers: { 'x-shopify-shop': shop, 'x-shopify-token': token }
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          setCollections(data);
      } catch (e: any) {
          notify(`Failed to fetch collections: ${e.message}`, "error");
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

  // --- NESTING LOGIC ---
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

  const openGroupModal = () => {
      setNewGroupName("");
      setIsGroupModalOpen(true);
  };

  const confirmAddGroup = () => {
      if (!newGroupName.trim()) return;
      
      const newId = Date.now().toString();
      setMenuStructure([...menuStructure, {
          id: newId,
          title: newGroupName,
          type: 'HTTP',
          url: '#',
          items: []
      }]);
      setSelectedId(newId);
      setIsGroupModalOpen(false);
  };

  const handleGroupInputKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          confirmAddGroup();
      } else if (e.key === 'Escape') {
          setIsGroupModalOpen(false);
      }
  };

  const addCollectionToSelection = (collection: any) => {
      if (!selectedId) {
          notify("Please select a Group or Item on the right first!", "error");
          return;
      }

      const newItem: MenuItemData = {
          id: Date.now().toString() + Math.random().toString(),
          title: collection.title,
          type: 'COLLECTION',
          resourceId: collection.id,
          url: `/collections/${collection.handle}`,
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
  };

  // --- RENDER LOGIN ---
  if (!authState.isAuthenticated) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in slide-in-from-bottom-4">
            <Card className="w-full p-8 border-t-4 border-t-accent-500">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-accent-50 dark:bg-accent-900/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag size={32} className="text-accent-600 dark:text-accent-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shopify Connect</h2>
                    <p className="text-sm text-gray-500 dark:text-neutral-500 mt-2">
                        Connect your store to start building menus.
                    </p>
                </div>
                
                <div className="space-y-4">
                    <Input 
                        placeholder="my-store.myshopify.com" 
                        value={loginForm.shop}
                        onChange={e => setLoginForm({...loginForm, shop: e.target.value})}
                        label="Store URL"
                    />
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
                    <Button onClick={initiateLogin} className="w-full mt-4" disabled={loading}>
                        {loading ? 'Connecting...' : 'Authorize App'}
                    </Button>
                </div>
                <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-100 dark:border-yellow-900/30 rounded text-xs text-yellow-700 dark:text-yellow-500 flex gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <p>Requires a Custom App created in Shopify Admin with `read_products` and `write_content` scopes.</p>
                </div>
            </Card>
        </div>
      );
  }

  // --- RENDER BUILDER ---
  const filteredCollections = collections.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
      <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-in fade-in pb-6 relative">
          
          {/* Group Name Modal Overlay */}
          {isGroupModalOpen && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
                  <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-lg shadow-xl w-full max-w-sm border border-gray-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Add Menu Group</h3>
                          <button onClick={() => setIsGroupModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                              <X size={18} />
                          </button>
                      </div>
                      <Input 
                          ref={groupInputRef}
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          onKeyDown={handleGroupInputKeyDown}
                          placeholder="e.g. Men, Summer Sale"
                          label="Group Name"
                          className="mb-4"
                      />
                      <div className="flex gap-3 justify-end">
                          <Button variant="ghost" onClick={() => setIsGroupModalOpen(false)}>Cancel</Button>
                          <Button onClick={confirmAddGroup}>Create Group</Button>
                      </div>
                  </div>
              </div>
          )}

          {/* Left Panel: Collections */}
          <Card className="w-full md:w-80 flex flex-col p-0 overflow-hidden shrink-0 h-80 md:h-full">
              <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#1e1e1e]">
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                         <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center text-green-700 dark:text-green-400 shrink-0">
                            <ShoppingBag size={16} />
                         </div>
                         <div className="min-w-0 overflow-hidden">
                            <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider truncate">Deep Menu Builder</h2>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0"></div>
                                <span className="text-[10px] text-gray-500 dark:text-neutral-500 truncate block" title={authState.shop}>{authState.shop}</span>
                            </div>
                         </div>
                      </div>
                      <Button variant="secondary" onClick={logout} className="h-7 px-2 text-xs gap-1.5 shrink-0 bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 ml-2">
                         <LogOut size={12} /> Logout
                      </Button>
                  </div>
                  <Input 
                      placeholder="Search collections..." 
                      value={search} 
                      onChange={e => setSearch(e.target.value)}
                      icon={Search}
                      className="bg-transparent dark:bg-transparent"
                  />
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {loading && <div className="text-center p-4 text-xs text-gray-400">Loading collections...</div>}
                  {!loading && filteredCollections.length === 0 && <div className="text-center p-4 text-xs text-gray-400">No collections found.</div>}
                  
                  {filteredCollections.map(c => (
                      <div key={c.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#252525] rounded-md transition cursor-default border border-transparent hover:border-gray-200 dark:hover:border-neutral-700">
                          <div className="min-w-0 pr-2">
                              <p className="font-medium text-gray-700 dark:text-neutral-300 text-sm truncate">{c.title}</p>
                              <p className="text-[10px] text-gray-400">{c.productsCount} products</p>
                          </div>
                          <button 
                              onClick={() => addCollectionToSelection(c)}
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
                      <h2 className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-wider mb-1">2. Menu Structure</h2>
                      <p className="text-xs text-gray-400">Select an item below to nest collections under it.</p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                      <Button variant="secondary" onClick={openGroupModal} className="text-xs h-9 flex-1 md:flex-none">
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
                      <div className="space-y-4 max-w-4xl mx-auto">
                          {menuStructure.map((item) => (
                              <RecursiveMenuItem 
                                key={item.id} 
                                item={item} 
                                level={0} 
                                selectedId={selectedId}
                                onSelect={(id) => setSelectedId(id)}
                                onDelete={deleteItem}
                              />
                          ))}
                      </div>
                  )}
              </Card>
          </div>
      </div>
  );
};