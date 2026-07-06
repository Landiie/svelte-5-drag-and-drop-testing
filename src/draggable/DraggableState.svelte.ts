import { getContext, setContext } from "svelte";

class DragRoot {
  dragHandle = false;
  items: any[] = [];
  zoneTag = $state<string | null>(null);
  constructor(items: any[]) {
    this.items = items;
  }
}

const DRAG_SYMBOL = Symbol("drag");

export function getState() {
  return getContext(DRAG_SYMBOL) as DragRoot;
}

export function setState(items: any[]) {
  return setContext(DRAG_SYMBOL, new DragRoot(items));
}
