// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/captureStackTrace#using_error.capturestacktrace
export function getStack() {
  const obj = {};
  if ("captureStackTrace" in Error) {
    // Avoid getStack itself in the stack trace
    Error.captureStackTrace(obj, getStack);
  }
  return (obj as any).stack.replace("Error", "Call");
}
