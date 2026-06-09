/** A single node in the page component tree. */
export interface PageNode {
  /** Unique identifier for this node. */
  nodeId: string
  /** Component type name, e.g. "text", "container", "a-button". */
  type: string
  /** Props passed directly to the resolved component via v-bind. */
  props: Record<string, unknown>
  /** Optional inline CSS styles bound via :style. */
  style?: Record<string, string>
  /** Slot content keyed by slot name. Value can be PageNode[] or a plain text string. */
  slots?: Record<string, PageNode[] | string>
  /** Events to forward from this component to the script event bus. e.g. ["click", "change"] */
  events?: string[]
}

export interface ScriptFile {
  name: string
  code: string
}

/** Top-level page descriptor. */
export interface PageSchema {
  /** Schema format version for future migration. */
  version: string
  /** Page-level metadata. */
  meta: {
    title: string
    description?: string
  }
  /** Root node of the component tree. */
  root: PageNode
  /** Inline JavaScript files executed in order in the preview page. */
  inlineScripts?: ScriptFile[]
}
