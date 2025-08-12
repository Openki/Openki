const observeDOM = (function () {
  const MutationObserver = window.MutationObserver || (window as any).WebKitMutationObserver;

  return function (obj: Node, callback: any) {
    if (!obj || obj.nodeType !== 1) {
      return;
    }

    if (MutationObserver) {
      // define a new observer
      const mutationObserver = new MutationObserver(callback);

      // have the observer observe for changes in children
      mutationObserver.observe(obj, { childList: true, subtree: true });

      return {
        disconnect: () => {
          mutationObserver.disconnect();
        },
      };
    } else {
      // browser support fallback
      obj.addEventListener("DOMNodeInserted", callback, false);
      obj.addEventListener("DOMNodeRemoved", callback, false);

      return {
        disconnect: () => {
          obj.removeEventListener("DOMNodeInserted", callback, false);
          obj.removeEventListener("DOMNodeRemoved", callback, false);
        },
      };
    }
  };
})();

/** Observe the height of a element */
export function observeSize(element: Element, onChange: (element: Element) => void) {
  const resizeObserver = new ResizeObserver(() => {
    onChange(element);
  });
  resizeObserver.observe(element);
  const domObserver = observeDOM(element, () => {
    onChange(element);
  });

  return {
    stop: () => {
      resizeObserver.disconnect();
      domObserver?.disconnect();
    },
  };
}
