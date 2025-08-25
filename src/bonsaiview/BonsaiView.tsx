import "./BonsaiView.scss"
import { memo, type ReactElement } from "react"
import type { BonsaiViewProps } from "./types.ts"

/**
 * # BonsaiView
 * React component that renders a performant and powerful tree view.
 *
 * @param {BonsaiViewProps} props - The properties that configure the tree view.
 * @returns {ReactElement} A `<div>` wrapper (you should replace this with your actual markup).
 */
function BonsaiView(props: BonsaiViewProps): ReactElement {
    console.log(props)

    return <div></div>
}

export default memo(BonsaiView)
