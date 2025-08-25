import type { TreeItem, TreeViewRef } from "./bonsaiview/types.ts"
import { useRef, useState } from "react"
import BonsaiView from "./bonsaiview/BonsaiView.tsx"

const initialTree: TreeItem[] = [
    /* your tree data */
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
            renderItem={(item, _opened, _selected, depth) => (
                <div style={{ marginLeft: depth * 20 }}>
                    {item.isFolder ? "📁" : "📄"} {item.text}
                </div>
            )}
            onDrop={handleDrop}
            useSelection
            onSelectionChange={console.log}
            ref={treeviewRef}
        />
    )
}
