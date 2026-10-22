export type Size = "large" | "medium" | "small";

export function buildSizeClass(baseClass: string, size: Size = "medium") {
  switch (size) {
    case "large":
      return baseClass + "-lg";
    case "medium":
      return "";
    case "small":
      return baseClass + "-sm";
    default:
      throw new Error(`Unexpected value for prop "size": ${size}`);
  }
}
