/** inspired by `cn`, helps to combine css class names */
export function cx(...classes: (string | boolean | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
