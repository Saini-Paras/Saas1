import React, { useState } from 'react';
import { Database, Terminal, Play } from 'lucide-react';
import { Card, Button, Input, FileUpload } from '../Common';
import { saveAs } from '../../utils';
import { NotificationType } from '../../types';

interface Props {
  libsLoaded: boolean;
  notify: (msg: string, type?: NotificationType) => void;
}

export const TagAutomationTool: React.FC<Props> = ({ libsLoaded, notify }) => {
  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [prefix, setPrefix] = useState("cus-");
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  const processFiles = async () => {
    if (!libsLoaded) {
      notify("Libraries are still loading...", "error");
      return;
    }
    if (!masterFile || !zipFile) {
      notify("Please upload both CSV and ZIP files", "error");
      return;
    }

    setIsProcessing(true);
    setLogs(["> Starting automation process..."]);

    try {
      // 1. Parse Master CSV
      addLog("Parsing Master CSV...");
      const masterData: any[] = await new Promise((resolve) => {
        window.Papa.parse(masterFile, {
          header: true,
          complete: (results: any) => resolve(results.data),
          skipEmptyLines: true
        });
      });
      addLog(`Loaded ${masterData.length} rows from Master CSV.`);

      // 2. Process Zip
      addLog("Scanning Collections ZIP...");
      const zip = new window.JSZip();
      const loadedZip = await zip.loadAsync(zipFile);
      
      const tagsToAddMap = new Map<string, Set<string>>();

      for (const [filename, file] of Object.entries(loadedZip.files)) {
        // @ts-ignore
        if (!filename.endsWith('.csv') || filename.startsWith('__MACOSX') || file.dir) continue;

        const tagName = `${prefix}${filename.replace('.csv', '')}`;
        // @ts-ignore
        const content = await file.async("string");
        const collectionData = window.Papa.parse(content, { header: true }).data;

        collectionData.forEach((row: any) => {
          const handle = row.Handle || row.handle; 
          if (handle) {
             if (!tagsToAddMap.has(handle)) {
               tagsToAddMap.set(handle, new Set());
             }
             tagsToAddMap.get(handle)!.add(tagName);
          }
        });
      }
      addLog(`Mapped tags for ${tagsToAddMap.size} unique handles.`);

      // 3. Update Master Data
      addLog("Applying tags...");
      let updatedCount = 0;

      masterData.forEach(row => {
        const handle = row.Handle;
        
        if (handle && tagsToAddMap.has(handle)) {
          const newTagsSet = tagsToAddMap.get(handle)!;

          // Simple heuristic to check if row is valid product row
          const hasTitle = row.Title && row.Title.toString().trim() !== '';
          const hasTags = row.Tags !== undefined;

          if (hasTitle || hasTags) {
             const currentTagsStr = row.Tags ? row.Tags.toString() : "";
             let currentTagsList = currentTagsStr.split(',').map((t: string) => t.trim()).filter((t: string) => t !== "");
             const currentTagsSet = new Set(currentTagsList);

             let tagsAdded = false;
             newTagsSet.forEach(newTag => {
               if (!currentTagsSet.has(newTag)) {
                 currentTagsList.push(newTag);
                 currentTagsSet.add(newTag);
                 tagsAdded = true;
               }
             });

             if (tagsAdded) {
               row.Tags = currentTagsList.join(', ');
               updatedCount++;
             }
          }
        }
      });

      addLog(`Finished. Updated ${updatedCount} rows.`);
      
      // 4. Export
      addLog("Generating CSV...");
      const csv = window.Papa.unparse(masterData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "Master_Updated_With_Tags.csv");
      notify("Processing complete! Download started.", "success");
      addLog("Done.");

    } catch (error: any) {
      console.error(error);
      notify(`Error: ${error.message}`, "error");
      addLog(`ERROR: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2 space-y-6">
        <Card className="h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
               <Database size={20} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Input Data</h3>
              <p className="text-sm text-gray-500 dark:text-neutral-500">Upload your master product list and collection exports.</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <FileUpload 
              label="1. Master Product CSV" 
              accept=".csv"
              file={masterFile}
              onFileSelect={(e) => setMasterFile(e.target.files ? e.target.files[0] : null)}
            />
            <FileUpload 
              label="2. Collections ZIP" 
              accept=".zip"
              file={zipFile}
              onFileSelect={(e) => setZipFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>
          
          <div className="mb-8">
             <Input 
              label="Tag Prefix" 
              value={prefix} 
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="e.g., cus-" 
            />
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-2">This prefix will be added to the filename of the CSVs inside the zip to create the tag.</p>
          </div>

          <Button 
            onClick={processFiles} 
            disabled={isProcessing || !libsLoaded}
            className="w-full h-12 text-base"
          >
            {isProcessing ? 'Processing...' : (!libsLoaded ? 'Loading Libraries...' : 'Run Automation & Download')}
            {!isProcessing && libsLoaded && <Play size={16} className="ml-2" />}
          </Button>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="h-full min-h-[400px] flex flex-col font-mono text-xs bg-gray-900 dark:bg-[#080808] border-gray-800 dark:border-neutral-800">
          <div className="flex items-center gap-2 pb-4 border-b border-gray-800 dark:border-neutral-800 mb-4">
            <Terminal size={14} className="text-gray-400 dark:text-neutral-500" />
            <span className="text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-wider">Process Logs</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 text-gray-300 dark:text-neutral-400">
            {logs.length === 0 && <span className="text-gray-600 dark:text-neutral-700 italic">Waiting to start...</span>}
            {logs.map((log, i) => (
              <div key={i} className="break-all border-l-2 border-gray-700 dark:border-neutral-800 pl-2">{log}</div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};