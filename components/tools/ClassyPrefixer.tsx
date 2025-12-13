import React, { useState, useEffect } from 'react';
import { Type, Copy, CheckCircle } from 'lucide-react';
import { Card, Button, Input } from '../Common';
import { copyToClipboard } from '../../utils';
import { NotificationType } from '../../types';

interface Props {
  notify: (msg: string, type?: NotificationType) => void;
}

export const ClassyPrefixerTool: React.FC<Props> = ({ notify }) => {
  const [htmlInput, setHtmlInput] = useState<string>('');
  const [htmlOutput, setHtmlOutput] = useState<string>('');
  const [prefix, setPrefix] = useState<string>('prefix-');
  const [excludeCommon, setExcludeCommon] = useState<boolean>(false);
  const [stats, setStats] = useState({ htmlClasses: 0, cssSelectors: 0, excludedClasses: 0 });

  const commonLibraryClasses = new Set([
    'container', 'row', 'col', 'btn', 'button', 'form', 'input', 'select', 
    'textarea', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'nav', 'navbar',
    'dropdown', 'modal', 'alert', 'badge', 'card', 'header', 'footer', 'sidebar',
    'main', 'section', 'article', 'aside', 'figure', 'figcaption', 'blockquote',
    'list', 'item', 'link', 'text', 'title', 'subtitle', 'description', 'content',
    'wrapper', 'inner', 'outer', 'left', 'right', 'center', 'top', 'bottom',
    'show', 'hide', 'visible', 'hidden', 'active', 'inactive', 'disabled', 'enabled'
  ]);

  const shouldExcludeClass = (className: string) => {
    if (!excludeCommon) return false;
    return commonLibraryClasses.has(className.toLowerCase());
  };

  // Process CSS content in <style>
  const processCSSContent = (cssContent: string, currentPrefix: string, currentStats: any) => {
    const urlPlaceholders: string[] = [];
    let urlIndex = 0;
    
    // Protect URLs
    let protectedCSS = cssContent.replace(/url\s*\([^)]*\)/gi, (match) => {
      const placeholder = `__URL_PLACEHOLDER_${urlIndex}__`;
      urlPlaceholders[urlIndex] = match;
      urlIndex++;
      return placeholder;
    });
    
    // Process selectors
    protectedCSS = protectedCSS.replace(/(\.)([a-zA-Z_-][a-zA-Z0-9_-]*)/g, (match, dot, className) => {
      if (shouldExcludeClass(className)) {
        currentStats.excludedClasses++;
        return match;
      }
      currentStats.cssSelectors++;
      return dot + currentPrefix + className;
    });
    
    // Restore URLs
    urlPlaceholders.forEach((originalUrl, index) => {
      const placeholder = `__URL_PLACEHOLDER_${index}__`;
      protectedCSS = protectedCSS.replace(placeholder, originalUrl);
    });
    
    return protectedCSS;
  };

  // Transform HTML Logic
  const transformHTML = () => {
    if (!htmlInput.trim()) {
      setHtmlOutput('');
      setStats({ htmlClasses: 0, cssSelectors: 0, excludedClasses: 0 });
      return;
    }

    try {
      let processedHTML = htmlInput;
      const currentStats = { htmlClasses: 0, cssSelectors: 0, excludedClasses: 0 };

      // 1. Process CSS in <style>
      processedHTML = processedHTML.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, cssContent) => {
        const processedCSS = processCSSContent(cssContent, prefix, currentStats);
        return match.replace(cssContent, processedCSS);
      });

      // 2. Process HTML class attributes (skipping scripts)
      let result = '';
      let currentIndex = 0;
      let scriptTagRegex = /<script[^>]*>[\s\S]*?<\/script>/gi;
      let scriptMatch;
      
      while ((scriptMatch = scriptTagRegex.exec(processedHTML)) !== null) {
        const beforeScript = processedHTML.substring(currentIndex, scriptMatch.index);
        result += processClassAttributesInSegment(beforeScript, prefix, currentStats);
        result += scriptMatch[0];
        currentIndex = scriptMatch.index + scriptMatch[0].length;
      }
      result += processClassAttributesInSegment(processedHTML.substring(currentIndex), prefix, currentStats);

      setHtmlOutput(result);
      setStats(currentStats);
    } catch (e: any) {
        // Silent fail or minimal console log during typing
        console.error(e);
    }
  };

  const processClassAttributesInSegment = (htmlSegment: string, currentPrefix: string, currentStats: any) => {
    return htmlSegment.replace(/class\s*=\s*["']([^"']*)["']/gi, (match, classValue) => {
      const classes = classValue.split(/\s+/).filter(cls => cls.trim());
      const processedClasses = classes.map(className => {
        if (shouldExcludeClass(className)) {
          currentStats.excludedClasses++;
          return className;
        }
        currentStats.htmlClasses++;
        return currentPrefix + className;
      });
      return `class="${processedClasses.join(' ')}"`;
    });
  };

  // Auto-transform on changes
  useEffect(() => {
    transformHTML();
  }, [htmlInput, prefix, excludeCommon]);

  const handleCopy = () => {
      copyToClipboard(htmlOutput);
      notify("Transformed HTML copied!", "success");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Configuration (Top Left) */}
      <Card className="h-full">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Type size={18} className="text-gray-400" />
          Configuration
        </h3>
        <div className="space-y-4">
          <Input 
            label="Class Prefix" 
            value={prefix} 
            onChange={(e) => setPrefix(e.target.value)} 
            placeholder="e.g. my-" 
          />
          <div className="flex items-center gap-2 pt-2">
              <input 
                  type="checkbox" 
                  id="excludeCommon" 
                  checked={excludeCommon}
                  onChange={(e) => setExcludeCommon(e.target.checked)}
                  className="w-4 h-4 text-accent-600 rounded border-gray-300 focus:ring-accent-500 dark:bg-[#171717] dark:border-neutral-700"
              />
              <label htmlFor="excludeCommon" className="text-sm text-gray-600 dark:text-neutral-400 cursor-pointer select-none">
                  Exclude common framework classes (btn, container, row, etc.)
              </label>
          </div>
        </div>
      </Card>

      {/* 2. Statistics (Top Right) */}
      <Card className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-medium text-gray-900 dark:text-white">Statistics</h3>
             {htmlOutput && <div className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Success</div>}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center flex-1">
              <div className="p-3 bg-white dark:bg-[#171717] rounded-md border border-gray-200 dark:border-neutral-800 flex flex-col justify-center items-center h-full">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.htmlClasses}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Classes</div>
              </div>
              <div className="p-3 bg-white dark:bg-[#171717] rounded-md border border-gray-200 dark:border-neutral-800 flex flex-col justify-center items-center h-full">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.cssSelectors}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Selectors</div>
              </div>
              <div className="p-3 bg-white dark:bg-[#171717] rounded-md border border-gray-200 dark:border-neutral-800 flex flex-col justify-center items-center h-full">
                  <div className="text-xl font-bold text-gray-400 dark:text-neutral-500">{stats.excludedClasses}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Skipped</div>
              </div>
          </div>
      </Card>

      {/* 3. Input HTML (Bottom Left) */}
      <Card className="flex flex-col h-[600px]">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center justify-between">
              <span>Input HTML</span>
              <span className="text-[10px] text-gray-400 font-normal">Auto-processing enabled</span>
          </h3>
          <textarea 
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder='<div class="card">...</div>'
              className="flex-1 w-full bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-neutral-800 rounded-md p-3 text-xs font-mono focus:outline-none focus:border-accent-500 resize-none leading-relaxed"
          />
      </Card>

      {/* 4. Output HTML (Bottom Right) */}
      <Card className="flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-2">
               <h3 className="text-sm font-medium text-gray-900 dark:text-white">Output HTML</h3>
               <Button variant="secondary" onClick={handleCopy} disabled={!htmlOutput} className="h-7 px-2 text-xs">
                   <Copy size={12} className="mr-1" /> Copy
               </Button>
          </div>
          <textarea 
              readOnly
              value={htmlOutput}
              placeholder="Transformed code will appear here..."
              className="flex-1 w-full bg-white dark:bg-[#171717] border border-gray-200 dark:border-neutral-800 rounded-md p-3 text-xs font-mono focus:outline-none focus:border-accent-500 resize-none text-gray-600 dark:text-neutral-300 leading-relaxed"
          />
      </Card>
    </div>
  );
};