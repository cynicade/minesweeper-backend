import { Cell, Grid } from "../types/Grid";

export function prettyPrintGrid(grid: Grid): void {
  grid.cells.map((row: Array<Cell>) => {
    console.log(
      row.reduce(
        (acc: string, curr: Cell) =>
          acc + " " + (curr.mine ? "M" : curr.counter),
        ""
      )
    );
  });
}
