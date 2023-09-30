import tinycolor from "tinycolor2";

function getColor(value: string) {
  return tinycolor(value).toRgbString();
}

function getColorRawRgb(value: string) {
  const rgb = tinycolor(value).toRgb();
  return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

function getColorRawHs(value: string) {
  const hsl = tinycolor(value).toHsl();
  return `${hsl.h} ${hsl.s * 100}%`;
}

function getColorRawL(value: string) {
  const hsl = tinycolor(value).toHsl();
  return `${hsl.l * 100}%`;
}

export function buildCssVariableColor(name: string, value: string) {
  return `--${name}: ${getColor(value)};
		--${name}-rgb: ${getColorRawRgb(value)};
		--${name}-hs: ${getColorRawHs(value)};
		--${name}-l: ${getColorRawL(value)};`;
}
