import React from 'react';
import { 
  Database, 
  FileJson, 
  Upload, 
  Link as LinkIcon, 
  FileArchive, 
  Type, 
  Scaling, 
  Layers,
  Workflow
} from 'lucide-react';
import { Tool } from '../types';

export const tools: Tool[] = [
  // Beta Workflow
  {
      id: "shopify-workflow",
      label: "Automated Workflow",
      icon: <Workflow size={18} />,
      description: "Complete pipeline: Scrape -> Tag -> Generate -> Import.",
      category: "beta"
  },
  // Shopify Tools
  { 
      id: "tag-automation", 
      label: "Tag Automation", 
      icon: <Database size={18} />, 
      description: "Auto-tag products via CSV & ZIP processing.",
      category: "shopify"
  },
  { 
      id: "json-creator", 
      label: "JSON Creator", 
      icon: <FileJson size={18} />, 
      description: "Build Smart Collection JSONs visually.",
      category: "shopify"
  },
  { 
      id: "importer", 
      label: "Collection Importer", 
      icon: <Upload size={18} />, 
      description: "Bulk upload collections via API.",
      category: "shopify"
  },
  { 
      id: "extractor", 
      label: "Collection Extractor", 
      icon: <LinkIcon size={18} />, 
      description: "Scrape public collection data.",
      category: "shopify"
  },
  {
      id: "shopify-scraper",
      label: "Shopify Bulk Scraper",
      icon: <FileArchive size={18} />,
      description: "Download products from multiple collections.",
      category: "shopify"
  },
  // Web Tools
  {
      id: "classy-prefixer",
      label: "Classy Prefixer",
      icon: <Type size={18} />,
      description: "Intelligent HTML class prefixer.",
      category: "web"
  },
  {
      id: "rem-to-px",
      label: "Rem to Px",
      icon: <Scaling size={18} />,
      description: "Convert CSS units instantly.",
      category: "web"
  },
  // Menu Builder
  {
      id: "menu-builder",
      label: "Menu Builder",
      icon: <Layers size={18} />,
      description: "Create deeply nested menus for Shopify.",
      category: "builder"
  }
];

export const categoryTitles: Record<string, string> = {
  beta: 'Beta Workflows',
  shopify: 'Shopify Tools',
  web: 'Web Dev Tools',
  builder: 'Menu Builder'
};