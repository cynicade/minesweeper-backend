import { ICell, IGrid } from "../types";

export function prettyPrintGrid(grid: IGrid): void {
  grid.cells.map((row: Array<ICell>) => {
    console.log(
      row.reduce(
        (acc: string, curr: ICell) =>
          acc + " " + (curr.mine ? "M" : curr.counter),
        ""
      )
    );
  });
}
