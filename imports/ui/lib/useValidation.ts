import { useState } from "react";

export function useValidation(
  mapping: {
    [name: string]: {
      onCheckValidity?: () => boolean;
      text: () => string | React.JSX.Element | undefined | null;
      field: string;
    };
  },
  initialCheck = false,
) {
  const initialState: { [field: string]: string | React.JSX.Element | undefined | null } = {};

  if (initialCheck) {
    Object.keys(mapping).forEach((key) => {
      const m = mapping[key];
      if (m.onCheckValidity && !m.onCheckValidity()) {
        const field = mapping[key].field;
        initialState[field] = mapping[key].text();
      }
    });
  }

  const [errors, setErrors] = useState(initialState);

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
