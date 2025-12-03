import React, { useState, useEffect } from 'react';
import { RefreshCw, Copy, Trash2, Settings2 } from 'lucide-react';
import { Card, Button, Input, Select } from '../Common';
import { copyToClipboard } from '../../utils';
import { NotificationType } from '../../types';

interface Props {
  notify: (msg: string, type?: NotificationType) => void;
}

type ConversionMode = 'rem-to-px' | 'px-to-rem' | 'percent-to-px' | 'percent-to-rem' | 'rem-to-em';

export const RemToPxTool: React.FC<Props> = ({ notify }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [conversionCount, setConversionCount] = useState(0);
  
  // Settings
  const [baseSize, setBaseSize] = useState<number>(16);
  const [mode, setMode] = useState<ConversionMode>('rem-to-px');

  // Auto-convert when input or settings change
  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setConversionCount(0);
      return;
    }
    convertValues();
  }, [input, baseSize, mode]);

  const convertValues = () => {
    try {
      let count = 0;
      let converted = input;

      // Helper to format float
      const fmt = (num: number) => {
        return num % 1 === 0 ? num.toString() : num.toFixed(3).replace(/\.?0+$/, '');
      };

      if (mode === 'rem-to-px') {
        // Match rem values: 1rem, 0.5rem, .5rem
        converted = input.replace(/(\d*\.?\d+)rem\b/gi, (match, value) => {
          count++;
          const pxVal = parseFloat(value) * baseSize;
          return `${fmt(pxVal)}px`;
        });
      } else if (mode === 'px-to-rem') {
        // Match px values: 16px, 12px
        converted = input.replace(/(\d*\.?\d+)px\b/gi, (match, value) => {
          count++;
          const remVal = parseFloat(value) / baseSize;
          return `${fmt(remVal)}rem`;
        });
      } else if (mode === 'percent-to-px') {
        // Match % values: 100%, 50%
        // Assuming 100% = baseSize
        converted = input.replace(/(\d*\.?\d+)%/gi, (match, value) => {
          count++;
          const pxVal = (parseFloat(value) / 100) * baseSize;
          return `${fmt(pxVal)}px`;
        });
      } else if (mode === 'percent-to-rem') {
        // Match % values: 100%, 50%
        // Assuming 100% = 1rem
        converted = input.replace(/(\d*\.?\d+)%/gi, (match, value) => {
          count++;
          const remVal = parseFloat(value) / 100;
          return `${fmt(remVal)}rem`;
        });
      } else if (mode === 'rem-to-em') {
         // rem to em is typically 1:1 in a vacuum, but users might find it useful to just swap units
         converted = input.replace(/(\d*\.?\d+)rem\b/gi, (match, value) => {
          count++;
          return `${value}em`;
        });
      }

      setOutput(converted);
      setConversionCount(count);
    } catch (e) {
      console.error(e);
      // Fail silently for auto-convert, or log
    }
  };

  const handleCopy = () => {
    copyToClipboard(output);
    notify("Copied to clipboard!", "success");
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setConversionCount(0);
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Configuration Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-end">
         <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
             <Select 
                label="Conversion Mode" 
                value={mode} 
                onChange={(e) => setMode(e.target.value as ConversionMode)}
             >
                 <option value="rem-to-px">REM → PX</option>
                 <option value="px-to-rem">PX → REM</option>
                 <option value="percent-to-px">% → PX (100% = Base)</option>
                 <option value="percent-to-rem">% → REM (100% = 1rem)</option>
                 <option value="rem-to-em">REM → EM</option>
             </Select>
             <Input 
                label={`Base Pixel Size (${baseSize}px)`}
                type="number" 
                value={baseSize} 
                onChange={(e) => setBaseSize(Number(e.target.value))}
                min={1}
             />
         </div>
      </Card>

      <div className="flex flex-col md:flex-row gap-6 h-full min-h-[500px]">
          {/* Input Side */}
          <Card className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Input Source</h3>
              <button onClick={handleClear} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors">
                <Trash2 size={12} /> Clear
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste CSS or HTML here..."
              className="flex-1 w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 rounded-md p-4 text-xs font-mono focus:outline-none focus:border-accent-500 resize-none leading-relaxed transition-colors placeholder:text-gray-400 dark:placeholder:text-neutral-700"
            />
          </Card>

          {/* Output Side */}
          <Card className="flex-1 flex flex-col bg-gray-50/50 dark:bg-[#181818]/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Output Result</h3>
              {conversionCount > 0 && (
                <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-900/30">
                  {conversionCount} changes
                </span>
              )}
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Converted code will appear here..."
              className="flex-1 w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 rounded-md p-4 text-xs font-mono focus:outline-none focus:border-accent-500 resize-none leading-relaxed text-gray-700 dark:text-neutral-300 transition-colors"
            />
            <div className="pt-4">
              <Button variant="secondary" onClick={handleCopy} className="w-full" disabled={!output}>
                <Copy size={16} className="mr-2" /> Copy to Clipboard
              </Button>
            </div>
          </Card>
      </div>
    </div>
  );
};