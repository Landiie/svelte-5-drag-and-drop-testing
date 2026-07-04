import { getContext, setContext } from "svelte";

class DragRoot {
  // for use when detecting if we should be in a dragging state or not
  holdXOrigin = -1;
  holdYOrigin = -1;

  // used for getting drag target, and element attached to said target.
  mouseDownOnItemId = $state<null | number>(null);
  mouseDownOnItemIndex = $state<null | number>(null);
  mouseDownOnItemElm = $state<null | HTMLElement>(null);

  // used to determine which elements to influence
  activeDragItemId = $state<null | number>(null);
  activeDragItemElm = $state<null | HTMLElement>(null);

  // used to determine drop position, as well as placeholder placement
  activeHoverItemId = $state<null | number>(null);
  activeHoverItemIndex = $state<null | number>(null);
  placeholderPosition = $state<"top" | "bottom" | null>(null);

  dragHandle = false;
  dragHandleElm: HTMLElement | null = null;
  mouseDownOnDragHandle = $state(false);

  isHoveringDragHandle = false;

  // activeDragZoneId = $state<null | string>(null);
  items: any[] = [];

  constructor(items: any[]) {
    this.items = items;
  }

  mouseDownOnItem(e: MouseEvent, itemId: number, itemIndex: number, itemElm: HTMLElement) {
    if (e.button !== 0) {
      e.preventDefault();
      return;
    }
    this.mouseDownOnItemId = itemId;
    this.mouseDownOnItemIndex = itemIndex;
    this.mouseDownOnItemElm = itemElm;
    this.holdXOrigin = e.clientX;
    this.holdYOrigin = e.clientY;
  }
}

const DRAG_SYMBOL = Symbol("drag");

export function getState() {
  return getContext(DRAG_SYMBOL) as DragRoot;
}

export function setState(items: any[]) {
  return setContext(DRAG_SYMBOL, new DragRoot(items));
}
