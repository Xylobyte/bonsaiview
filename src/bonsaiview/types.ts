import { type ReactElement, type RefObject } from "react"

/**
 * A single node in the tree view.
 */
export type TreeItem = {
    /**
     * Unique identifier for this node.
     * Used by the tree to track the item and its selection state.
     */
    id: string

    /**
     * The parent node’s identifier.
     * For the root node, this should match {@link BonsaiViewProps.rootId}.
     */
    parent: string

    /**
     * The text that will be rendered for the node.
     */
    text: string

    /**
     * `true` if the node is a folder that can contain child nodes.
     */
    isFolder: boolean

    /**
     * Indicates whether the node can be dragged within the tree.
     */
    canDrag: boolean

    /**
     * Optional custom data that can be attached to the node.
     * It is passed unchanged through callbacks such as `onSelectionChange`.
     */
    data?: any
}

/**
 * Imperative API exposed by the tree component via a ref.
 */
export interface TreeViewRef {
    /**
     * Selects a node by its id.
     *
     * @param id - Identifier of the node to select. Pass `undefined` to clear the selection.
     * @param autoScroll - If `true`, the tree will scroll the node into view.
     * @param expandFolders - If `true`, all parent folders of the node will be expanded.
     * @returns `true` if a node was successfully selected; otherwise `false`.
     */
    selectItem: (id: string | undefined, autoScroll?: boolean, expandFolders?: boolean) => boolean

    /**
     * Expands all folders in the tree.
     */
    expandAll: () => void

    /**
     * Collapses all folders in the tree.
     */
    collapseAll: () => void

    /**
     * Toggles the open/closed state of a folder.
     *
     * @param id - Identifier of the folder to toggle.
     */
    toggleItem: (id: string) => void
}

/**
 * Render function for a single tree item.
 *
 * @param item      The {@link TreeItem} being rendered.
 * @param opened    `true` if the item's folder is currently expanded.
 * @param selected  `true` if the item is the currently selected one.
 * @param depth     The depth of the item in the tree (root = 0).
 * @param childCount The number of children the item has, or `null` if the count is unknown.
 * @returns A React element that will be rendered for this item.
 */
export type RenderItem = (
    item: TreeItem,
    opened: boolean,
    selected: boolean,
    depth: number,
    childCount: number | null,
) => ReactElement

/**
 * Props for the `BonsaiView` component.
 */
export type BonsaiViewProps = {
    /**
     * Array of all tree nodes.
     */
    tree: TreeItem[]

    /**
     * Identifier of the root node.
     */
    rootId: string

    /**
     * Function that renders each node.
     */
    renderItem: RenderItem

    /**
     * If `true`, folders are rendered before files at the same level.
     */
    folderOnTop?: boolean

    /**
     * If `true`, the component will maintain and expose a selection state.
     */
    useSelection?: boolean

    /**
     * If `true`, the component will accept drops from outside the tree.
     */
    useExternalDrop?: boolean

    /**
     * Optional validation function for drag‑and‑drop inside the tree.
     *
     * @param dropSource - The node being dragged (or `undefined` if dropping from outside).
     * @param dropTarget - The node that is the drop target.
     * @returns `true` to allow the drop, or `void` to use the default validation.
     */
    canDrop?: (dropSource: TreeItem | undefined, dropTarget: TreeItem) => boolean | void

    /**
     * Called when the selection changes.
     *
     * @param item - The selected node, or `undefined` if the selection was cleared.
     */
    onSelectionChange?: (item?: TreeItem) => void

    /**
     * Called when a secondary selection (e.g., multi‑select) changes.
     *
     * @param items - The full array of selected nodes.
     */
    onSecondarySelectionChange?: (items: TreeItem[]) => void

    /**
     * Called after a drag‑and‑drop operation inside the tree.
     *
     * @param newTree - The new flattened tree array after the drop.
     */
    onDrop?: (newTree: TreeItem[]) => void

    /**
     * Called when data is dropped from outside the tree.
     *
     * @param data - The native `DataTransfer` object.
     * @param relativeItem - The node that was hovered over during the drop.
     * @param after - `true` if the drop should insert after the hovered node.
     */
    onExternalDrop?: (data: DataTransfer, relativeItem?: TreeItem, after?: boolean) => void

    /**
     * Ref forwarded to the underlying component exposing the {@link TreeViewRef} API.
     */
    ref: RefObject<TreeViewRef | null>
}
