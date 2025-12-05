# Developer Guide: Adding New Features

This guide explains how to add a new tool to Holo's Dashboard.

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
Open `App.tsx`. Locate the `tools` array and add your tool definition.

```tsx
// App.tsx
const tools: Tool[] = [
  // ... existing tools
  { 
      id: "your-new-tool-id", 
      label: "My New Tool", 
      icon: <SomeIcon size={18} />, 
      description: "Description of what it does.",
      category: "shopify" // or "web"
  },
];
```

## Step 4: Render the Component
Still in `App.tsx`, locate the `renderTool` switch statement and add your case.

```tsx
// App.tsx
const renderTool = (id: ToolId) => {
    switch(id) {
        // ... existing cases
        case 'your-new-tool-id': return <YourNewTool notify={notify} />;
        default: return null;
    }
};
```

## Coding Standards
1.  **UI Components**: Always use `Card`, `Button`, `Input`, etc., from `components/Common.tsx` to maintain the design system.
2.  **Colors**: Do not hardcode colors if possible. Use Tailwind classes.
    *   Inputs/Dark Backgrounds: `#171717` (mapped in Common).
    *   Accent: `text-accent-600` / `bg-accent-600`.
3.  **Responsiveness**: 
    *   Avoid fixed widths (`w-96`). Use percentages or `w-full`.
    *   For tables, wrap them in a div with `overflow-x-auto`.
