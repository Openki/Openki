import { useState } from "react";

export function useValidation(mapping: {
  [name: string]: { onCheckValidity?: () => boolean; text: () => string; field: string };
}) {
  const [errors, setErrors] = useState<{ [field: string]: string }>({});

  const add = (key: string) => {
    const field = mapping[key].field;
    setErrors((e) => ({
      ...e,
      [field]: mapping[key].text(),
    }));
  };

  const checkValidity = () => {
    setErrors(() => ({}));
    let validity = true;
    Object.keys(mapping).forEach((key) => {
      const m = mapping[key];
      if (m.onCheckValidity && !m.onCheckValidity()) {
        add(key);
        validity = false;
      }
    });
    return validity;
  };

  return [errors, checkValidity, add] as readonly [
    errors: { [field: string]: string },
    checkValidity: () => boolean,
    addError: (key: string) => void,
  ];
}
