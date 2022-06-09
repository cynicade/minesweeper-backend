export type Cell = {
  mine: boolean;
  counter: number | null;
  open: boolean;
  flag: boolean;
};

export type Difficulty = "beginner" | "intermediate" | "expert";

export type Grid = {
  cells: Array<Array<Cell>>;
  sizeX: number;
  sizeY: number;
  mines: number;
};

export type Mine = {
  coordX: number;
  coordY: number;
};
