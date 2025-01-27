window.addEventListener("message", function (event) {
  if (!(event.data && event.data.type === "onFrameHeightChange")) {
    return;
  }

  const href = event.data.href;

  let currentFrame;
  for (let i = 0; i < window.frames.length; i++) {
    const frame = window.frames[i];
    if (frame.location.href !== href) {
      continue;
    }

    currentFrame = frame;
    break;
  }
  if (!currentFrame) {
    throw new Error("Frame not found.");
  }

  let currentIframe;
  const iframes = document.querySelectorAll("iframe");
  for (const iframe of iframes) {
    if (iframe.contentWindow !== currentFrame) {
      continue;
    }

    currentIframe = iframe;
    break;
  }
  if (!currentIframe) {
    throw new Error("iFrame not found.");
  }

  currentIframe.style.height = event.data.height + "px";
});
