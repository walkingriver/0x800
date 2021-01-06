import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import {
  Gesture,
  GestureController,
  IonSlides,
  ModalController,
} from '@ionic/angular';
import { AdsComponent } from '../ads/ads.component';

interface GamePiece {
  value?: number;
  column?: number;
  row?: number;
  combined?: boolean;
  remove?: boolean;
  colorClass?: string;
  gridClass?: string;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements AfterViewInit {
  // @ViewChild(IonSlides) adSlider: IonSlides;
  @ViewChild('gameBoard') gameBoard: ElementRef;
  gamePieces: GamePiece[] = [];
  maxCol = 5;
  maxRow = 5;
  isPlaying = false;

  direction: '' | 'north' | 'south' | 'east' | 'west' = '';
  horizontalSwipe: Gesture;
  verticalSwipe: Gesture;

  didMove = false;
  score = 0;

  constructor(
    private gestureCtrl: GestureController,
    private modalController: ModalController
  ) {}

  ngAfterViewInit() {
    this.horizontalSwipe = this.gestureCtrl.create(
      {
        el: this.gameBoard.nativeElement,
        threshold: 15,
        gestureName: 'horizontalSwipe',
        direction: 'x',
        maxAngle: 30,
        // onMove: (detail) => this.onHorizontalSwipe(detail),
        onEnd: (_) => this.onHorizontalSwipeEnd(_),
      },
      true
    );

    this.verticalSwipe = this.gestureCtrl.create(
      {
        el: this.gameBoard.nativeElement,
        threshold: 15,
        gestureName: 'verticalSwipe',
        direction: 'y',
        maxAngle: 30,
        // onMove: (detail) => this.onVerticalSwipe(detail),
        onEnd: (_) => this.onVerticalSwipeEnd(_),
      },
      true
    );
    // The `true` above ensures that callbacks run inside NgZone.

    this.verticalSwipe.enable();
    this.horizontalSwipe.enable();

    // this.adSlider.startAutoplay();

    this.newGame();
  }

  async newGame() {
    if (this.score) {
      // confirm first
    }

    // Show an ad before resetting the board
    const modal = await this.modalController.create({
      component: AdsComponent,
      backdropDismiss: true,
      swipeToClose: true,
      keyboardClose: true,
    });
    await modal.present();
    await modal.onDidDismiss();
    this.resetBoard();
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

  @HostListener('window:keyup.ArrowUp')
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
  shiftCellUp(row: number, col: number) {
    if (row === 1) {
      // Boundary condition
      return;
    }

    const pieceToBeMoved = this.gamePieces.find(
      (piece) => piece.row === row && piece.column === col
    );
    // If there is no piece there, skip it
    if (!pieceToBeMoved?.value) {
      return;
    }

    // We have a piece with a value, now try to move it up one row
    const pieceInTheWay = this.gamePieces.find(
      (piece) => piece.row === row - 1 && piece.column === col
    );
    if (!pieceInTheWay?.value) {
      // If there is no piece there, "swap" them and get out
      pieceToBeMoved.row = row - 1;
      this.didMove = true;
    } else if (
      pieceInTheWay.value === pieceToBeMoved.value &&
      !pieceInTheWay.remove &&
      !pieceToBeMoved.combined
    ) {
      // There is a piece in the way with the same value.
      // Merge the values and reset the value of the piece being moved
      pieceToBeMoved.row = row - 1;
      pieceInTheWay.remove = true;
      pieceToBeMoved.combined = true;
      this.didMove = true;
    } else {
      // Nothing else can be done here, so bail.
      return;
    }

    // Try to shift the cell up again
    this.shiftCellUp(row - 1, col);
  }

  @HostListener('window:keyup.ArrowDown')
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

    const pieceToBeMoved = this.gamePieces.find(
      (piece) => piece.row === row && piece.column === col
    );
    // If there is no piece there, skip it
    if (!pieceToBeMoved?.value) {
      return;
    }

    // We have a piece with a value, now try to move it up one row
    const pieceInTheWay = this.gamePieces.find(
      (piece) => piece.row === row + 1 && piece.column === col
    );
    if (!pieceInTheWay?.value) {
      // If there is no piece there, "swap" them and get out
      pieceToBeMoved.row = row + 1;
      this.didMove = true;
    } else if (
      pieceInTheWay.value === pieceToBeMoved.value &&
      !pieceInTheWay.remove &&
      !pieceToBeMoved.combined
    ) {
      // There is a piece in the way with the same value.
      // Merge the values and reset the value of the piece being moved
      pieceToBeMoved.row = row + 1;
      pieceInTheWay.remove = true;
      pieceToBeMoved.combined = true;
      this.didMove = true;
    } else {
      // Nothing else can be done here, so bail.
      return;
    }

    // Try to shift the cell Down again
    this.shiftCellDown(row + 1, col);
  }

  @HostListener('window:keyup.ArrowRight')
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

    const pieceToBeMoved = this.gamePieces.find(
      (piece) => piece.row === row && piece.column === col
    );
    // If there is no piece there, skip it
    if (!pieceToBeMoved?.value) {
      return;
    }

    // We have a piece with a value, now try to move it right one column
    const pieceInTheWay = this.gamePieces.find(
      (piece) => piece.row === row && piece.column === col + 1
    );
    if (!pieceInTheWay?.value) {
      // If there is no piece there, "swap" them and get out
      pieceToBeMoved.column = col + 1;
      this.didMove = true;
    } else if (
      pieceInTheWay.value === pieceToBeMoved.value &&
      !pieceInTheWay.remove &&
      !pieceToBeMoved.combined
    ) {
      // There is a piece in the way with the same value.
      // Merge the values and reset the value of the piece being moved
      pieceToBeMoved.column = col + 1;
      pieceInTheWay.remove = true;
      pieceToBeMoved.combined = true;
      this.didMove = true;
    } else {
      // Nothing else can be done here, so bail.
      return;
    }

    // Try to shift the cell Right again
    this.shiftCellRight(row, col + 1);
  }

  @HostListener('window:keyup.ArrowLeft')
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

    const pieceToBeMoved = this.gamePieces.find(
      (piece) => piece.row === row && piece.column === col
    );
    // If there is no piece there, skip it
    if (!pieceToBeMoved?.value) {
      return;
    }

    // We have a piece with a value, now try to move it up one row
    const pieceInTheWay = this.gamePieces.find(
      (piece) => piece.row === row && piece.column === col - 1
    );
    if (!pieceInTheWay?.value) {
      // If there is no piece there, "swap" them and get out
      pieceToBeMoved.column = col - 1;
      this.didMove = true;
    } else if (
      pieceInTheWay.value === pieceToBeMoved.value &&
      !pieceInTheWay.remove &&
      !pieceToBeMoved.combined
    ) {
      // There is a piece in the way with the same value.
      // Merge the values and reset the value of the piece being moved
      pieceToBeMoved.column = col - 1;
      pieceInTheWay.remove = true;
      pieceToBeMoved.combined = true;
      this.didMove = true;
    } else {
      // Nothing else can be done here, so bail.
      return;
    }

    // Try to shift the cell Left again
    this.shiftCellLeft(row, col - 1);
  }

  endTurn() {
    if (!this.didMove) {
      return;
    }

    this.didMove = false;

    this.gamePieces.map((piece) => this.movePiece(piece));

    // Next, update the values and remove combined tiles
    setTimeout(() => {
      this.gamePieces = this.gamePieces.filter((piece) => !piece.remove);
      this.gamePieces
        .filter((piece) => piece.combined)
        .map((piece) => {
          piece.combined = false;
          piece.value *= 2;
          this.movePiece(piece);
          this.score += piece.value;
        });

      this.addRandomPiece();
    }, 100);
  }

  private movePiece(piece: GamePiece) {
    piece.gridClass = `row-${piece.row} col-${piece.column}`;
    piece.colorClass = `color-${piece.value || 0}`;
  }

  resetBoard() {
    this.gamePieces = [];
    this.score = 0;
    this.didMove = false;
    this.addRandomPiece();
    this.addRandomPiece();
    this.isPlaying = false;
  }

  findEmptySpaces() {
    const emptySpaces = [];
    for (let row = 1; row <= this.maxRow; row++) {
      for (let col = 1; col <= this.maxCol; col++) {
        const piece = this.gamePieces.find(
          (piece) => piece.row === row && piece.column === col
        );
        if (!piece) {
          emptySpaces.push({ row, col });
        }
      }
    }

    return emptySpaces;
  }

  addRandomPiece() {
    const emptySpaces = this.findEmptySpaces();

    if (emptySpaces?.length) {
      const len = emptySpaces.length;
      const index = Math.floor(Math.random() * len);
      const position = emptySpaces[index];
      const piece: GamePiece = {
        column: position.col,
        row: position.row,
        value: Math.pow(2, 1),
      };
      this.movePiece(piece);
      this.gamePieces.push(piece);
    } else {
      this.endGame();
    }
  }

  demoBestBoard() {
    let pow = 26;
    for (let col = 1; col <= this.maxCol; col++) {
      for (let row = 1; row <= this.maxRow; row++) {
        const piece: GamePiece = {
          column: col,
          row: row,
          value: Math.pow(2, pow--),
        };
        this.movePiece(piece);
        this.gamePieces.push(piece);
      }
    }
  }

  endGame() {
    // It's over!
  }

  @HostListener('document:keypress', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (event.key !== '~') {
      return;
    }

    this.demoBestBoard();
  }

  startAutoPlay() {
    this.isPlaying = true;
  }

  stopAutoPlay() {
    this.isPlaying = false;
  }

  /**
   * Tries each direction and choose the one with the best score increase.
   */
  autoAdvance() {}
}
