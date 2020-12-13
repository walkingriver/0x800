import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Gesture, GestureController } from '@ionic/angular';

interface GamePiece {
  value?: number;
  column?: number;
  row?: number;
  combined?: boolean;
  colorClass?: string;
  gridClass?: string;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements AfterViewInit {
  @ViewChild('gameBoard') gameBoard: ElementRef;
  gamePieces: GamePiece[] = [];
  maxCol = 5;
  maxRow = 5;

  direction: '' | 'north' | 'south' | 'east' | 'west' = '';
  horizontalSwipe: Gesture;
  verticalSwipe: Gesture;

  constructor(private gestureCtrl: GestureController) {
  }

  ngAfterViewInit() {
    this.horizontalSwipe = this.gestureCtrl.create({
      el: this.gameBoard.nativeElement,
      threshold: 15,
      gestureName: 'horizontalSwipe',
      direction: 'x',
      maxAngle: 30,
      onMove: detail => this.onHorizontalSwipe(detail),
      onEnd: (_) => this.onHorizontalSwipeEnd(_)
    }, true);

    this.verticalSwipe = this.gestureCtrl.create({
      el: this.gameBoard.nativeElement,
      threshold: 15,
      gestureName: 'verticalSwipe',
      direction: 'y',
      maxAngle: 30,
      onMove: detail => this.onVerticalSwipe(detail),
      onEnd: (_) => this.onVerticalSwipeEnd(_)
    }, true);
    // The `true` above ensures that callbacks run inside NgZone.

    this.verticalSwipe.enable();
    this.horizontalSwipe.enable();

    this.resetBoard();
  }


  onHorizontalSwipe(detail) {
    console.log('<<<<------>>>>>>');
    console.log(detail);
  }

  onVerticalSwipe(detail) {
    console.log('^^^^^^---vvvvvv');
    console.log(detail);
  }

  onHorizontalSwipeEnd(detail) {
    console.log('Horizontal Swipe Complete');
    if (detail.deltaX < 0) {
      // Swipe Left
      this.direction = 'west';
      this.shiftLeft();
    } else {
      // Swipe Right
      this.direction = 'east';
      this.shiftRight();
    }
    console.log(detail);
  }

  onVerticalSwipeEnd(detail) {
    console.log('Vertical Swipe Complete');
    if (detail.deltaY < 0) {
      // Swipe Up
      this.direction = 'north';
      this.shiftUp();
    } else {
      // Swipe Down
      this.direction = 'south';
      this.shiftDown();
    }
    console.log(detail);
  }

  shiftUp() {
    for (let col = 1; col <= this.maxCol; col++) {
      this.shiftColumnUp(col);
    }
    this.endTurn();
  }

  shiftColumnUp(col: number) {
    for (let row = 2; row <= this.maxRow; row++) {
      this.shiftCellUp(row, col);
    }
  }

  /**
   * Pushes a single game piece up as far as it can go.
   * If it runs into another piece of the same value, they
   * will be combined.
   * @param row
   * @param col
   */
  shiftCellUp(row, col) {
    if (row === 1) {
      // Boundary condition
      return;
    }

    const pieceToBeMoved = this.gamePieces.find(piece => piece.row === row && piece.column === col);
    // If there is no piece there, skip it
    if (!pieceToBeMoved?.value) {
      return;
    }

    // We have a piece with a value, now try to move it up one row
    const pieceInTheWay = this.gamePieces.find(piece => piece.row === row - 1 && piece.column === col);
    if (!pieceInTheWay?.value) {
      // If there is no piece there, "swap" them and get out
      pieceInTheWay.row = row;
      pieceToBeMoved.row = row - 1;
    } else if (pieceInTheWay.value === pieceToBeMoved.value && !pieceInTheWay.combined && !pieceToBeMoved.combined) {
      // There is a piece in the way with the same value.
      // Merge the values and reset the value of the piece being moved
      pieceInTheWay.value += pieceToBeMoved.value;
      pieceInTheWay.combined = true;
      pieceToBeMoved.value = 0;
      pieceToBeMoved.combined = true;
    } else {
      // Nothing else can be done here, so bail.
      return;
    }

    // Try to shift the cell up again
    this.shiftCellUp(row - 1, col);
  }

  shiftDown() {
    for (let col = 1; col <= this.maxCol; col++) {
      this.shiftColumnDown(col);
    }
    this.endTurn();
  }

  shiftColumnDown(col: number) {
    for (let row = this.maxRow - 1; row >= 1; row--) {
      this.shiftCellDown(row, col);
    }
  }

  /**
   * Pushes a single game piece Down as far as it can go.
   * If it runs into another piece of the same value, they
   * will be combined.
   * @param row
   * @param col
   */
  shiftCellDown(row, col) {
    if (row >= this.maxRow) {
      // Boundary condition
      return;
    }

    const pieceToBeMoved = this.gamePieces.find(piece => piece.row === row && piece.column === col);
    // If there is no piece there, skip it
    if (!pieceToBeMoved?.value) {
      return;
    }

    // We have a piece with a value, now try to move it up one row
    const pieceInTheWay = this.gamePieces.find(piece => piece.row === row + 1 && piece.column === col);
    if (!pieceInTheWay?.value) {
      // If there is no piece there, "swap" them and get out
      pieceInTheWay.row = row;
      pieceToBeMoved.row = row + 1;
    } else if (pieceInTheWay.value === pieceToBeMoved.value && !pieceInTheWay.combined && !pieceToBeMoved.combined) {
      // There is a piece in the way with the same value.
      // Merge the values and reset the value of the piece being moved
      pieceInTheWay.value += pieceToBeMoved.value;
      pieceInTheWay.combined = true;
      pieceToBeMoved.value = 0;
      pieceToBeMoved.combined = true;
    } else {
      // Nothing else can be done here, so bail.
      return;
    }

    // Try to shift the cell Down again
    this.shiftCellDown(row + 1, col);
  }

  shiftRight() {
    for (let row = 1; row <= this.maxRow; row++) {
      this.shiftRowRight(row);
    }
    this.endTurn();
  }

  shiftRowRight(row: number) {
    for (let col = this.maxCol - 1; col >= 1; col--) {
      this.shiftCellRight(row, col);
    }
  }

  /**
   * Pushes a single game piece Right as far as it can go.
   * If it runs into another piece of the same value, they
   * will be combined.
   * @param row
   * @param col
   */
  shiftCellRight(row, col) {
    if (col >= this.maxCol) {
      // Boundary condition
      return;
    }

    const pieceToBeMoved = this.gamePieces.find(piece => piece.row === row && piece.column === col);
    // If there is no piece there, skip it
    if (!pieceToBeMoved?.value) {
      return;
    }

    // We have a piece with a value, now try to move it up one row
    const pieceInTheWay = this.gamePieces.find(piece => piece.row === row && piece.column === col + 1);
    if (!pieceInTheWay?.value) {
      // If there is no piece there, "swap" them and get out
      pieceInTheWay.column = col;
      pieceToBeMoved.column = col + 1;
    } else if (pieceInTheWay.value === pieceToBeMoved.value && !pieceInTheWay.combined && !pieceToBeMoved.combined) {
      // There is a piece in the way with the same value.
      // Merge the values and reset the value of the piece being moved
      pieceInTheWay.value += pieceToBeMoved.value;
      pieceInTheWay.combined = true;
      pieceToBeMoved.value = 0;
      pieceToBeMoved.combined = true;
    } else {
      // Nothing else can be done here, so bail.
      return;
    }

    // Try to shift the cell Right again
    this.shiftCellRight(row, col + 1);
  }
  shiftLeft() {
    for (let row = 1; row <= this.maxRow; row++) {
      this.shiftRowLeft(row);
    }
    this.endTurn();
  }

  shiftRowLeft(row: number) {
    for (let col = 2; col <= this.maxCol; col++) {
      this.shiftCellLeft(row, col);
    }
  }

  /**
   * Pushes a single game piece Left as far as it can go.
   * If it runs into another piece of the same value, they
   * will be combined.
   * @param row
   * @param col
   */
  shiftCellLeft(row, col) {
    if (col === 1) {
      // Boundary condition
      return;
    }

    const pieceToBeMoved = this.gamePieces.find(piece => piece.row === row && piece.column === col);
    // If there is no piece there, skip it
    if (!pieceToBeMoved?.value) {
      return;
    }

    // We have a piece with a value, now try to move it up one row
    const pieceInTheWay = this.gamePieces.find(piece => piece.row === row && piece.column === col - 1);
    if (!pieceInTheWay?.value) {
      // If there is no piece there, "swap" them and get out
      pieceInTheWay.column = col;
      pieceToBeMoved.column = col - 1;
    } else if (pieceInTheWay.value === pieceToBeMoved.value && !pieceInTheWay.combined && !pieceToBeMoved.combined) {
      // There is a piece in the way with the same value.
      // Merge the values and reset the value of the piece being moved
      pieceInTheWay.value += pieceToBeMoved.value;
      pieceInTheWay.combined = true;
      pieceToBeMoved.value = 0;
      pieceToBeMoved.combined = true;
    } else {
      // Nothing else can be done here, so bail.
      return;
    }

    // Try to shift the cell Left again
    this.shiftCellLeft(row, col - 1);
  }

  endTurn() {
    for (let row = 1; row <= this.maxRow; row++) {
      for (let col = 1; col <= this.maxCol; col++) {
        const piece = this.gamePieces.find(piece => piece.row === row && piece.column === col);
        this.updatePiece(piece, row, col);
      }
    }

    this.addRandomPiece(this.gamePieces.filter(piece => !piece.value));
  }

  private updatePiece(piece: GamePiece, row: number, col: number) {
    piece.column = col;
    piece.row = row;
    piece.combined = false;
    piece.gridClass = `grid-${row}-${col}`;
    piece.colorClass = `color-${piece.value || 0}`;
  }

  resetBoard() {
    this.gamePieces = [];
    for (let row = 1; row <= this.maxRow; row++) {
      for (let col = 1; col <= this.maxCol; col++) {
        const piece: GamePiece = {};
        this.updatePiece(piece, row, col);
        this.gamePieces.push(piece);
      }
    }

    this.addRandomPiece(this.gamePieces.filter(piece => !piece.value));
    this.addRandomPiece(this.gamePieces.filter(piece => !piece.value));
  }

  addRandomPiece(pieces: GamePiece[]) {
    if (pieces?.length) {
      const len = pieces.length;
      const index = Math.floor(Math.random() * len);
      const piece = pieces[index];
      piece.value = 2;
      this.updatePiece(piece, piece.row, piece.column);
    } else {
      this.endGame();
    }
  }

  endGame() {
    // It's over!
  }
}
