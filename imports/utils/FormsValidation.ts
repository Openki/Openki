export function create(target: ParentNode = document) {
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = target.querySelectorAll<HTMLFormElement>("form.needs-validation");

  // Loop over them and prevent submission
  for (const form of forms) {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false,
    );
  }
}

export function enable() {
  // Options for the observer (which mutations to observe)
  const config: MutationObserverInit = {
    childList: true,
    subtree: true,
  };

  // Callback function to execute when mutations are observed
  const callback: MutationCallback = (mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        create(mutation.target.parentNode || document);
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(document, config);
}
