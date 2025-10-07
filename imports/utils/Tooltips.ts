import { Tooltip } from "/imports/startup/client/bootstrap";

export function create(target: ParentNode = document) {
  const tooltipTriggerList = target.querySelectorAll("[data-bs-title]");
  [...(tooltipTriggerList as any)].map((tooltipTriggerEl) =>
    Tooltip.getOrCreateInstance(tooltipTriggerEl, { html: true }),
  );
}

export function update(target: ParentNode = document) {
  const tooltipTriggerList = target.querySelectorAll("[data-bs-title]");
  [...(tooltipTriggerList as any)].map((tooltipTriggerEl) => {
    Tooltip.getOrCreateInstance(tooltipTriggerEl).dispose();
    return Tooltip.getOrCreateInstance(tooltipTriggerEl, { html: true });
  });
}

export function hide(target: ParentNode = document) {
  const tooltipTriggerList = target.querySelectorAll("[data-bs-title]");
  [...(tooltipTriggerList as any)].forEach((tooltipTriggerEl) => {
    const tooltip = Tooltip.getOrCreateInstance(tooltipTriggerEl, { html: true });
    tooltip.hide();
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
