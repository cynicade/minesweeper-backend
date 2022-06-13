import ICell from "./cell";

export default interface IGrid {
  cells: Array<Array<ICell>>;
  sizeX: number;
  sizeY: number;
  mines: number;
}
