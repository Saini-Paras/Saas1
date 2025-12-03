import React, { useState } from 'react';
import { FileJson, Plus, Trash2, Download } from 'lucide-react';
import { Card, Button, Input, TextArea, Select } from '../Common';
import { saveAs } from '../../utils';
import { SmartCollection, NotificationType } from '../../types';

interface Props {
  notify: (msg: string, type?: NotificationType) => void;
}

export const JsonCreatorTool: React.FC<Props> = ({ notify }) => {
  const [collections, setCollections] = useState<SmartCollection[]>([]);
  const [formData, setFormData] = useState({
    handle: "",
    title: "",
    body_html: "",
    sort_order: "best-selling",
    condition_tag: ""
  });

  const handleAdd = () => {
    if (!formData.handle || !formData.title || !formData.condition_tag) {
      notify("Please fill in Handle, Title, and Condition Tag", "error");
      return;
    }

    const newCollection: SmartCollection = {
      handle: formData.handle,
      title: formData.title,
      body_html: formData.body_html,
      sort_order: formData.sort_order,
      rules: [
        {
          column: "tag",
          relation: "equals",
          condition: formData.condition_tag
        }
      ]
    };

    setCollections([...collections, newCollection]);
    setFormData({ ...formData, handle: "", title: "", body_html: "", condition_tag: "" }); 
    notify("Collection added to list", "success");
  };

  const removeCollection = (index: number) => {
    const newCollections = [...collections];
    newCollections.splice(index, 1);
    setCollections(newCollections);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(collections, null, 2)], { type: "application/json" });
    saveAs(blob, "smart_collections.json");
    notify("JSON file downloaded", "success");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-5 space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-gray-100 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
               <Plus size={20} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Collection</h3>
          </div>
          
          <div className="space-y-4">
            <Input 
              label="Collection Title" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Summer Sale"
            />
            <Input 
              label="Handle" 
              value={formData.handle}
              onChange={(e) => setFormData({...formData, handle: e.target.value})}
              placeholder="e.g. summer-sale"
            />
            <TextArea 
              label="Description (HTML supported)" 
              value={formData.body_html}
              onChange={(e) => setFormData({...formData, body_html: e.target.value})}
              placeholder="<p>Our best summer collection...</p>"
              rows={4}
            />
            <Select 
                label="Sort Order"
                value={formData.sort_order}
                onChange={(e) => setFormData({...formData, sort_order: e.target.value})}
            >
                <option value="best-selling">Best Selling</option>
                <option value="alpha-asc">A-Z</option>
                <option value="alpha-desc">Z-A</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
                <option value="created-desc">Newest First</option>
            </Select>
            <Input 
              label="Condition Tag" 
              value={formData.condition_tag}
              onChange={(e) => setFormData({...formData, condition_tag: e.target.value})}
              placeholder="e.g. cus-summer-sale"
            />
          </div>
          <div className="mt-8">
            <Button onClick={handleAdd} className="w-full">
              Add to List
            </Button>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-7 h-full">
        <Card className="h-full flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
                <FileJson size={18} className="text-gray-400 dark:text-neutral-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">JSON Preview</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setCollections([])} disabled={collections.length === 0} className="px-3">
                 Clear
              </Button>
              <Button variant="secondary" onClick={downloadJson} disabled={collections.length === 0}>
                <Download size={16} /> Export JSON
              </Button>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 dark:bg-[#050505] rounded-lg p-4 overflow-auto border border-gray-200 dark:border-neutral-800 relative group">
            {collections.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-neutral-600 text-sm">
                <FileJson size={32} className="mb-2 opacity-20" />
                No collections added yet
              </div>
            ) : (
                <div className="space-y-4">
                     {/* Visual List Representation for better UX */}
                     <div className="grid gap-2 mb-6">
                        {collections.map((col, idx) => (
                            <div key={idx} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-3 rounded-md flex items-center justify-between group/item shadow-sm">
                                <div className="text-sm">
                                    <span className="text-gray-900 dark:text-white font-medium">{col.title}</span>
                                    <span className="text-gray-400 dark:text-neutral-500 mx-2">•</span>
                                    <span className="text-gray-500 dark:text-neutral-500 font-mono text-xs">{col.handle}</span>
                                </div>
                                <button 
                                    onClick={() => removeCollection(idx)}
                                    className="text-gray-400 dark:text-neutral-600 hover:text-red-500 dark:hover:text-red-400 p-1 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                     </div>
                     
                     {/* Raw JSON */}
                     <div className="border-t border-gray-200 dark:border-neutral-800 pt-4">
                         <div className="text-xs text-gray-500 dark:text-neutral-500 uppercase tracking-wider mb-2">Raw JSON Output</div>
                         <pre className="text-[10px] text-green-600 dark:text-green-400/80 font-mono leading-relaxed break-all whitespace-pre-wrap">
                            {JSON.stringify(collections, null, 2)}
                        </pre>
                     </div>
                </div>
            )}
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-neutral-500 text-right font-mono">
            Count: {collections.length} items
          </div>
        </Card>
      </div>
    </div>
  );
};