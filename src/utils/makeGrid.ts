import { ICell, Difficulty, IGrid, IMine } from "../types";

/**
 * Generate random coordinates for the supplied number of mines
 * @param  {number} sizeX the width of the grid
 * @param  {number} sizeY the height of the grid
 * @param  {number} mines the number of mines
 * @return {IMine[]}       array of coordinate pairs
 */
function getMinePlacement(sizeX: number, sizeY: number, mines: number): Array<IMine> {
  const mineArr = new Array<IMine>;
  let coordX: number;
  let coordY: number;
  let mineCoords: IMine;

  // didn't work with map, or Array.includes() for some weird javascript reason
  // this way worked and now I'm scared to change it
  const inMineArr = (tuple: IMine): boolean => {
    for (let i = 0; i < mineArr.length; ++i) {
      if (mineArr[i].coordX === tuple.coordX && mineArr[i].coordY === tuple.coordY) return true;
    }
    return false;
  }

  for (let i = 0; i < mines; ++i) {
    do {
      coordX = Math.floor(Math.random() * sizeX);
      coordY = Math.floor(Math.random() * sizeY);
      mineCoords = {coordX, coordY}
    } while (inMineArr(mineCoords))  // prevent duplicate coords
    mineArr.push(mineCoords);
  }

  return mineArr;
}

/**
 * Get the appropriate value of the cell's counter field
 * @param  {ICell[][]} cells minesweeper board cells
 * @param  {number} x the cell's x coordinate
 * @param  {number} y the cell's y coordinate
 * @return {number}   the cell's counter
 */
function getCellCounter(cells: Array<Array<ICell>>, x: number, y: number): number {
  let counter = 0;
  for (let i = x - 1; i < x + 2; ++i) {
    for (let j = y - 1; j < y + 2; ++j) {
      if (
        i >= 0 &&
        j >= 0 &&
        i < cells[0].length &&
        j < cells.length
      ) {
        if (cells[j][i].mine) counter++
      }
    }
  }

    return counter;
}

/**
 * Generate random coordinates for the supplied number of mines
 * @param  {Difficulty} diff the game difficulty setting
 * @return {IGrid}       minesweeper board
 */
export function makeGrid(diff: Difficulty): IGrid {
  let sizeX;
  let sizeY;
  let mines;

  switch (diff) {
    case "beginner":
      sizeX = 8;
      sizeY = 8;
      mines = 10;
      break;
    case "intermediate":
      sizeX = 16;
      sizeY = 16;
      mines = 40;
      break;
    case "expert":
      sizeX = 30;
      sizeY = 16;
      mines = 99;
      break;
  }

  // fill the cells 2d cellsay with temp cells
  const cells = new Array<Array<ICell>>;
  for (let i = 0; i < sizeY; ++i) {
    const temp = new Array<ICell>;
    for (let j = 0; j < sizeX; ++j) {
      temp.push({mine: false, counter: null, flag: false, open: false})
    }
    cells.push(temp);
  }

  // randomly generate mine coordinates
  const mineCoords = getMinePlacement(sizeX, sizeY, mines);

  // place the mines in the appropriate cells
  mineCoords.map(coords => {
    cells[coords.coordY][coords.coordX].mine = true
  });

  // adjust the counter for each cell where appropriate
  for (let i = 0; i < sizeY; ++i) {
    for (let j = 0; j < sizeX; ++j) {
      if (!cells[i][j].mine) {
        cells[i][j].counter = getCellCounter(cells, j, i);
      }
    }
  }

  return {sizeX,sizeY, mines, cells};
}
