import React, { useState } from 'react';
import { FileJson, Play, Download, Trash2, Edit2, Check, Globe, Loader2, List, Code, Copy } from 'lucide-react';
import { Card, Button, Input, FileUpload } from '../Common';
import { saveAs, copyToClipboard } from '../../utils';
import { SmartCollection, NotificationType, ExtractedCollection } from '../../types';

interface Props {
  libsLoaded: boolean;
  notify: (msg: string, type?: NotificationType) => void;
}

export const AutoJsonCreatorTool: React.FC<Props> = ({ libsLoaded, notify }) => {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [storeUrl, setStoreUrl] = useState("");
  const [prefix, setPrefix] = useState("cus-");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [collections, setCollections] = useState<SmartCollection[]>([]);
  
  // Edit State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // View State
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');

  const processZip = async () => {
    if (!libsLoaded) {
      notify("Libraries are still loading...", "error");
      return;
    }
    if (!zipFile) {
      notify("Please upload a ZIP file first.", "error");
      return;
    }

    setIsProcessing(true);
    setCollections([]);
    setStatusMsg("Starting process...");

    try {
      // 1. Optional: Fetch Real Metadata if URL provided
      const metadataMap = new Map<string, ExtractedCollection>();
      
      if (storeUrl) {
          setStatusMsg("Fetching store metadata...");
          try {
              const response = await fetch('/api/extract_collections', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: storeUrl })
              });
              const data = await response.json();
              if (data.collections) {
                  data.collections.forEach((c: ExtractedCollection) => {
                      metadataMap.set(c.handle, c);
                  });
                  notify(`Fetched metadata for ${data.collections.length} collections`, "success");
              }
          } catch (e) {
              console.warn("Failed to fetch metadata, proceeding with basic generation", e);
              notify("Could not fetch store metadata. Using filenames only.", "error");
          }
      }

      // 2. Process ZIP
      setStatusMsg("Reading ZIP file...");
      const zip = new window.JSZip();
      const loadedZip = await zip.loadAsync(zipFile);
      const newCollections: SmartCollection[] = [];

      for (const [filename, file] of Object.entries(loadedZip.files)) {
        // @ts-ignore
        if (!filename.endsWith('.csv') || filename.startsWith('__MACOSX') || file.dir) continue;

        // Extract Handle
        const handle = filename.replace('.csv', '');

        // Default Data (Fallback)
        let title = handle
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        let description = "";

        // Merge with Real Metadata
        if (metadataMap.has(handle)) {
            const realData = metadataMap.get(handle)!;
            title = realData.title;
            description = realData.description;
        }

        const conditionTag = `${prefix}${handle}`;

        newCollections.push({
          handle: handle,
          title: title,
          body_html: description, 
          sort_order: "best-selling",
          rules: [{
            column: "tag",
            relation: "equals",
            condition: conditionTag
          }]
        });
      }

      setCollections(newCollections);
      notify(`Successfully generated ${newCollections.length} collections!`, "success");

    } catch (error: any) {
      console.error(error);
      notify(`Error processing: ${error.message}`, "error");
    } finally {
      setIsProcessing(false);
      setStatusMsg("");
    }
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(collections, null, 2)], { type: "application/json" });
    saveAs(blob, "auto_smart_collections.json");
    notify("JSON file downloaded", "success");
  };

  const copyJson = () => {
    copyToClipboard(JSON.stringify(collections, null, 2));
    notify("JSON copied to clipboard", "success");
  };

  const startEditing = (index: number, currentTitle: string) => {
    setEditingIndex(index);
    setEditTitle(currentTitle);
  };

  const saveEdit = (index: number) => {
    const updated = [...collections];
    updated[index].title = editTitle;
    setCollections(updated);
    setEditingIndex(null);
  };

  const removeCollection = (index: number) => {
    const updated = [...collections];
    updated.splice(index, 1);
    setCollections(updated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Left Column: Configuration */}
      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
               <FileJson size={20} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Auto JSON Creator</h3>
              <p className="text-sm text-gray-500 dark:text-neutral-500">Upload ZIP → Auto-generate JSON</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
                <Input 
                    label="Source Store URL (Optional)" 
                    value={storeUrl} 
                    onChange={(e) => setStoreUrl(e.target.value)}
                    placeholder="https://mystore.com" 
                    icon={Globe}
                />
                <p className="text-[10px] text-gray-400 dark:text-neutral-500">
                    If provided, we will fetch the <strong>Description</strong> and <strong>Title</strong> from the live store to enrich the JSON.
                </p>
            </div>

            <FileUpload 
              label="Collections ZIP" 
              accept=".zip"
              file={zipFile}
              onFileSelect={(e) => setZipFile(e.target.files ? e.target.files[0] : null)}
            />
            
            <div>
                <Input 
                    label="Condition Tag Prefix" 
                    value={prefix} 
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="e.g., cus-" 
                />
                <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-2">
                    Logic: Tag = <code>{prefix}</code> + <code>filename-handle</code>
                </p>
            </div>

            <Button 
                onClick={processZip} 
                disabled={isProcessing || !libsLoaded || !zipFile}
                className="w-full"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="animate-spin mr-2" size={16} /> 
                        {statusMsg}
                    </>
                ) : (
                    <>
                        Generate Collections <Play size={16} className="ml-2" />
                    </>
                )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Right Column: Preview & Export */}
      <div className="lg:col-span-2 h-full">
        <Card className="h-full flex flex-col min-h-[500px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Generated Preview</h3>
                <span className="text-xs bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-gray-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700">
                    {collections.length} items
                </span>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-neutral-900 rounded-lg p-1 mr-2 border border-gray-200 dark:border-neutral-800">
                  <button 
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white dark:bg-neutral-700 shadow-sm text-accent-600 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300'}`}
                      title="Table View"
                  >
                      <List size={16} />
                  </button>
                  <button 
                      onClick={() => setViewMode('json')}
                      className={`p-1.5 rounded-md transition-all ${viewMode === 'json' ? 'bg-white dark:bg-neutral-700 shadow-sm text-accent-600 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300'}`}
                      title="JSON View"
                  >
                      <Code size={16} />
                  </button>
              </div>

              {/* Action Buttons */}
              {viewMode === 'json' && (
                  <Button variant="secondary" onClick={copyJson} disabled={collections.length === 0} className="px-3" title="Copy Raw JSON">
                      <Copy size={16} />
                  </Button>
              )}
              
              <Button variant="ghost" onClick={() => setCollections([])} disabled={collections.length === 0} className="px-3">
                 Clear
              </Button>
              <Button variant="secondary" onClick={downloadJson} disabled={collections.length === 0}>
                <Download size={16} /> Export
              </Button>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 dark:bg-[#171717] rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-800 relative flex flex-col">
            {collections.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-neutral-600 text-sm opacity-60">
                <FileJson size={48} className="mb-4 opacity-50" />
                <p className="font-medium">No collections generated yet</p>
                <p className="text-xs mt-1">Upload a ZIP file to get started</p>
              </div>
            ) : (
                viewMode === 'table' ? (
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-sm text-left min-w-[600px]">
                            <thead className="bg-white dark:bg-[#1e1e1e] sticky top-0 shadow-sm z-10 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-neutral-800">
                                <tr>
                                    <th className="px-4 py-3 font-semibold w-1/3">Collection Title</th>
                                    <th className="px-4 py-3 font-semibold">Handle</th>
                                    <th className="px-4 py-3 font-semibold w-1/4">Description</th>
                                    <th className="px-4 py-3 font-semibold text-right w-16">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                                {collections.map((col, idx) => (
                                    <tr key={idx} className="bg-white dark:bg-[#171717] hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors">
                                        <td className="px-4 py-2 align-top">
                                            {editingIndex === idx ? (
                                                <div className="flex gap-2">
                                                    <input 
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="w-full bg-white dark:bg-black border border-accent-500 rounded px-2 py-1 text-sm outline-none"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(idx)}
                                                    />
                                                    <button onClick={() => saveEdit(idx)} className="text-green-500 hover:text-green-600"><Check size={16} /></button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 group">
                                                    <span className="font-medium text-gray-900 dark:text-white">{col.title}</span>
                                                    <button 
                                                        onClick={() => startEditing(idx, col.title)}
                                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-accent-500 transition-opacity"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 font-mono text-xs text-gray-500 dark:text-neutral-500 align-top pt-3">
                                            {col.handle}
                                        </td>
                                        <td className="px-4 py-2 align-top pt-3">
                                            {col.body_html ? (
                                                <div className="text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded border border-green-100 dark:border-green-900/30 inline-block max-w-[150px] truncate">
                                                    Included ({col.body_html.length} chars)
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 italic">Empty</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-right align-top pt-2">
                                            <button 
                                                onClick={() => removeCollection(idx)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto custom-scrollbar p-4 bg-[#0a0a0a]">
                        <pre className="text-xs font-mono text-green-400/90 whitespace-pre-wrap break-all leading-relaxed">
                            {JSON.stringify(collections, null, 2)}
                        </pre>
                    </div>
                )
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};