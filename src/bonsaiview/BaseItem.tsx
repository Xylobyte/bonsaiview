import React, { memo } from "react"
import type { RenderItem, TreeItem } from "./types.ts"
import { detectOS } from "../utils/get-os.ts"
import { classNames } from "../utils/class-names.ts"

export type BaseItemProps = {
    item: TreeItem
    depth: number
    opened: boolean
    selected: boolean
    focused: boolean
    renderItem: RenderItem
    depthStepSize?: number
    index: number
    childCount: number | null
    isLastOfFolder: boolean
    onSelectionStart: (id: string) => void
    onSelectionEnd: (id: string, index: number, unique: boolean) => void
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string, hash: string) => void
}

function BaseItem(props: BaseItemProps) {
    const handleClick = (e: React.MouseEvent) => {
        const os = detectOS()
        if (e.shiftKey) props.onSelectionEnd(props.item.id, props.index, false)
        else if ((os === "Mac" && e.metaKey) || ((os === "Windows" || os === "Linux") && e.ctrlKey))
            props.onSelectionEnd(props.item.id, props.index, true)
        else props.onSelectionStart(props.item.id)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            props.onSelectionStart(props.item.id)
            e.preventDefault()
        }

        if (props.item.isFolder) {
            if (e.key === "ArrowRight" && !props.opened) {
                props.onSelectionStart(props.item.id)
                e.preventDefault()
            } else if (e.key === "ArrowLeft" && props.opened) {
                props.onSelectionStart(props.item.id)
                e.preventDefault()
            }
        }
    }

    return (
        <div
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            style={{ marginLeft: (props.depthStepSize || 16) * props.depth }}
        >
            <div className="bonsaiview-drop-zone" data-index={props.index} data-after={false}></div>

            <div
                className={classNames("bonsaiview-item", props.item.isFolder && "folder", props.focused && "focused")}
                data-index={props.index}
                draggable={props.item.canDrag}
                onDragStart={(e) => {
                    e.stopPropagation()
                    const hash = crypto.randomUUID()
                    props.onDragStart(e, props.item.id, hash)
                    e.dataTransfer.clearData()
                    e.dataTransfer.setData(hash, props.item.id)
                    e.dataTransfer.effectAllowed = "move"
                }}
                role="treeitem"
                aria-selected={props.selected}
                aria-expanded={props.opened}
                tabIndex={0}
            >
                {props.renderItem(props.item, props.opened, props.selected, props.depth, props.childCount)}
            </div>

            {props.isLastOfFolder && (
                <div className="bonsaiview-drop-zone" data-index={props.index} data-after={true}></div>
            )}
        </div>
    )
}

export default memo(BaseItem)
