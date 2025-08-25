# BonsaiView

**A fast, light and modern React TreeView with virtual scroll and a focus on optimizations and full customization.**

## Table of Contents

-  [Description](#description)
-  [Installation](#installation)
-  [Usage](#usage)
-  [Props](#props)
-  [Contributing](#contributing)
-  [License](#license)

## Description

`Bonsai‑View` is a high‑performance React component that renders hierarchical data (files / folders) with a virtualised scroll, minimal bundle size and extensive customization options.  
Key features:

-  **Virtual scrolling** – only the visible nodes are rendered, keeping memory usage low.
-  **Fast rendering** – lightweight diffing, memoised components and minimal re‑renders.
-  **Customisable** – provide your own renderers, drag‑and‑drop logic, selection behaviour, and more.
-  **Drag‑and‑Drop** – both internal and external drops are supported with validation hooks.
-  **Selection** – single or multi‑selection out of the box, with callbacks.

## Installation

```bash
# via npm
npm install bonsaiview

# or via yarn
yarn add bonsaiview

# or via pnpm
pnpm add bonsaiview
```

> **⚠️ Note**  
> The library requires React 19 or newer. No additional runtime dependencies are required.

## Usage

```tsx
import React, { useState, memo } from "react";
import BonsaiView, { BonsaiViewProps, TreeItem } from "bonsai-view";

const initialTree: TreeItem[] = [
  /* your tree data */
];

export default function App() {
  const [tree, setTree] = useState<TreeItem[]>(initialTree);

  const handleDrop = (newTree: TreeItem[]) => {
    setTree(newTree);
  };

  return (
    <BonsaiView
      tree={tree}
      rootId="root"
      renderItem={(item, { depth }) => (
        <div style={{ marginLeft: depth * 20 }}>
          {item.isFolder ? "📁" : "📄"} {item.title}
        </div>
      )}
      onDrop={handleDrop}
      useSelection
      onSelectionChange={console.log}
    />
  );
}
```

## Props

| Name                     | Type                                        | Description |
|--------------------------|---------------------------------------------|-------------|
| `tree`                   | `TreeItem[]`                                | The full tree data. |
| `rootId`                 | `string`                                    | Identifier of the root node. |
| `renderItem`             | `RenderItem`                                | Function that renders each node. |
| `folderOnTop`            | `boolean` (optional)                        | Show folders before files at the same level. |
| `useSelection`           | `boolean` (optional)                        | Enable selection state. |
| `useExternalDrop`        | `boolean` (optional)                        | Allow drops from outside the tree. |
| `canDrop`                | `(src?, tgt) => boolean \| void` (optional) | Custom validation for internal drag‑and‑drop. |
| `onSelectionChange`      | `(item?) => void` (optional)                | Called when the selection changes. |
| `onSecondarySelectionChange` | `(items) => void` (optional)                | Called when the multi‑selection changes. |
| `onDrop`                  | `(newTree) => void` (optional)              | Called after an internal drop. |
| `onExternalDrop`         | `(data, rel?, after?) => void` (optional)   | Called on an external drop. |
| `ref`                    | `RefObject<TreeViewRef                      | null>`   | Forwarded reference exposing the internal API. |

> *See the source JSDoc for detailed parameter documentation.*

## Contributing

1. Fork the repository.
2. Create a branch: `feature/<name>` or `bugfix/<id>`.
3. Update the **CHANGELOG**, and push your changes.
4. Open a pull request.

If you run into any issues or have questions, feel free to open an issue on GitHub.

## License

This project is licensed under the **MIT** license – see the [LICENSE](LICENSE) file.
