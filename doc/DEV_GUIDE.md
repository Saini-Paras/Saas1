# Developer Guide: Adding New Features

This guide explains how to add a new tool to Holo's Dashboard using the new modular architecture.

## Step 1: Define the Tool ID
Open `types.ts` and add a unique ID to the `ToolId` type alias.

```typescript
// types.ts
export type ToolId = 
  | 'dashboard' 
  | 'existing-tool'
  | 'your-new-tool-id'; // <--- Add this
```

## Step 2: Create the Component
Create a new file in `components/tools/YourNewTool.tsx`.
It must accept `notify` as a prop if it needs to show toasts.

```tsx
import React from 'react';
import { Card, Button } from '../Common';
import { NotificationType } from '../../types';

interface Props {
  notify: (msg: string, type?: NotificationType) => void;
}

export const YourNewTool: React.FC<Props> = ({ notify }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <h3>My New Tool</h3>
        <Button onClick={() => notify('Clicked!', 'success')}>Click Me</Button>
      </Card>
    </div>
  );
};
```

## Step 3: Register the Tool Config
Open `config/tools.tsx`. Add your tool definition to the `tools` array.

```tsx
// config/tools.tsx
import { YourIcon } from 'lucide-react';

export const tools: Tool[] = [
  // ... existing tools
  { 
      id: "your-new-tool-id", 
      label: "My New Tool", 
      icon: <YourIcon size={18} />, 
      description: "Description of what it does.",
      category: "shopify" // or "web" or "builder"
  },
];
```

## Step 4: Render the Component
Open `components/ToolRenderer.tsx`. Import your component and add it to the switch statement.

```tsx
// components/ToolRenderer.tsx
import { YourNewTool } from './tools/YourNewTool';

export const ToolRenderer: React.FC<Props> = ({ activeToolId, notify, libsLoaded }) => {
  // ...
  switch(activeToolId) {
      // ... existing cases
      case 'your-new-tool-id': return <YourNewTool notify={notify} />;
      default: return <div>Tool not found</div>;
  }
};
```

## Coding Standards
1.  **UI Components**: Always use `Card`, `Button`, `Input`, etc., from `components/Common.tsx` to maintain the design system.
2.  **Colors**: Do not hardcode colors if possible. Use Tailwind classes.
    *   Inputs/Dark Backgrounds: `#171717` (mapped in Common).
    *   Accent: `text-accent-600` / `bg-accent-600`.
3.  **Ref Forwarding**: If your tool needs to focus inputs programmatically, the `Input` component now supports `ref`.
4.  **Responsiveness**: 
    *   Avoid fixed widths (`w-96`). Use percentages or `w-full`.
    *   For tables, wrap them in a div with `overflow-x-auto`.