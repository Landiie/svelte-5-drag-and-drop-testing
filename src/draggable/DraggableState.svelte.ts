import { getContext, setContext } from "svelte";

class DragRoot {
  holdXOrigin = -1;
  holdYOrigin = -1;
  mouseDownOnItemId = $state<null | number>(null);
  mouseDownOnItemIndex = $state<null | number>(null);
  mouseDownOnItemElm = $state<null | HTMLElement>(null);
  activeDragItemId = $state<null | number>(null);
  activeDragItemElm = $state<null | HTMLElement>(null);
  activeHoverItemId = $state<null | number>(null);
  activeHoverItemIndex = $state<null | number>(null);
  placeholderPosition = $state<"top"|"bottom"|null>(null);

  // activeDragZoneId = $state<null | string>(null);
  items: any[] = [];

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
