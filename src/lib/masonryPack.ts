// Greedy shortest-column pack. Walks `items` in source order and drops each
// one into whichever column is currently shortest, using `height/width` as
// a unitless proxy for rendered tile height.
//
// Why this and not CSS multicol: multicol fills column 1 fully, then column
// 2, etc. — so removing or inserting any item shifts every subsequent tile
// across columns. This packer is stable: removing the last N items leaves
// every prior placement untouched, and appending a new item lands wherever
// the shortest column happens to be at that moment. That's the property
// the portfolio builder wants while curating.

export interface Sized {
  width: number;
  height: number;
}

export function packIntoColumns<T extends Sized>(items: T[], nCols: number): T[][] {
  const cols: T[][] = Array.from({ length: nCols }, () => []);
  const heights: number[] = new Array(nCols).fill(0);
  for (const item of items) {
    const ar = item.width > 0 ? item.height / item.width : 1;
    let minIdx = 0;
    for (let i = 1; i < nCols; i++) {
      if (heights[i] < heights[minIdx]) minIdx = i;
    }
    cols[minIdx].push(item);
    heights[minIdx] += ar;
  }
  return cols;
}
