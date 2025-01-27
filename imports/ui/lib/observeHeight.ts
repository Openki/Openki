import { debounce } from "lodash";

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
    } else {
      // browser support fallback
      obj.addEventListener("DOMNodeInserted", callback, false);
      obj.addEventListener("DOMNodeRemoved", callback, false);
    }
  };
})();

/** Observe the height of a element */
export function observeSize(element: Element, onChange: (element: Element) => void) {
  const handleChange = debounce(onChange, 100);
  const resizeObserver = new ResizeObserver(() => {
    handleChange(element);
  });
  resizeObserver.observe(element);
  observeDOM(element, () => {
    handleChange(element);
  });
}
