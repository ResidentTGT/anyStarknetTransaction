export function getRandomArrayFromInterval(from: number, to: number, length: number): number[] {
	const set = new Set<number>();
	while (set.size < length) {
		set.add(Math.round(Math.random() * (to - from) + from));
	}
	return Array.from(set);
}
