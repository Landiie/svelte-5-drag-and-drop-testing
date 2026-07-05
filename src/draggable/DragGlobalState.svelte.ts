import { getContext, onMount, setContext } from "svelte";
import { arrayMove, arrayMoveToArray } from "../utils";
const DRAG_DEADZONE_X = 5;
const DRAG_DEADZONE_Y = 5;

const SYMBOL = Symbol("drag_global");

const dragVanityElm = document.createElement("div");
dragVanityElm.classList.add("drag-vanity");
document.body.append(dragVanityElm);

class DragGlobalState {
  mDownListItemIndex = $state<number | null>(null);
  mDownListItemOrigin = $state<any[] | null>(null);
  mDownElm = $state<HTMLElement | null>(null);

  mDownOriginX = -1;
  mDownOriginY = -1;

  clientX = $state(-1);
  clientY = $state(-1);

  isDragging = $state(false);
  draggingHalf = $state<"top" | "bottom" | null>(null);
  draggingCloneElm = $state<HTMLElement | null>(null);

  hoverListItemIndex = $state<number | null>(null);
  hoverListItemOrigin = $state<any[] | null>(null);

  mouseDownOnItem(e: MouseEvent, itemIndex: number, itemOriginArr: any[], itemElm: HTMLElement) {
    if (e.button !== 0) {
      e.preventDefault();
      return;
    }
    // this.mDownOnItemId = itemId;
    this.mDownListItemIndex = itemIndex;
    this.mDownListItemOrigin = itemOriginArr;
    this.mDownElm = itemElm;
    this.mDownOriginX = e.clientX;
    this.mDownOriginY = e.clientY;
  }

  #isDraggingItemInSameContext() {
    return this.mDownListItemOrigin === this.hoverListItemOrigin;
  }

  #isDraggingItemInSamePlace() {
    return this.mDownListItemIndex === this.hoverListItemIndex && this.#isDraggingItemInSameContext();
  }

  #isDraggingItemDirectlyAboveItself() {
    if (this.mDownListItemIndex === null) return false;
    return this.mDownListItemIndex - 1 === this.hoverListItemIndex && this.#isDraggingItemInSameContext();
  }

  #isDraggingItemDirectlyBelowItself() {
    if (this.mDownListItemIndex === null) return false;
    return this.mDownListItemIndex + 1 === this.hoverListItemIndex && this.#isDraggingItemInSameContext();
  }

  resetDragState() {
    this.mDownElm = null;
    this.mDownListItemIndex = null;
    this.mDownListItemOrigin = null;
    this.hoverListItemIndex = null;
    this.hoverListItemOrigin = null;
    this.isDragging = false;
    document.body.style.cursor = "default";
    if (!this.draggingCloneElm) return;
    dragVanityElm.removeChild(this.draggingCloneElm);
    this.draggingCloneElm = null;
  }
  constructor() {
    document.addEventListener("mouseup", (e: MouseEvent) => {
      if (e.button !== 0) {
        e.preventDefault();
        return;
      }
      //process drop target if any
      if (
        this.isDragging &&
        this.hoverListItemIndex !== null &&
        this.hoverListItemOrigin !== null &&
        this.mDownListItemIndex !== null &&
        this.mDownListItemOrigin !== null
      ) {
        if (
          this.#isDraggingItemInSamePlace() ||
          (this.#isDraggingItemDirectlyAboveItself() && this.draggingHalf === "bottom") ||
          (this.#isDraggingItemDirectlyBelowItself() && this.draggingHalf === "top") ||
          this.draggingHalf === null
        ) {
          this.resetDragState();
          return; //don't run on dropping in place
        }

        console.log("dropped!");
        let offset = 0;
        if (this.hoverListItemIndex < this.mDownListItemIndex) offset = 1;
        if (this.draggingHalf === "bottom") {
          //fancy thing just changing which function to use if dragging across contexts or not
          this.#isDraggingItemInSameContext()
            ? arrayMove(this.mDownListItemOrigin, this.mDownListItemIndex, this.hoverListItemIndex + offset)
            : arrayMoveToArray(
                this.mDownListItemOrigin,
                this.mDownListItemIndex,
                this.hoverListItemOrigin,
                this.hoverListItemIndex + offset,
              );

          //   console.log("bottom", dragState.mouseDownOnItemIndex, dragState.activeHoverItemIndex + offset);
        } else {
          this.#isDraggingItemInSameContext()
            ? arrayMove(this.mDownListItemOrigin, this.mDownListItemIndex, this.hoverListItemIndex + offset - 1)
            : arrayMoveToArray(
                this.mDownListItemOrigin,
                this.mDownListItemIndex,
                this.hoverListItemOrigin,
                this.hoverListItemIndex + offset - 1,
              );
          //   console.log("top", dragState.mouseDownOnItemIndex, dragState.activeHoverItemIndex + offset - 1);
        }
      }
      this.resetDragState();
    });
    document.addEventListener("mousemove", (e: MouseEvent) => {
      this.clientX = e.pageX;
      this.clientY = e.pageY;

      //   console.log(dragState.dragHandle, dragState.mouseDownOnDragHandle);
      //   if (dragState.dragHandle && !dragState.mouseDownOnDragHandle) return;
      if (this.mDownListItemIndex === null || this.isDragging) return;
      // console.log(e)
      if (
        e.pageX > this.mDownOriginX + DRAG_DEADZONE_X ||
        e.pageX < this.mDownOriginX - DRAG_DEADZONE_X ||
        e.pageY > this.mDownOriginY + DRAG_DEADZONE_Y ||
        e.pageY < this.mDownOriginY - DRAG_DEADZONE_Y
      ) {
        this.isDragging = true;
      }
    });

    //we can't normally use effects in non-component files, but effect.root allows us to!!
    $effect.root(() => {
      //determines if a clone should be made
      $effect(() => {
        if (this.mDownElm === null || !this.isDragging || this.draggingCloneElm !== null) return;
        console.log("make clone");
        document.body.style.cursor = "move";
        this.draggingCloneElm = this.mDownElm.cloneNode(true) as HTMLElement;
        dragVanityElm.appendChild(this.draggingCloneElm);
      });

      //updates clone position
      $effect(() => {
        if (this.draggingCloneElm === null) return;
        dragVanityElm.style.top = this.clientY + "px";
        dragVanityElm.style.left = this.clientX + "px";
      });
    });
  }
}

export const globalDragState = new DragGlobalState();
