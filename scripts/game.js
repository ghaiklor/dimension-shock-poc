(function () {
  function noop(boardId) {
  }

  function newGame() {
    initializeAI();
  }

  function initializeAI() {
    GAMES[0].ai.postMessage('ucinewgame');
    GAMES[0].ai.postMessage('position startpos');
    GAMES[0].ai.onmessage = onAIRespond.bind(null, 0);

    GAMES[1].ai.postMessage('ucinewgame');
    GAMES[1].ai.postMessage('position startpos');
    GAMES[1].ai.onmessage = onAIRespond.bind(null, 1);
  }

  function onAIRespond(boardId, event) {
    const data = event.data;
    const board = GAMES[boardId].board;
    const game = GAMES[boardId].game;

    if (data.match(/bestmove/)) {
      const move = data.slice(9);
      const source = move.slice(0, 2);
      const target = move.slice(2);

      console.log(`${source}-${target}`);
      console.log(game.move({from: source, to: target, promotion: 'q'}));

      board.position(game.fen());
    }
  }

  function removeGraySquares(boardId) {
    $(`#board${boardId} .square-55d63`).css('background', '');
  }

  function greySquare(boardId, square) {
    const squareEl = $(`#board${boardId} .square-${square}`);
    const background = squareEl.hasClass('black-3c85d') ? '#696969' : '#a9a9a9';

    squareEl.css('background', background);
  }

  function boardOnDragStart(boardId, source, piece, position, orientation) {
    const game = GAMES[boardId].game;

    if (
      game.game_over() ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)
    ) {
      return false;
    }
  }

  function boardOnDrop(boardId, source, target, piece, newPosition, oldPosition, orientation) {
    removeGraySquares(boardId);

    const game = GAMES[boardId].game;
    const move = game.move({from: source, to: target, promotion: 'q'});

    if (move === null) return 'snapback';
  }

  function boardOnMouseoutSquare(boardId, oldSquare, oldPiece, position, orientation) {
    removeGraySquares(boardId);
  }

  function boardOnMouseoverSquare(boardId, newSquare, newPiece, position, orientation) {
    const game = GAMES[boardId].game;
    const moves = game.moves({square: newSquare, verbose: true});

    if (moves.length === 0) return;

    greySquare(boardId, newSquare);

    for (let i = 0; i < moves.length; i++) {
      greySquare(boardId, moves[i].to);
    }
  }

  function boardOnSnapEnd(boardId, source, target, piece) {
    const game = GAMES[boardId].game;
    const board = GAMES[boardId].board;
    const ai = GAMES[boardId].ai;
    const fen = game.fen();

    board.position(fen);
    ai.postMessage(`position fen ${fen}`);
    ai.postMessage('go depth 4');
  }

  function BOARD_CONFIG(boardId) {
    return {
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
      onChange: noop.bind(null, boardId),
      onDragStart: boardOnDragStart.bind(null, boardId),
      onDragMove: noop.bind(null, boardId),
      onDrop: boardOnDrop.bind(null, boardId),
      onMouseoutSquare: boardOnMouseoutSquare.bind(null, boardId),
      onMouseoverSquare: boardOnMouseoverSquare.bind(null, boardId),
      onMoveEnd: noop.bind(null, boardId),
      onSnapbackEnd: noop.bind(null, boardId),
      onSnapEnd: boardOnSnapEnd.bind(null, boardId),
    }
  }

  const GAMES = [{
    board: ChessBoard('board0', BOARD_CONFIG(0)),
    game: new Chess(),
    ai: new Worker('scripts/lozza.js'),
  }, {
    board: ChessBoard('board1', BOARD_CONFIG(1)),
    game: new Chess(),
    ai: new Worker('scripts/lozza.js'),
  }];

  newGame();
})();
