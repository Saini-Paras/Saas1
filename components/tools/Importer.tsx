import React, { useState } from 'react';
import { Upload, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Card, Button, Input, FileUpload } from '../Common';
import { NotificationType } from '../../types';

interface Props {
  notify: (msg: string, type?: NotificationType) => void;
}

export const ImporterTool: React.FC<Props> = ({ notify }) => {
  const [file, setFile] = useState<File | null>(null);
  const [shopUrl, setShopUrl] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle"); 
  const [resultMsg, setResultMsg] = useState("");

  const handleImport = async () => {
    if (!file || !shopUrl || !token) {
      notify("Please fill all fields", "error");
      return;
    }

    setStatus("processing");
    setResultMsg("Reading file...");
    notify("Starting import process...", "info");

    try {
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      let collections;
      try {
          collections = JSON.parse(fileContent);
      } catch (e) {
          throw new Error("Invalid JSON file.");
      }

      if (!Array.isArray(collections)) {
        throw new Error("Invalid JSON format. Expected an array of collections.");
      }

      setResultMsg(`Sending ${collections.length} collections to backend...`);

      // NOTE: This assumes a backend endpoint exists. In a pure frontend demo, this will fail.
      const response = await fetch('/api/import_collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopUrl,
          accessToken: token,
          collections
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error occurred");
      }

      setStatus("success");
      setResultMsg(
        `Import Complete! Success: ${data.results.success}, Failed: ${data.results.failed}`
      );
      notify("Import process completed successfully!", "success");

    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setResultMsg(`Error: ${err.message}`);
      notify("Import failed. Check connection or logs.", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-4 flex gap-3 text-yellow-700 dark:text-yellow-600 text-sm">
         <AlertCircle size={20} className="shrink-0 mt-0.5" />
         <p>
           <strong className="font-semibold block mb-1">Backend Required</strong> 
           This tool attempts to connect to <code>/api/import_collections</code>. 
           Ensure your backend server is running and configured to accept these requests.
         </p>
       </div>

      <Card>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Store Configuration</h3>
        <div className="grid gap-6">
           <Input 
              label="Shopify Store URL" 
              placeholder="my-store.myshopify.com" 
              value={shopUrl}
              onChange={(e) => setShopUrl(e.target.value)}
           />
           <Input 
              label="Admin API Access Token" 
              placeholder="shpat_xxxxxxxxxxxxxxxx" 
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
           />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Import Source</h3>
        <FileUpload 
          label="Smart Collections JSON" 
          accept=".json"
          file={file}
          onFileSelect={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        />
        
        {status !== 'idle' && (
          <div className={`mt-6 p-4 rounded-lg text-sm font-mono flex items-center gap-3 border
            ${status === 'processing' ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400' : ''}
            ${status === 'success' ? 'bg-green-50 border-green-100 text-green-600 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400' : ''}
            ${status === 'error' ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400' : ''}
          `}>
            {status === 'processing' && <Loader2 className="animate-spin" size={18} />}
            {status === 'success' && <CheckCircle size={18} />}
            {status === 'error' && <AlertCircle size={18} />}
            <span>{resultMsg}</span>
          </div>
        )}

        <div className="mt-8 flex justify-end">
           <Button 
             disabled={!file || !shopUrl || !token || status === 'processing'}
             onClick={handleImport}
             className="w-full md:w-auto"
           >
             {status === 'processing' ? 'Importing...' : 'Start Import Process'}
           </Button>
        </div>
      </Card>
    </div>
  );
};