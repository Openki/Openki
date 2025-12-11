function handleFrameHeightChange(event) {
  const src = event.data.src;
  const iframes = document.querySelectorAll("iframe");

  let iframe;
  iframes.forEach((f) => {
    if (f.src === src) {
      iframe = f;
      return false;
    }
  });

  if (!iframe) {
    throw new Error("iFrame not found.");
  }

  iframe.style.height = `${event.data.height}px`;
}

function handleUserAction() {
  document.dispatchEvent(new KeyboardEvent("keypress", { key: "H" }));
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "E" }));
  document.dispatchEvent(new KeyboardEvent("keyup", { key: "Y" }));
}

window.addEventListener("message", function (event) {
  if (event.data && event.data.type === "onFrameHeightChange") {
    handleFrameHeightChange(event);
  } else if (event.data && event.data.type === "onUserAction") {
    handleUserAction();
  }
});
