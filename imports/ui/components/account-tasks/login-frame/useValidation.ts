import { useState } from "react";

export function useErrors(mapping: { [name: string]: { text: () => string; field: string } }) {
  const [errors, setErrors] = useState<{ [field: string]: string }>({});
  const [present, setPresent] = useState(false);

  const add = (key: string) => {
    const field = mapping[key].field;
    setErrors({
      ...errors,
      [field]: mapping[key].text(),
    });
    setPresent(true);
  };

  return [
    errors,
    present,
    add,
    () => {
      setErrors({});
      setPresent(false);
    },
  ] as const;
}

export function useValidation(mapping: {
  [name: string]: { onCheckValidity?: () => boolean; text: () => string; field: string };
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errors, _present, add, reset] = useErrors(mapping);

  return [
    errors,
    add,
    () => {
      reset();
      let validity = true;
      Object.keys(mapping).forEach((key) => {
        const m = mapping[key];
        if (m.onCheckValidity && !m.onCheckValidity()) {
          add(key);
          validity = false;
        }
      });
      return validity;
    },
  ] as const;
}
