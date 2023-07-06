const MILLISECONDS_PER_DAY = 86400000;
const WINDOW_LENGTH = 180;
const MAX_STAY_IN_WINDOW = 90;

function calculateMaximalWindow(dayIndexSlices) {
  const min = dayIndexSlices.reduce((min, slice) => Math.min(min, slice.firstDay), Infinity);
  const max = dayIndexSlices.reduce((max, slice) => Math.max(max, slice.lastDay), 0);

  let windowFirstDay = min;
  let windowLastDay = min + WINDOW_LENGTH - 1;

  let maxDays = 0;

  do {
    const daysInWindow = dayIndexSlices.reduce((sum, { firstDay, lastDay }) => {
      const firstDayInWindow = Math.max(windowFirstDay, firstDay);
      const lastDayInWindow = Math.min(windowLastDay, lastDay);
      const overlap = Math.max(0, lastDayInWindow - firstDayInWindow + 1);

      return sum + overlap;
    }, 0);

    maxDays = Math.max(maxDays, daysInWindow);
    windowFirstDay++;
    windowLastDay++;
  } while (windowLastDay <= max);

  return maxDays;
}

function dateStringToDayIndex(dateString) {
  return new Date(dateString).getTime() / MILLISECONDS_PER_DAY;
}

function parseSlices(dateSlice) {
  return dateSlice.map((slice) => ({
    firstDay: dateStringToDayIndex(slice[0]),
    lastDay: dateStringToDayIndex(slice[1]),
  }));
}

function calcaluteLongestStay(previousStays, entryDate) {
  const dayIndexSlices = parseSlices(previousStays);
  const entryDateIndex = dateStringToDayIndex(entryDate);

  const slices = [{ firstDay: entryDateIndex, lastDay: entryDateIndex }, ...dayIndexSlices];
  if (calculateMaximalWindow(slices) > MAX_STAY_IN_WINDOW) {
    return undefined;
  }

  for (let i = 1; i <= MAX_STAY_IN_WINDOW; i++) {
    slices[0].lastDay = entryDateIndex + i;

    if (calculateMaximalWindow(slices) > MAX_STAY_IN_WINDOW) {
      return [new Date((entryDateIndex + i - 1) * MILLISECONDS_PER_DAY), i];
    }
  }
}

function findOptimalEntryDate(previousStays, leaveDate) {
  const dayIndexSlices = parseSlices(previousStays);
  const leaveDateIndex = dateStringToDayIndex(leaveDate);

  let longestDuration = 0;
  let bestEntryDateIndex;

  const slices = [{ firstDay: leaveDateIndex, lastDay: leaveDateIndex }, ...dayIndexSlices];

  for (let i = 0; i <= MAX_STAY_IN_WINDOW; i++) {
    slices[0].firstDay = leaveDateIndex - i;

    const usedDays = calculateMaximalWindow(slices);
    if (usedDays <= MAX_STAY_IN_WINDOW && usedDays > longestDuration) {
      longestDuration = usedDays;
      bestEntryDateIndex = slices[0].firstDay;
    }
  }

  return [new Date(bestEntryDateIndex * MILLISECONDS_PER_DAY), longestDuration];
}

function findOptimalEntryDate2(previousStays, leaveDate) {
  const dayIndexSlices = parseSlices(previousStays);
  const leaveDateIndex = dateStringToDayIndex(leaveDate);

  let longestDuration = 0;
  let bestEntryDateIndex;

  const slices = [
    { firstDay: leaveDateIndex, lastDay: leaveDateIndex },
    { firstDay: leaveDateIndex, lastDay: leaveDateIndex },
    ...dayIndexSlices,
  ];

  const firstDayConsidered = dayIndexSlices[dayIndexSlices.length - 1].lastDay;

  for (a = firstDayConsidered; a <= leaveDateIndex; a++) {
    for (b = a; b <= leaveDateIndex; b++) {
      for (c = b + 1; c <= leaveDateIndex; c++) {
        slices[0].firstDay = a;
        slices[0].lastDay = b;
        slices[1].firstDay = c;

        const usedDays = calculateMaximalWindow(slices);
        if (usedDays <= MAX_STAY_IN_WINDOW && b - a + 1 + leaveDateIndex - c + 1 >= longestDuration) {
          longestDuration = b - a + 1 + leaveDateIndex - c + 1;
          bestEntryDateIndex = [a, b, c];
        }
      }
    }
  }

  return [bestEntryDateIndex.map((x) => new Date(x * MILLISECONDS_PER_DAY)), longestDuration];
}

const slices = [
  ["2023-03-16", "2023-05-26"],
  //["2023-08-24", "2023-10-10"],
];

console.log(calculateMaximalWindow(parseSlices(slices)));
console.log(findOptimalEntryDate2(slices, "2023-10-10"));
