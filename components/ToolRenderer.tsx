import React from 'react';
import { ToolId, NotificationType } from '../types';

// Tool Imports
import { TagAutomationTool } from './tools/TagAutomation';
import { JsonCreatorTool } from './tools/JsonCreator';
import { ImporterTool } from './tools/Importer';
import { CollectionExtractorTool } from './tools/Extractor';
import { ClassyPrefixerTool } from './tools/ClassyPrefixer';
import { RemToPxTool } from './tools/RemToPx';
import { ShopifyScraperTool } from './tools/ShopifyScraper';
import { MenuBuilderTool } from './tools/MenuBuilder';

interface Props {
  activeToolId: ToolId | null;
  notify: (msg: string, type?: NotificationType) => void;
  libsLoaded: boolean;
}

export const ToolRenderer: React.FC<Props> = ({ activeToolId, notify, libsLoaded }) => {
  if (!activeToolId) return null;

  switch(activeToolId) {
      case 'tag-automation': return <TagAutomationTool libsLoaded={libsLoaded} notify={notify} />;
      case 'json-creator': return <JsonCreatorTool notify={notify} />;
      case 'importer': return <ImporterTool notify={notify} />;
      case 'extractor': return <CollectionExtractorTool notify={notify} />;
      case 'shopify-scraper': return <ShopifyScraperTool notify={notify} libsLoaded={libsLoaded} />;
      case 'classy-prefixer': return <ClassyPrefixerTool notify={notify} />;
      case 'rem-to-px': return <RemToPxTool notify={notify} />;
      case 'menu-builder': return <MenuBuilderTool notify={notify} />;
      default: return <div>Tool not found</div>;
  }
};