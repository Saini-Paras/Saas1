import React, { useState, useMemo } from 'react';
import { Download, Search, AlertCircle, CheckCircle, Loader2, RefreshCw, FileText, CheckSquare, Square, FileArchive, Settings } from 'lucide-react';
import { Card, Button, Input } from '../Common';
import { NotificationType } from '../../types';

interface Props {
  notify: (msg: string, type?: NotificationType) => void;
  libsLoaded: boolean;
}

export const ShopifyScraperTool: React.FC<Props> = ({ notify, libsLoaded }) => {
  const [url, setUrl] = useState('');
  const [step, setStep] = useState(1); // 1: Input/Scan, 2: Review/Extract
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [processedCount, setProcessedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState(true);

  // Helper to escape CSV fields
  const escapeCsv = (text: any) => {
    if (text === null || text === undefined) return '';
    const stringValue = String(text);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const parseDomain = (inputUrl: string) => {
    try {
      let hostname = inputUrl.trim();
      if (!hostname) throw new Error("URL is empty");
      if (!hostname.startsWith('http')) {
        hostname = `https://${hostname}`;
      }
      const urlObj = new URL(hostname);
      return urlObj.hostname;
    } catch (err) {
      throw new Error("Invalid URL. Please enter a valid store domain (e.g., mystore.com)");
    }
  };

  // --- Search & Filter Logic ---
  const filteredCollections = useMemo(() => {
    if (!searchQuery) return collections;
    
    const lowerQuery = searchQuery.toLowerCase();
    
    // Check if query is a URL and extract handle
    let queryHandle = lowerQuery;
    try {
        if (lowerQuery.includes('/collections/')) {
            const parts = lowerQuery.split('/collections/');
            if (parts[1]) {
                queryHandle = parts[1].split('/')[0].split('?')[0];
            }
        }
    } catch (e) { /* ignore url parse errors */ }

    return collections.filter(c => 
        (c.title && c.title.toLowerCase().includes(lowerQuery)) || 
        (c.handle && c.handle.toLowerCase().includes(queryHandle))
    );
  }, [collections, searchQuery]);

  const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCollections.length && filteredCollections.length > 0) {
        setSelectedIds(new Set());
    } else {
        const newSet = new Set(filteredCollections.map(c => c.id));
        setSelectedIds(newSet);
    }
  };

  // --- Step 1: Scan for Collections ---
  const scanStore = async () => {
    setLoading(true);
    setError(null);
    setCollections([]);
    setProgress('Scanning for collections...');
    
    try {
      const domain = parseDomain(url);
      let allCollections: any[] = [];
      let page = 1;
      let hasMore = true;
      const limit = 250;

      while (hasMore) {
        setProgress(`Scanning page ${page} of collections...`);
        const targetUrl = `https://${domain}/collections.json?page=${page}&limit=${limit}`;
        
        let fetchUrl = targetUrl;
        if (useProxy) {
          fetchUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`Failed to fetch collections: ${response.statusText}`);
        
        const data = await response.json();
        let fetchedCollections = [];

        if (useProxy) {
            if (!data.contents) throw new Error("Proxy response empty");
            const parsed = JSON.parse(data.contents);
            fetchedCollections = parsed.collections || [];
        } else {
            fetchedCollections = data.collections || [];
        }

        if (fetchedCollections.length === 0) {
          hasMore = false;
        } else {
          allCollections = [...allCollections, ...fetchedCollections];
          if (fetchedCollections.length < limit) hasMore = false;
          else page++;
        }
        
        if (page > 20) hasMore = false; // Safety break
        await sleep(300); // Polite delay
      }

      if (allCollections.length === 0) {
        throw new Error("No collections found. The store might have hidden the /collections.json endpoint.");
      }

      const processedCols = allCollections.map(c => ({ 
          ...c, 
          status: 'pending', 
          extractedCount: 0 
      }));
      
      setCollections(processedCols);
      // Default: select all
      setSelectedIds(new Set(processedCols.map(c => c.id)));
      setStep(2);
      setProgress('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to scan store.");
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch Logic (Reused) ---
  const fetchCollectionProducts = async (collection: any, domain: string) => {
      let allProducts: any[] = [];
      let page = 1;
      let hasMore = true;
      const limit = 250;

      while (hasMore) {
        const targetUrl = `https://${domain}/collections/${collection.handle}/products.json?page=${page}&limit=${limit}`;
        let fetchUrl = useProxy ? `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}` : targetUrl;

        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error("Fetch failed");
        
        const data = await response.json();
        let products = [];
        
        if (useProxy) {
            const parsed = JSON.parse(data.contents);
            products = parsed.products || [];
        } else {
            products = data.products || [];
        }

        if (products.length === 0) {
            hasMore = false;
        } else {
            allProducts = [...allProducts, ...products];
            if (products.length < limit) hasMore = false;
            else page++;
        }
        
        if (page > 50) hasMore = false; // Safety limit
        await sleep(200); // Rate limit protection
      }
      return allProducts;
  };

  // --- Single Download ---
  const downloadSingle = async (collection: any) => {
      setLoading(true);
      setError(null);
      setProgress(`Extracting ${collection.title}...`);
      
      try {
          const domain = parseDomain(url);
          const products = await fetchCollectionProducts(collection, domain);
          
          if (products.length === 0) {
              notify("No products found in this collection.", "error");
              setLoading(false);
              return;
          }

          const headers = ['Handle', 'Title', 'Product Type', 'Created At', 'Vendor', 'Tags', 'Variant Price', 'Image Src'];
          const rows = products.map(p => [
            escapeCsv(p.handle),
            escapeCsv(p.title),
            escapeCsv(p.product_type),
            escapeCsv(p.created_at),
            escapeCsv(p.vendor),
            escapeCsv(p.tags),
            escapeCsv(p.variants?.[0]?.price || ''),
            escapeCsv(p.images?.[0]?.src || '')
          ]);

          const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const urlObj = URL.createObjectURL(blob);
          link.setAttribute('href', urlObj);
          link.setAttribute('download', `${collection.handle}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setProgress('');
          notify(`Downloaded ${collection.title}`, "success");
      } catch (err: any) {
          setError(`Failed to download ${collection.title}: ${err.message}`);
      } finally {
          setLoading(false);
      }
  };

  // --- Bulk Extract & Zip ---
  const extractAndZip = async () => {
    if (!libsLoaded) {
      setError("Zip library not loaded yet. Please wait a moment.");
      return;
    }

    if (selectedIds.size === 0) {
        setError("Please select at least one collection.");
        return;
    }

    setLoading(true);
    setError(null);
    setProcessedCount(0);
    
    const domain = parseDomain(url);
    const zip = new window.JSZip();
    const folder = zip.folder("collections");

    try {
        let updatedCollections = [...collections];
        const collectionsToProcess = updatedCollections.filter(c => selectedIds.has(c.id));
        let processedNow = 0;

        for (let i = 0; i < updatedCollections.length; i++) {
            const collection = updatedCollections[i];
            
            // Skip if not selected
            if (!selectedIds.has(collection.id)) continue;

            setProgress(`Processing: ${collection.title} (${processedNow + 1}/${collectionsToProcess.length})`);
            
            updatedCollections[i].status = 'processing';
            setCollections([...updatedCollections]);

            try {
                const allProducts = await fetchCollectionProducts(collection, domain);

                // Create CSV Content
                if (allProducts.length > 0) {
                    const headers = ['Handle', 'Title', 'Product Type', 'Created At', 'Vendor', 'Tags', 'Variant Price', 'Image Src'];
                    const rows = allProducts.map(p => [
                        escapeCsv(p.handle),
                        escapeCsv(p.title),
                        escapeCsv(p.product_type),
                        escapeCsv(p.created_at),
                        escapeCsv(p.vendor),
                        escapeCsv(p.tags),
                        escapeCsv(p.variants?.[0]?.price || ''),
                        escapeCsv(p.images?.[0]?.src || '')
                    ]);

                    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                    folder.file(`${collection.handle}.csv`, csvContent);
                }

                updatedCollections[i].status = 'success';
                updatedCollections[i].extractedCount = allProducts.length;

            } catch (err: any) {
                console.warn(`Failed to fetch collection ${collection.handle}`, err);
                updatedCollections[i].status = 'error';
                folder.file(`${collection.handle}_error.txt`, `Error: ${err.message}`);
            }

            setCollections([...updatedCollections]);
            processedNow++;
            setProcessedCount(processedNow);
        }

        setProgress("Generating ZIP file...");
        const content = await zip.generateAsync({ type: "blob" });
        
        // Trigger Download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${domain.replace(/\./g, '_')}_selected_collections.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setProgress("");
        notify("Batch export completed successfully!", "success");

    } catch (err) {
        console.error(err);
        setError("An error occurred during the batch process.");
    } finally {
        setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setCollections([]);
    setSelectedIds(new Set());
    setSearchQuery('');
    setProgress('');
    setError(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="min-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
                        <FileArchive size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shopify Bulk Extractor</h3>
                        <p className="text-sm text-gray-500 dark:text-neutral-500">Scan, Select, and Download product collections as CSVs.</p>
                    </div>
                </div>
                {step === 2 && !loading && (
                    <Button variant="outline" onClick={reset} className="h-8 px-3 text-xs whitespace-nowrap shrink-0">
                        <RefreshCw size={12} className="mr-1.5" /> Clear
                    </Button>
                )}
            </div>

            {/* Step 1: Input */}
            {step === 1 && (
             <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <Input
                            label="Store URL"
                            placeholder="https://mystore.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={scanStore}
                        disabled={loading || !url}
                        className="w-full md:w-auto mb-[1px]"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Search className="mr-2" size={16} />}
                        {loading ? 'Scanning...' : 'Scan Store'}
                    </Button>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-md">
                    <input 
                        type="checkbox" 
                        id="proxy" 
                        checked={useProxy} 
                        onChange={(e) => setUseProxy(e.target.checked)}
                        className="w-4 h-4 text-accent-600 rounded border-gray-300 focus:ring-accent-500 bg-white dark:bg-neutral-900 dark:border-neutral-700"
                    />
                    <label htmlFor="proxy" className="text-sm text-gray-700 dark:text-neutral-300 flex items-center gap-2 cursor-pointer select-none">
                        <Settings size={14} /> Use CORS Proxy (Recommended to avoid blocking)
                    </label>
                </div>

                {loading && (
                    <div className="flex items-center justify-center p-8 text-gray-500 dark:text-neutral-500">
                        <Loader2 className="animate-spin mr-2" size={20} />
                        <span>Scanning store metadata... this might take a moment.</span>
                    </div>
                )}
             </div>
            )}

            {/* Step 2: Review & Execute */}
            {step === 2 && (
             <div className="flex flex-col flex-1 gap-4">
                 {/* Toolbar */}
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-neutral-800">
                     <div className="flex items-center gap-4 flex-1">
                        <div className="w-full max-w-sm">
                            <Input 
                                placeholder="Search by title, handle..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                icon={Search}
                            />
                        </div>
                        <div className="text-sm text-gray-500 dark:text-neutral-500 whitespace-nowrap">
                            {selectedIds.size} selected
                        </div>
                     </div>
                     
                     {!loading && (
                        <Button 
                            onClick={extractAndZip}
                            disabled={selectedIds.size === 0}
                            variant="primary"
                        >
                            <Download size={16} className="mr-2" /> 
                            Download Selected ({selectedIds.size})
                        </Button>
                     )}
                 </div>

                 {/* Table Container with Horizontal Scroll Support */}
                 <div className="border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden flex-1 max-h-[600px] bg-gray-50 dark:bg-[#171717] relative flex flex-col">
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-sm text-left min-w-[800px]">
                            <thead className="bg-white dark:bg-[#1e1e1e] sticky top-0 shadow-sm z-10 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-neutral-800">
                                <tr>
                                    <th className="px-4 py-3 w-12 text-center">
                                        <button onClick={toggleSelectAll} className="hover:bg-gray-100 dark:hover:bg-neutral-800 p-1 rounded transition-colors">
                                            {selectedIds.size === filteredCollections.length && filteredCollections.length > 0 ? (
                                                <CheckSquare size={18} className="text-accent-600 dark:text-accent-500" />
                                            ) : (
                                                <Square size={18} className="text-gray-300 dark:text-neutral-600" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Collection Title</th>
                                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Products</th>
                                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Status</th>
                                    <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                                {filteredCollections.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-gray-400 dark:text-neutral-600">
                                            No collections found matching "{searchQuery}"
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCollections.map((col) => {
                                        const isSelected = selectedIds.has(col.id);
                                        return (
                                            <tr key={col.id} className={`transition-colors hover:bg-white dark:hover:bg-[#151515] ${isSelected ? 'bg-accent-50 dark:bg-accent-900/10' : ''}`}>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => toggleSelection(col.id)} className="focus:outline-none">
                                                        {isSelected ? (
                                                            <CheckSquare size={18} className="text-accent-600 dark:text-accent-500" />
                                                        ) : (
                                                            <Square size={18} className="text-gray-300 dark:text-neutral-600 hover:text-gray-400 dark:hover:text-neutral-500" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{col.title}</div>
                                                    <div className="text-xs text-gray-400 dark:text-neutral-500 font-mono">{col.handle}</div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    {typeof col.products_count === 'number' ? col.products_count : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {col.status === 'pending' && <span className="text-gray-400 dark:text-neutral-600 text-xs bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded">Waiting</span>}
                                                    {col.status === 'processing' && <span className="text-accent-600 dark:text-accent-400 text-xs font-bold flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Processing</span>}
                                                    {col.status === 'success' && <span className="text-green-600 dark:text-green-400 text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> {col.extractedCount} Extracted</span>}
                                                    {col.status === 'error' && <span className="text-red-500 dark:text-red-400 text-xs font-bold">Failed</span>}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button 
                                                        onClick={() => downloadSingle(col)}
                                                        disabled={loading}
                                                        className="text-gray-400 hover:text-accent-600 dark:text-neutral-500 dark:hover:text-white disabled:opacity-50 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                                                        title="Download just this collection"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
                 
                 {loading && (
                    <div className="bg-accent-50 dark:bg-accent-900/10 border border-accent-100 dark:border-accent-900/20 p-4 rounded-lg flex items-center gap-4">
                         <Loader2 className="w-5 h-5 text-accent-600 dark:text-accent-500 animate-spin shrink-0" />
                         <div className="flex-1">
                             <div className="flex justify-between text-xs font-semibold text-accent-800 dark:text-accent-300 mb-1">
                                 <span>{progress}</span>
                                 <span>{Math.round((processedCount / selectedIds.size) * 100) || 0}%</span>
                             </div>
                             <div className="w-full bg-accent-200 dark:bg-accent-900/30 rounded-full h-1.5">
                                 <div 
                                    className="bg-accent-600 dark:bg-accent-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(processedCount / selectedIds.size) * 100 || 0}%` }}
                                 ></div>
                             </div>
                         </div>
                    </div>
                 )}
             </div>
          )}

          {/* Errors */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30 rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400 animate-in fade-in">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Error Occurred</p>
                <p className="text-sm opacity-90">{error}</p>
                {!useProxy && (
                    <button className="text-xs mt-2 underline cursor-pointer hover:text-red-800 dark:hover:text-red-300" onClick={() => { setUseProxy(true); setError(null); }}>
                        Enable Proxy and try again?
                    </button>
                )}
              </div>
            </div>
          )}
        </Card>
    </div>
  );
};