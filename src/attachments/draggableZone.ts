export function draggableZone(list: any[], setActiveDraggedItemId: (id: string | null) => void) {
  return (element: HTMLElement) => {
    //console.log("attachment element", element, list);
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

    let dragClone: HTMLElement | null = null;
    let dragOverTargetOld: HTMLElement | null = null;
    let dragTarget: HTMLElement | null = null;
    let placeholderElm: HTMLElement | null = null;

    // let leaveBufferTimeout: number | null = null;

    const makePlaceholder = () => {
      const placeholder = document.createElement("li");
      placeholder.classList.add("dnd-placeholder");
      placeholder.style.height = `${0}px`;
      return placeholder;
    };

    const itemElementOnClick = (e: Event) => {
      console.log("clicked", e);
    };

    const itemElementOnDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLElement == false) return;
      if (e.dataTransfer == null) return;
      e.dataTransfer.setDragImage(img, 0, 0);
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.clearData();
      e.dataTransfer.setData("item", e.target.id);
      setActiveDraggedItemId(e.target.id);
      dragClone = e.target.cloneNode(true) as HTMLElement;
      dragClone.classList.add("dnd-dragging");
      dragClone.style.position = "absolute";
      dragClone.style.pointerEvents = "none"; //without this, we drop the original element because it gets hijacked by the clone
      dragClone.style.top = e.pageY.toString() + "px";
      dragClone.style.left = e.pageX.toString() + "px";
      element.appendChild(dragClone);
      dragTarget = e.target;
    };

    const itemElementOnDrag = (e: DragEvent) => {
      if (dragClone === null) return;
      dragClone.style.top = e.pageY.toString() + "px";
      dragClone.style.left = e.pageX.toString() + "px";
    };
    const itemElementOnDragEnd = (e: DragEvent) => {
      e.preventDefault();
      setActiveDraggedItemId(null);
      dragClone?.remove();
      // placeholderElm?.remove();
      // placeholderElm = null;
    };

    const itemElementPrep = (itemElm: HTMLElement) => {
      if (itemElm === placeholderElm) return;
      if (itemElm.getAttribute("draggable") !== "true") {
        itemElm.setAttribute("draggable", "true"); //probably is getting set everytime this attachment is reran, redundant.
      }
      itemElm.addEventListener("click", itemElementOnClick);
      itemElm.addEventListener("dragstart", itemElementOnDragStart);
      itemElm.addEventListener("drag", itemElementOnDrag);
      itemElm.addEventListener("dragend", itemElementOnDragEnd);
    };

    //used for debugging leaks
    const elementOnClick = (e: Event) => {
      console.log("list clicked!");
    };

    const elementOnDragEnter = (e: DragEvent) => {
      e.preventDefault();
    };
    const elementOnDragOver = (e: DragEvent) => {
      // console.log("dragover", e.target);
      e.preventDefault();
      if (e.dataTransfer == null) return;
      if (e.target instanceof HTMLElement == false) return;
      e.dataTransfer.dropEffect = "move";

      // if (placeholderElm) {
      //   const placeholderRect = placeholderElm.getBoundingClientRect();
      //   if (placeholderRect.top <= e.clientY && placeholderRect.bottom >= e.clientY) {
      //     return;
      //   }
      // }

      // console.log(e.target.previousElementSibling)

      const hoverTarget = e.target;
      console.log("currently hovering over...", hoverTarget);

      if (dragTarget === hoverTarget) {
        console.log("hovering over the same target as being dragged, exit");
        return;
      }

      if (dragTarget === hoverTarget.previousElementSibling) {
        console.log("hovering directly underneath the same target, exit");
        return;
      }

      for (const item of element.children) {
        const itemBounds = item.getBoundingClientRect();
        // console.log(itemBottomBounds, e.clientY)
        // +1 is added to these bounds checks because there is a pixel gap that allows
        // a valid bounds check, but isn't hovering over the next target
        if (itemBounds.bottom >= e.clientY + 1) {
          if (item === placeholderElm) return; //ignore reading the placeholder
          console.log("below a valid position!!!");
          placeholderElm?.remove();
          placeholderElm = null;
          if (item === dragTarget) return;
          if (placeholderElm === null) {
            placeholderElm = makePlaceholder();
            element.appendChild(placeholderElm);
          }
          element.insertBefore(placeholderElm, item);
          //   // item.insertAdjacentElement("beforebegin", placeholderElm);
          return;
        } else {
        }
      }
      // for (const item of element.children) {
      //   if (item.getBoundingClientRect().bottom >= e.clientY) {
      //     if (item === placeholderElm) return;
      //     placeholderElm?.remove();
      //     if (item === dragTarget) return;
      //     if (placeholderElm === null) {
      //       placeholderElm = makePlaceholder();
      //       element.appendChild(placeholderElm);
      //     }
      //     element.insertBefore(placeholderElm, item);
      //     // item.insertAdjacentElement("beforebegin", placeholderElm);
      //     return;
      //   }
      // }
    };
    const elementOnDragLeave = (e: DragEvent) => {
      // there is little gaps inbetween the elements that make the placeholder
      // flicker and cause ghost-drops, so, remove placeholder when not dragging anything instead
      placeholderElm?.remove();
      placeholderElm = null;
      e.preventDefault();
    };
    const elementOnDrop = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer == null) return;
      if (e.target instanceof HTMLElement == false) return;

      const itemId = e.dataTransfer.getData("item");
      console.log(itemId);
      //no placeholder means no operation
      if (placeholderElm === null) return;
      // grabs the reference of the placeholder marker, and uses it to search
      // through the list element's children and grab it's index. Math.max is
      // used to ensure it doesn't reach into the negatives
      let placeholderIndex = Math.max(0, Array.from(element.children).indexOf(placeholderElm as Element));

      // remove the placeholder during calculations here so it doesn't influence the result below.
      // we don't need it anymore...

      placeholderElm?.remove();
      placeholderElm = null;
      // same principle as placeholderIndex, however, it uses the id fetched from the drop event's
      // dataTransfer's getData to find the element to perform the indexOf search on it with.
      const draggedItemIndex = Array.from(element.children).indexOf(element.querySelector("#" + itemId) as Element);
      // bit of a hacky way to change the placement index based on if we are dragging
      // above, or below where we originally started dragging
      if (draggedItemIndex < placeholderIndex) placeholderIndex--;

      console.log(draggedItemIndex, "-->", placeholderIndex);
      list.splice(placeholderIndex, 0, list.splice(draggedItemIndex, 1)[0]);
    };

    element.addEventListener("dragenter", elementOnDragEnter);
    element.addEventListener("dragover", elementOnDragOver);
    element.addEventListener("dragleave", elementOnDragLeave);
    element.addEventListener("drop", elementOnDrop);
    //debugging!
    element.addEventListener("click", elementOnClick);

    for (let i = 0; i < element.children.length; i++) {
      const itemElement = element.children[i] as HTMLElement;
      itemElementPrep(itemElement);
    }

    //checks for any new pushes to the dom
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement === false) return;
          // console.log("detected new node added", node);
          itemElementPrep(node);
        });
      }
    });

    observer.observe(element, { childList: true });

    //cleanup stuff, note this runs when the passed list gets updated since it is a dependancy.
    return () => {
      console.log("CLEANUP!!!");
      element.removeEventListener("dragenter", elementOnDragEnter);
      element.removeEventListener("dragover", elementOnDragOver);
      element.removeEventListener("dragleave", elementOnDragLeave);
      element.removeEventListener("drop", elementOnDrop);

      for (let i = 0; i < element.children.length; i++) {
        const itemElement = element.children[i] as HTMLElement;
        itemElement.removeEventListener("click", itemElementOnClick);
        itemElement.removeEventListener("dragstart", itemElementOnDragStart);
        itemElement.removeEventListener("drag", itemElementOnDrag);
        itemElement.removeEventListener("dragend", itemElementOnDragEnd);
      }
    };
  };
}
