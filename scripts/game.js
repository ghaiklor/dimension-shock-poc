(function () {
  const GAMES = [new Chess(), new Chess()];
  const AI = [new Worker('scripts/garbochess.js'), new Worker('scripts/garbochess.js')];

  AI[0].onmessage = function (e) {
    console.log(e);
  };

  function removeGraySquares() {
    $('#board1 .square-55d63').css('background', '');
  }

  function greySquare(square) {
    const squareEl = $(`#board1 .square-${square}`);
    const background = squareEl.hasClass('black-3c85d') ? '#696969' : '#a9a9a9';

    squareEl.css('background', background);
  }

  function boardOnChange(oldPosition, newPosition) {

  }

  function boardOnDragStart(source, piece, position, orientation) {
    if (
      GAMES[0].game_over() ||
      (GAMES[0].turn() === 'w' && piece.search(/^b/) !== -1) ||
      (GAMES[0].turn() === 'b' && piece.search(/^w/) !== -1)
    ) {
      return false;
    }
  }

  function boardOnDragMove(newPosition, oldPosition, source, piece, boardPosition, orientation) {

  }

  function boardOnDrop(source, target, piece, newPosition, oldPosition, orientation) {
    removeGraySquares();

    const move = GAMES[0].move({from: source, to: target, promotion: 'q'});

    if (move === null) return 'snapback';
  }

  function boardOnMouseoutSquare(oldSquare, oldPiece, position, orientation) {
    removeGraySquares();
  }

  function boardOnMouseoverSquare(newSquare, newPiece, position, orientation) {
    const moves = GAMES[0].moves({square: newSquare, verbose: true});

    if (moves.length === 0) return;

    greySquare(newSquare);

    for (let i = 0; i < moves.length; i++) {
      greySquare(moves[i].to);
    }
  }

  function boardOnMoveEnd(oldPosition, newPosition) {

  }

  function boardOnSnapbackEnd(piece, square, position, orientation) {

  }

  function boardOnSnapEnd(source, target, piece) {
    BOARDS[0].position(GAMES[0].fen());
  }

  const BOARD_CONFIG = {
    draggable: true,
    dropOffBoard: 'snapback',
    position: 'start',
    orientation: 'white',
    showNotation: true,
    sparePieces: false,
    showErrors: 'console',
    pieceTheme: 'images/chesspieces/default/{piece}.png',
    appearSpeed: 'fast',
    moveSpeed: 'fast',
    snapbackSpeed: 'fast',
    snapSpeed: 'fast',
    trashSpeed: 'fast',
    onChange: boardOnChange,
    onDragStart: boardOnDragStart,
    onDragMove: boardOnDragMove,
    onDrop: boardOnDrop,
    onMouseoutSquare: boardOnMouseoutSquare,
    onMouseoverSquare: boardOnMouseoverSquare,
    onMoveEnd: boardOnMoveEnd,
    onSnapbackEnd: boardOnSnapbackEnd,
    onSnapEnd: boardOnSnapEnd,
  };

  const BOARDS = [ChessBoard('board1', BOARD_CONFIG), ChessBoard('board2', BOARD_CONFIG)];
})();
