import { useLayoutEffect, useState } from 'react';

// https://stackoverflow.com/questions/19014250/rerender-view-on-browser-resize-with-react/19014495#19014495
export function useWindowSize() {
	const [size, setSize] = useState<[width: number, height: number]>([0, 0]);
	useLayoutEffect(() => {
		function updateSize() {
			setSize([window.innerWidth, window.innerHeight]);
		}
		window.addEventListener('resize', updateSize);
		updateSize();
		return () => window.removeEventListener('resize', updateSize);
	}, []);
	return size;
}
