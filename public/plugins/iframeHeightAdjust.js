window.addEventListener("message", function (event) {
  if (!(event.data && event.data.type === "onFrameHeightChange")) {
    return;
  }

  const src = event.data.src;
  const iframe = document.querySelector("iframe[src='" + src + "']");
  if (!iframe) {
    throw new Error("iFrame not found.");
  }

  iframe.style.height = event.data.height + "px";
});
