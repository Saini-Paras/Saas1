import React, { useState, useEffect } from 'react';
import { Search, Globe, Link, Loader2, AlertCircle, ExternalLink, Type, Hash, FileCode, FileText } from 'lucide-react';
import { Card, Button, Input } from '../Common';
import { copyToClipboard } from '../../utils';
import { ExtractedCollection, NotificationType } from '../../types';

interface Props {
  notify: (msg: string, type?: NotificationType) => void;
}

export const CollectionExtractorTool: React.FC<Props> = ({ notify }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Initialize from localStorage
  const [collections, setCollections] = useState<ExtractedCollection[]>(() => {
    try {
      const saved = localStorage.getItem('extracted_collections');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // 2. Save to localStorage whenever collections change
  useEffect(() => {
    localStorage.setItem('extracted_collections', JSON.stringify(collections));
  }, [collections]);

  const handleExtract = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    notify("Fetching collections...", "info");

    try {
      const response = await fetch('/api/extract_collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to extract collections');
      
      if (data.collections && data.collections.length > 0) {
        setCollections(data.collections);
        notify(`Success! Found ${data.collections.length} collections.`, "success");
      } else {
        throw new Error('No collections found or store is password protected.');
      }

    } catch (err: any) {
      setError(err.message);
      notify(`Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text);
    notify(`${label} copied to clipboard!`, "success");
  };

  // 3. Search Filter Logic
  const filteredCollections = collections.filter(col => 
    col.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe size={18} className="text-gray-400 dark:text-neutral-400" />
          Target Store
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="https://cakesbody.com" 
              label="Store URL"
            />
          </div>
          <Button onClick={handleExtract} disabled={loading || !url} className="w-full md:w-auto mb-[1px]">
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Extract Collections'}
          </Button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border-red-100 text-red-600 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </Card>

      {collections.length > 0 && (
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b border-gray-200 dark:border-neutral-800 pb-4 gap-4">
             <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Extracted Collections ({filteredCollections.length})</h3>
                <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">Data saved locally</p>
             </div>
             
             <div className="flex gap-3 w-full md:w-auto">
                <div className="flex-1 md:w-64">
                    <Input 
                        placeholder="Search collections..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={Search}
                    />
                </div>
                <Button variant="ghost" onClick={() => {
                  setCollections([]);
                  setSearchTerm('');
                  localStorage.removeItem('extracted_collections');
                  notify("Cleared all data", "info");
                }}>Clear</Button>
             </div>
          </div>

          <div className="space-y-3">
            {filteredCollections.map((col, idx) => (
              <div 
                key={idx} 
                onClick={() => window.open(col.url, '_blank')}
                className="bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden group hover:border-gray-300 dark:hover:border-neutral-600 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2 text-base">
                        {col.title}
                        <ExternalLink size={12} className="text-gray-400 dark:text-neutral-600 group-hover:text-gray-600 dark:group-hover:text-neutral-400 transition-colors" />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-neutral-500 truncate font-mono mt-1 opacity-60">{col.url}</div>
                  </div>
                  
                  <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 md:pb-0" onClick={(e) => e.stopPropagation()}>
                    <Button variant="secondary" onClick={() => handleCopy(col.title, 'Title')} className="h-8 px-3 text-xs whitespace-nowrap" title="Copy Title">
                        <Type size={14} className="mr-1.5"/> Title
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleCopy(`${col.handle}`, 'Handle path')} 
                      className="h-8 px-3 text-xs whitespace-nowrap" 
                      title="Copy Handle Path (e.g., /summer-sale)"
                    >
                        <Hash size={14} className="mr-1.5"/> Handle
                    </Button>
                    <Button variant="secondary" onClick={() => handleCopy(col.description, 'HTML Description')} className="h-8 px-3 text-xs whitespace-nowrap" title="Copy Description HTML">
                        <FileCode size={14} className="mr-1.5"/> Desc
                    </Button>
                  </div>
                </div>

                {/* Optional HTML Preview */}
                {col.description && (
                    <div className="bg-white dark:bg-[#050505] border-t border-gray-200 dark:border-neutral-800 px-4 py-2" onClick={(e) => e.stopPropagation()}>
                        <details className="text-xs text-gray-500 dark:text-neutral-400">
                            <summary className="cursor-pointer hover:text-gray-800 dark:hover:text-neutral-300 select-none flex items-center gap-2 py-1">
                                <FileText size={12} /> Show Description HTML Preview
                            </summary>
                            <div className="mt-2 font-mono text-[10px] leading-relaxed opacity-70 bg-gray-50 dark:bg-black p-3 rounded border border-gray-200 dark:border-neutral-800 overflow-x-auto text-gray-800 dark:text-gray-300">
                                {col.description.substring(0, 300)}
                                {col.description.length > 300 && '...'}
                            </div>
                        </details>
                    </div>
                )}
              </div>
            ))}
            
            {filteredCollections.length === 0 && (
                <div className="text-center py-12 text-gray-400 dark:text-neutral-600">
                    <Search size={32} className="mx-auto mb-3 opacity-20" />
                    <p>No collections match your search.</p>
                </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};