window.addEventListener("message", function (event) {
  if (!(event.data && event.data.type === "onFrameHeightChange")) {
    return;
  }

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
});
