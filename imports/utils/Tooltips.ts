import { Tooltip } from "/imports/startup/client/bootstrap";

const TooltipSelector = "[data-bs-title]";

function dispose(node: Node) {
  if (!(node instanceof HTMLElement)) {
    return;
  }

  // The removed node itself may be a tooltip trigger.
  if (node.matches(TooltipSelector)) {
    Tooltip.getInstance(node)?.dispose();
  }

  // The removed node may contain tooltip triggers.
  node.querySelectorAll<HTMLElement>(TooltipSelector).forEach((element) => {
    Tooltip.getInstance(element)?.dispose();
  });
}

function create(target: ParentNode) {
  target.querySelectorAll<HTMLElement>(TooltipSelector).forEach((tooltipTriggerEl) => {
    if (!tooltipTriggerEl.dataset.bsTitle) {
      console.warn("[data-bs-title] is expected not to be empty.");
      return;
    }

    Tooltip.getOrCreateInstance(tooltipTriggerEl, { html: true });
  });
}

function update(target: ParentNode) {
  target.querySelectorAll<HTMLElement>(TooltipSelector).forEach((tooltipTriggerEl) => {
    if (!tooltipTriggerEl.dataset.bsTitle) {
      console.warn("[data-bs-title] is expected not to be empty.");
      return;
    }

    Tooltip.getInstance(tooltipTriggerEl)?.dispose();
    Tooltip.getOrCreateInstance(tooltipTriggerEl, { html: true });
  });
}

export function enable() {
  // Options for the observer (which mutations to observe)
  const config: MutationObserverInit = {
    attributes: true,
    attributeFilter: ["data-bs-title"],
    childList: true,
    subtree: true,
  };

  // Callback function to execute when mutations are observed
  const callback: MutationCallback = (mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        // React may have removed tooltip triggers from the DOM.
        // Dispose their bootstrap instances before creating new ones.
        mutation.removedNodes.forEach(dispose);

        // Initialize tooltips for newly added elements.
        create(mutation.target.parentNode || document);
      } else if (mutation.type === "attributes") {
        update(mutation.target.parentNode || document);
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(document, config);
}
