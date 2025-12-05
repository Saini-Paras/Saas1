import { ReactNode } from 'react';

// Notification Types
export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  message: string;
  type: NotificationType;
  id?: number;
}

// Tool Definition
export type ToolId = 
  | 'dashboard' 
  // Shopify Tools
  | 'tag-automation' 
  | 'json-creator' 
  | 'importer' 
  | 'extractor'
  | 'shopify-scraper'
  // Web Tools
  | 'classy-prefixer'
  | 'rem-to-px';

export type ToolCategory = 'overview' | 'shopify' | 'web';

export interface Tool {
  id: ToolId;
  label: string;
  icon: ReactNode;
  description: string;
  category: ToolCategory;
}

// Data Structures
export interface SmartCollectionRule {
  column: string;
  relation: string;
  condition: string;
}

export interface SmartCollection {
  handle: string;
  title: string;
  body_html: string;
  sort_order: string;
  rules: SmartCollectionRule[];
  url?: string;
  description?: string;
}

export interface ExtractedCollection {
  title: string;
  handle: string;
  url: string;
  description: string;
}

// Global Library Types (loaded via CDN)
declare global {
  interface Window {
    Papa: any;
    JSZip: any;
  }
}