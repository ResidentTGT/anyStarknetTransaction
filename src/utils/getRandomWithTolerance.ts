import Random from "../random";

export function getRandomWithTolerance(baseValue: number, tolerance: number) {
  const toleranceArr = tolerance.toString().split(".");

  let roundNumber = 1;

  if (toleranceArr[1] && toleranceArr[1].length > 0) {
    roundNumber = toleranceArr[1].length + 1;
  }

  const amt =
    Math.round(
      Random.floatFromInterval(baseValue - tolerance, baseValue + tolerance) *
        Math.pow(10, roundNumber)
    ) / Math.pow(10, roundNumber);

  return amt;
}
