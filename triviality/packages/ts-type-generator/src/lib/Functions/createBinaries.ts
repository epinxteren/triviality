import {countCurry} from "./countCurry";

export function createBinaries(length: number, maxCurry: number) {
  const binaries: number[] = [];
  const total = Math.pow(2, length);
  let current = 0;
  for (let i = 0; i < total; i++) {
    /**
     * 0001
     * 0010
     * 0011
     * 0100
     */
    binaries.push(current);
    current += 1;
  }
  return binaries.sort((a, b) => {
    const ca = countCurry(length, a);
    const cb = countCurry(length, b);
    if (ca === cb) {
      return 0;
    }
    return ca > cb ? 1 : -1;
  }).slice(0, maxCurry);
}
