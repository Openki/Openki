import tinycolor from 'tinycolor2';

export function getColor(value: string) {
	return tinycolor(value).toRgbString();
}

export function getColorRawRgb(value: string) {
	const rgb = tinycolor(value).toRgb();
	return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
}

export function getColorRawHs(value: string) {
	const hsl = tinycolor(value).toHsl();
	return `${hsl.h} ${hsl.s * 100}%`;
}

export function getColorRawL(value: string) {
	const hsl = tinycolor(value).toHsl();
	return `${hsl.l * 100}%`;
}
