import type { TreeItem, TreeViewRef } from "./bonsaiview/types.ts"
import { useRef, useState } from "react"
import BonsaiView from "./bonsaiview/BonsaiView.tsx"

/**
 * Example data for testing
 */
const initialTree: TreeItem[] = [
    {
        id: "root",
        parent: "root",
        text: "Mon Projet",
        isFolder: true,
        canDrag: true,
        data: { type: "project" },
    },
    {
        id: "src",
        parent: "root",
        text: "src",
        isFolder: true,
        canDrag: true,
        data: { type: "folder" },
    },
    {
        id: "docs",
        parent: "root",
        text: "docs",
        isFolder: true,
        canDrag: true,
        data: { type: "folder" },
    },
    {
        id: "tests",
        parent: "root",
        text: "tests",
        isFolder: true,
        canDrag: true,
        data: { type: "folder" },
    },
    {
        id: "src/components",
        parent: "src",
        text: "components",
        isFolder: true,
        canDrag: true,
        data: { type: "folder" },
    },
    {
        id: "src/utils",
        parent: "src",
        text: "utils",
        isFolder: true,
        canDrag: true,
        data: { type: "folder" },
    },
    {
        id: "src/App.tsx",
        parent: "src",
        text: "App.tsx",
        isFolder: false,
        canDrag: true,
        data: { type: "file", language: "tsx" },
    },
    {
        id: "src/index.tsx",
        parent: "src",
        text: "index.tsx",
        isFolder: false,
        canDrag: true,
        data: { type: "file", language: "tsx" },
    },

    /* ------------- components ------------- */
    {
        id: "src/components/Header.tsx",
        parent: "src/components",
        text: "Header.tsx",
        isFolder: false,
        canDrag: true,
        data: { type: "file", language: "tsx" },
    },
    {
        id: "src/components/Footer.tsx",
        parent: "src/components",
        text: "Footer.tsx",
        isFolder: false,
        canDrag: true,
        data: { type: "file", language: "tsx" },
    },
    {
        id: "src/components/Button",
        parent: "src/components",
        text: "Button",
        isFolder: true,
        canDrag: true,
        data: { type: "folder" },
    },
    {
        id: "src/components/Button/Button.tsx",
        parent: "src/components/Button",
        text: "Button.tsx",
        isFolder: false,
        canDrag: true,
        data: { type: "file", language: "tsx" },
    },
    {
        id: "src/components/Button/Button.css",
        parent: "src/components/Button",
        text: "Button.css",
        isFolder: false,
        canDrag: true,
        data: { type: "file", language: "css" },
    },
    {
        id: "src/utils/helpers.ts",
        parent: "src/utils",
        text: "helpers.ts",
        isFolder: false,
        canDrag: true,
        data: { type: "file", language: "ts" },
    },
    {
        id: "src/utils/constants.ts",
        parent: "src/utils",
        text: "constants.ts",
        isFolder: false,
        canDrag: true,
        data: { type: "file", language: "ts" },
    },
    {
        id: "docs/README.md",
        parent: "docs",
        text: "README.md",
        isFolder: false,
        canDrag: true,
        data: { type: "file", language: "markdown" },
    },
    {
        id: "docs/API.md",
        parent: "docs",
        text: "API.md",
        isFolder: false,
        canDrag: true,
        data: { type: "file", language: "markdown" },
    },
    {
        id: "tests/App.test.tsx",
        parent: "tests",
        text: "App.test.tsx",
        isFolder: false,
        canDrag: true,
        data: { type: "file", language: "tsx" },
    },
    {
        id: "tests/utils.test.ts",
        parent: "tests",
        text: "utils.test.ts",
        isFolder: false,
        canDrag: true,
        data: { type: "file", language: "ts" },
    },
]

export default function App() {
    const [tree, setTree] = useState<TreeItem[]>(initialTree)
    const treeviewRef = useRef<TreeViewRef>(null)

    const handleDrop = (newTree: TreeItem[]) => {
        setTree(newTree)
    }

    return (
        <BonsaiView
            tree={tree}
            rootId="root"
            depthStepSize={30}
            renderItem={(item) => (
                <div>
                    {item.isFolder ? "📁" : "📄"} {item.text}
                </div>
            )}
            onDrop={handleDrop}
            useSelection={true}
            onSelectionChange={console.log}
            ref={treeviewRef}
        />
    )
}
