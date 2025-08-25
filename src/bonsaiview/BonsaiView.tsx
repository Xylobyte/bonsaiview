import "./BonsaiView.scss"
import { memo, type ReactElement, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import type { BonsaiViewProps, TreeItem } from "./types.ts"
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso"
import * as React from "react"
import BaseItem from "./BaseItem.tsx"
import { classNames } from "../utils/class-names.ts"

/**
 * # BonsaiView
 * React component that renders a performant and powerful tree view.
 *
 * @param {BonsaiViewProps} props - The properties that configure the tree view.
 * @returns {ReactElement} A `<div>` wrapper (you should replace this with your actual markup).
 */
function BonsaiView(props: BonsaiViewProps): ReactElement {
    const componentId = useRef(crypto.randomUUID())

    const [treeMap, setTreeMap] = useState<Record<string, TreeItem>>({})
    const [treeParentMap, setTreeParentMap] = useState<Record<string, TreeItem[]>>({})
    const [parentDepth, setParentDepth] = useState<Record<string, number>>({})
    const [openedIds, setOpenedIds] = useState(new Set<string>())
    const [actualSelection, setActualSelection] = useState<string>()
    const [startSelection, setStartSelection] = useState<string>()
    const [secondarySelection, setSecondarySelection] = useState<string[]>()

    const virtualList = useRef<VirtuosoHandle>(null)

    const dragHash = useRef<string>(null)
    const dragId = useRef<string>(null)
    const hoveredDropZone = useRef<Element>(null)
    const canDrop = useRef<boolean>(true)

    const visibleTree = useMemo(() => {
        const t: TreeItem[] = [...(treeParentMap[props.rootId] || [])]
        let i = 0
        while (i < t.length) {
            const item = t[i]
            if (openedIds.has(item.id)) {
                t.splice(i + 1, 0, ...(treeParentMap[item.id] || []))
            }
            i++
        }
        t.push({
            id: "xxx-footer-empty",
            parent: props.rootId,
            text: "",
            isFolder: false,
            canDrag: false,
        })
        return t
    }, [props.rootId, openedIds, treeParentMap])

    useEffect(() => {
        const parentMap: Record<string, TreeItem[]> = {}
        const tMap: Record<string, TreeItem> = {}
        const depthList: Record<string, number> = {}
        depthList[props.rootId] = 0

        props.tree.forEach((item) => {
            tMap[item.id] = item
            parentMap[item.parent] ??= []
            parentMap[item.parent].push(item)
        })

        if (props.folderOnTop) {
            for (const key in parentMap) {
                parentMap[key].sort((a, b) => {
                    if (a.isFolder === b.isFolder) return 0
                    return a.isFolder ? -1 : 1
                })
            }
        }

        Object.keys(parentMap).forEach((key) => {
            let depth = 0
            let folder = key
            while (folder !== props.rootId && folder) {
                folder = tMap[folder]?.parent
                depth++
            }
            depthList[key] = depth
        })

        setTreeMap(tMap)
        setTreeParentMap(parentMap)
        setParentDepth(depthList)
    }, [props.tree, props.rootId, props.folderOnTop])

    const selectItem = (id: string | undefined, autoScroll: boolean = true, expandFolders: boolean = true) => {
        if (!id) {
            setActualSelection(undefined)
            setSecondarySelection(undefined)
            setStartSelection(undefined)
            props.onSecondarySelectionChange?.([])
            props.onSelectionChange?.(undefined)
            return true
        }
        let item = treeMap[id]
        if (!item) return false
        if (item.isFolder) {
            item = treeParentMap[id][0]
            id = item.id
        }

        if (expandFolders) {
            setOpenedIds((o) => {
                let pId = item.parent
                while (pId !== props.rootId && pId) {
                    o.add(pId)
                    pId = treeMap[pId]?.parent
                }
                return new Set(o)
            })
        }

        if (props.useSelection) {
            props.onSelectionChange?.(item)
            if (!item.isFolder) setActualSelection(id)
            setStartSelection(id)
            setSecondarySelection([id])
        }

        if (autoScroll) {
            const index = visibleTree.findIndex((i) => i.id === id)
            if (index >= 0) {
                virtualList.current?.scrollToIndex({ index, behavior: "smooth", align: "center" })
            }
        }

        return true
    }

    const expandAll = () => {
        setOpenedIds((o) => {
            const parents = Object.keys(treeParentMap)
            parents.forEach((key) => key !== props.rootId && o.add(key))
            return new Set(o)
        })
    }

    const collapseAll = () => {
        setOpenedIds(new Set<string>())
    }

    const toggleItem = (id: string, skipCheck = false) => {
        if (!treeParentMap[id] && !skipCheck) return
        setOpenedIds((old) => {
            if (old.has(id)) old.delete(id)
            else old.add(id)
            return new Set(old)
        })
    }

    useImperativeHandle(props.ref, () => ({ selectItem, expandAll, collapseAll, toggleItem }), [
        props.rootId,
        treeMap,
        visibleTree,
        props.useSelection,
        props.onSelectionChange,
    ])

    const handleDragEnd = (e: React.DragEvent) => {
        if (hoveredDropZone.current && e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) {
            hoveredDropZone.current.classList.remove("focused")
            hoveredDropZone.current = null
        }
    }

    const handleDragOver = useCallback(
        (e: React.DragEvent) => {
            const mainDiv = document.getElementById(componentId.current)
            if (!mainDiv) return
            e.preventDefault()

            const dropZones = mainDiv.querySelectorAll(":scope .tree-drop-zone, .tree-item > div.folder:not(.disabled)")
            let dropZone: Element | null = null
            let minDistance = Infinity
            for (const dz of dropZones) {
                const rect = dz.getBoundingClientRect()
                const mouseY = e.pageY
                const distance = Math.min(Math.abs(rect.top - mouseY), Math.abs(rect.bottom - mouseY))
                if (distance < minDistance) {
                    minDistance = distance
                    dropZone = dz
                } else break
            }

            if (dropZone && dropZone !== hoveredDropZone.current) {
                if (!e.dataTransfer.types.includes(dragHash.current || "")) {
                    if (!props.useExternalDrop) {
                        e.dataTransfer.dropEffect = "none"
                        canDrop.current = false
                        return
                    }
                    dragId.current = null
                    dragHash.current = null
                    setStartSelection(undefined)
                    setSecondarySelection(undefined)
                }
                if (hoveredDropZone.current) hoveredDropZone.current.classList.remove("focused")
                if (!dropZone.classList.contains("focused")) {
                    if (checkCanDrop(dropZone)) {
                        dropZone.classList.add("focused")
                        canDrop.current = true
                    } else canDrop.current = false
                    hoveredDropZone.current = dropZone
                }
            }
        },
        [visibleTree, treeMap, props.useExternalDrop, secondarySelection],
    )

    const checkCanDrop = (targetEl: Element, dId?: string) => {
        const zoneIndex = parseInt(targetEl.getAttribute("data-index") || "0")
        const target = visibleTree[zoneIndex]
        const isFolder = targetEl.classList.contains("folder") && target.isFolder

        if (!dragId.current && !dId) return props.canDrop?.(undefined, target) ?? true

        let parent = isFolder ? target.id : target.parent
        while (parent !== (dId || dragId.current) && parent !== props.rootId) {
            parent = treeMap[parent]?.parent || props.rootId
        }
        if (
            parent !== props.rootId ||
            target.id === (dId || dragId.current) ||
            secondarySelection?.includes(target.id)
        ) {
            return false
        } else {
            return props.canDrop?.(treeMap[dId || dragId.current!], isFolder ? target : treeMap[target.parent]) ?? true
        }
    }

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            if (!hoveredDropZone.current || !canDrop.current) return
            hoveredDropZone.current.classList.remove("focused")

            const dropId = e.dataTransfer.getData(dragHash.current || "")
            const after = hoveredDropZone.current.getAttribute("data-after") === "true"
            if (!treeMap[dropId]) {
                if (props.useExternalDrop) props.onExternalDrop?.(e.dataTransfer, treeMap[dropId], after)
                return
            }
            if (!checkCanDrop(hoveredDropZone.current, dropId)) return

            e.preventDefault()
            const filtered = props.tree.filter(
                (item) =>
                    item.id !== dropId &&
                    ((secondarySelection?.length || 0) > 1 ? !secondarySelection?.includes(item.id) : true),
            )
            const index = hoveredDropZone.current.getAttribute("data-index") || "0"
            const target = visibleTree[parseInt(index)]
            const isFolder = target.isFolder && hoveredDropZone.current.classList.contains("folder")
            const iOfDrop = (filtered.findIndex((i) => i.id === target.id) || 0) + (after ? 1 : 0)
            const newItems =
                (secondarySelection?.length || 0) > 1
                    ? secondarySelection?.map((id) => ({
                          ...treeMap[id],
                          parent: isFolder ? target.id : target.parent,
                      })) || []
                    : [
                          {
                              ...treeMap[dropId],
                              parent: isFolder ? target.id : target.parent,
                          },
                      ]
            filtered.splice(isFolder ? 0 : iOfDrop, 0, ...newItems)

            props.onDrop?.(filtered)
            hoveredDropZone.current = null
        },
        [props.tree, treeMap, visibleTree, props.useExternalDrop, secondarySelection],
    )

    const onSelectionStart = useCallback(
        (id: string) => {
            const item = treeMap[id]
            if (item.isFolder) {
                toggleItem(id, true)
            } else if (props.useSelection) {
                props.onSelectionChange?.(item)
                setActualSelection(id)
            }
            setStartSelection(id)
            setSecondarySelection([id])
            props.onSecondarySelectionChange?.([item])
        },
        [treeMap, props.useSelection, props.onSelectionChange, props.onSecondarySelectionChange],
    )

    const onSelectionEnd = useCallback(
        (id: string, index: number, unique: boolean) => {
            if (id === startSelection) return

            if (unique) {
                if (!treeMap[id].canDrag) return
                const selection = [...(secondarySelection || [])]
                const i = selection.findIndex((s) => s === id)
                if (i !== -1) selection.splice(i, 1)
                else selection.push(id)
                setSecondarySelection(selection)
                props.onSecondarySelectionChange?.(selection.map((i) => treeMap[i]))
            } else {
                const selectedItems: TreeItem[] = []
                let startI = visibleTree.findIndex((item) => item.id === startSelection)
                const diff = startI - index
                while (startI !== index) {
                    const item = visibleTree[startI]
                    if (item.canDrag) selectedItems.push(item)
                    startI += diff > 0 ? -1 : 1
                }
                selectedItems.push(visibleTree[index])
                setSecondarySelection(selectedItems.map((i) => i.id))
                props.onSecondarySelectionChange?.(selectedItems)
            }
        },
        [props.onSecondarySelectionChange, visibleTree, startSelection, secondarySelection],
    )

    const onDragStart = useCallback(
        (e: React.DragEvent, id: string, hash: string) => {
            if (!secondarySelection) return

            dragId.current = id
            dragHash.current = hash
            let isSingle = secondarySelection.length === 1

            if (!secondarySelection.includes(id) && startSelection) {
                setStartSelection(id)
                setSecondarySelection([id])
                props.onSecondarySelectionChange?.([treeMap[id]])
                isSingle = true
            }

            const baseCanvas = document.getElementById("bonsaiview-drag-canvas")
            const canvas = (baseCanvas as HTMLCanvasElement) || document.createElement("canvas")
            canvas.id = "bonsaiview-drag-canvas"
            canvas.style.position = "absolute"
            canvas.style.left = "-100%"
            canvas.style.zIndex = "-100"
            canvas.width = 300
            canvas.height = 80
            if (!baseCanvas) document.body.appendChild(canvas)

            const ctx = canvas.getContext("2d")
            if (!ctx) return

            const styles = getComputedStyle(document.body)
            const round = 8
            ctx.fillStyle = styles.getPropertyValue("--bonsaiview-primary-color")
            console.log(round, ctx.fillStyle)
            ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 3
            ctx.shadowBlur = 4
            if (!isSingle) {
                ctx.beginPath()
                ctx.roundRect(60, 44, 180, 24, round)
                ctx.fill()
                ctx.beginPath()
                ctx.roundRect(55, 34, 190, 28, round)
                ctx.fill()
            }
            ctx.beginPath()
            ctx.roundRect(50, 24, 200, 32, round)
            ctx.fill()

            ctx.fillStyle = styles.getPropertyValue("--bonsaiview-on-primary-color")
            ctx.font = "bold 16px nunito"
            ctx.fillText("x" + (isSingle ? 1 : secondarySelection.length), 200, 45)

            e.dataTransfer.setDragImage(canvas, 60, 16)
        },
        [secondarySelection, startSelection, treeMap],
    )

    const itemContent = useCallback(
        (i: number, item: TreeItem) =>
            item.id === "xxx-footer-empty" ? (
                <div className="bonsaiview-footer-padding"></div>
            ) : (
                <BaseItem
                    key={item.id}
                    depth={parentDepth[item.parent]}
                    opened={openedIds.has(item.id)}
                    selected={actualSelection === item.id}
                    focused={
                        (item.isFolder || (secondarySelection?.length || 0) > 1) &&
                        !!secondarySelection?.includes(item.id)
                    }
                    index={i}
                    isLastOfFolder={
                        (parentDepth[visibleTree[i + 1].parent] ?? -1) < parentDepth[item.parent] ||
                        i === visibleTree.length - 2
                    }
                    item={item}
                    childCount={(item.isFolder && treeParentMap[item.id]?.length) || null}
                    renderItem={props.renderItem}
                    onSelectionStart={onSelectionStart}
                    onSelectionEnd={onSelectionEnd}
                    onDragStart={onDragStart}
                />
            ),
        [
            parentDepth,
            openedIds,
            actualSelection,
            visibleTree,
            props.renderItem,
            onSelectionStart,
            onSelectionEnd,
            onDragStart,
            secondarySelection,
        ],
    )

    return (
        <Virtuoso
            id={componentId.current}
            onDragOver={handleDragOver}
            onDragLeave={handleDragEnd}
            onDrop={handleDrop}
            ref={virtualList}
            className={classNames("bonsaiview-base-container", props.className)}
            data={visibleTree}
            itemContent={itemContent}
            role="tree"
        />
    )
}

export default memo(BonsaiView)
