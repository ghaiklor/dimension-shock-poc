(function () {
  const dimensionShockCounterEl = $('#dimension-shock-counter');
  const board0El = $('#board0');
  const board1El = $('#board1');

  let IS_SHOCKED = false;
  let leftBeforeShock = 2;

  function noop(boardId) {
  }

  /**
   * Start a new game.
   */
  function newGame() {
    initializeAI();
    updateShockCounter();
  }

  /**
   * Triggers when game is over.
   */
  function gameOver() {
    alert('Game Over');
  }

  /**
   * Resets an AI configuration and starts as a new game.
   */
  function initializeAI() {
    GAMES[0].ai.postMessage('ucinewgame');
    GAMES[0].ai.postMessage('position startpos');
    GAMES[0].ai.onmessage = onAIRespond.bind(null, 0);

    GAMES[1].ai.postMessage('ucinewgame');
    GAMES[1].ai.postMessage('position startpos');
    GAMES[1].ai.onmessage = onAIRespond.bind(null, 1);
  }

  /**
   * Updates shock counter and triggers dimension shock if needed.
   */
  function updateShockCounter() {
    if (leftBeforeShock === 0) {
      leftBeforeShock = 5;
      dimensionShock();
    }

    dimensionShockCounterEl.text(`Dimension Shock after ${leftBeforeShock} move(s)`);
  }

  function dimensionShock() {
    if (IS_SHOCKED) {
      const game0 = GAMES[0].game;
      const game1 = GAMES[1].game;
      const board0 = GAMES[0].board;
      const board1 = GAMES[1].board;
      const board0Position = board0.position();
      const board1Position = board1.position();
      const mixedPosition = Object.assign(board0Position, board1Position);

      board0.position(mixedPosition);
      game0.load(board0.fen());

      board1El.css('display', 'none');
    } else {
      const game0 = GAMES[0].game;
      const game1 = GAMES[1].game;
      const board1 = GAMES[1].board;

      game1.load(game0.fen());
      board1.position(game0.fen());

      board1El.css('display', '');
    }

    IS_SHOCKED = !IS_SHOCKED;
  }

  /**
   * Triggers when AI responds with a next move.
   *
   * @param {Number} boardId
   * @param {Object} event
   */
  function onAIRespond(boardId, event) {
    const data = event.data;

    if (data.match(/bestmove/)) {
      const move = data.slice(9);
      const source = move.slice(0, 2);
      const target = move.slice(2, -1);

      console.log(`${source}-${target}`);

      makeMove(boardId, source, target);
      updateBoard(boardId);
    }
  }

  /**
   * Makes a move in a game.
   *
   * @param {Number} boardId
   * @param {String} from
   * @param {String} to
   * @returns {Object}
   */
  function makeMove(boardId, from, to) {
    const game = GAMES[boardId].game;
    const move = game.move({from: from, to: to, promotion: 'q'});

    if (game.game_over()) return gameOver();

    leftBeforeShock -= 1;
    updateShockCounter();

    return move;
  }

  /**
   * Updates display board to fit the current game position.
   *
   * @param {Number} boardId
   */
  function updateBoard(boardId) {
    const game = GAMES[boardId].game;
    const board = GAMES[boardId].board;
    const fen = game.fen();

    board.position(fen);
  }

  /**
   * Removes a grey background from a square.
   *
   * @param {String} boardId
   */
  function removeGraySquares(boardId) {
    $(`#board${boardId} .square-55d63`).css('background', '');
  }

  /**
   * Makes a square with grey background.
   *
   * @param {Number} boardId
   * @param {String} square
   */
  function graySquare(boardId, square) {
    const squareEl = $(`#board${boardId} .square-${square}`);
    const background = squareEl.hasClass('black-3c85d') ? '#696969' : '#a9a9a9';

    squareEl.css('background', background);
  }

  /**
   * Triggers when piece is starting to drag.
   *
   * @param {Number} boardId
   * @param {String} source
   * @param {String} piece
   * @param {String} position
   * @param {String} orientation
   * @returns {Boolean}
   */
  function boardOnDragStart(boardId, source, piece, position, orientation) {
    const game = GAMES[boardId].game;

    if (game.game_over()) return false;
    if (piece && piece.match(/b/)) return false;
  }

  /**
   * Triggers when piece is dropped on a cell.
   *
   * @param {Number} boardId
   * @param {String} source
   * @param {String} target
   * @param {String} piece
   * @param {String} newPosition
   * @param {String} oldPosition
   * @param {String} orientation
   * @returns {String}
   */
  function boardOnDrop(boardId, source, target, piece, newPosition, oldPosition, orientation) {
    removeGraySquares(boardId);

    if (piece && piece.match(/b/)) return 'snapback';

    const move = makeMove(boardId, source, target);
    if (move === null) return 'snapback';
  }

  /**
   * Triggers when mouse is going out of square region.
   *
   * @param {Number} boardId
   * @param {String} oldSquare
   * @param {String} oldPiece
   * @param {String} position
   * @param {String} orientation
   */
  function boardOnMouseoutSquare(boardId, oldSquare, oldPiece, position, orientation) {
    removeGraySquares(boardId);
  }

  /**
   * Triggers when mouse is moving over square.
   *
   * @param {Number} boardId
   * @param {String} square
   * @param {String} piece
   * @param {String} position
   * @param {String} orientation
   */
  function boardOnMouseoverSquare(boardId, square, piece, position, orientation) {
    if (piece && piece.match(/^b/)) return;

    const game = GAMES[boardId].game;
    const moves = game.moves({square: square, verbose: true});

    if (moves.length === 0) return;

    graySquare(boardId, square);

    for (let i = 0; i < moves.length; i++) {
      graySquare(boardId, moves[i].to);
    }
  }

  /**
   * Triggers when snap is done on game board.
   *
   * @param {Number} boardId
   * @param {String} source
   * @param {String} target
   * @param {String} piece
   */
  function boardOnSnapEnd(boardId, source, target, piece) {
    const game = GAMES[boardId].game;
    const ai = GAMES[boardId].ai;

    ai.postMessage(`position fen ${game.fen()}`);
    ai.postMessage('go depth 4');

    updateBoard(boardId);
  }

  /**
   * Creates a configuration for a display board, based on its ID.
   *
   * @param {Number} boardId
   * @returns {Object}
   */
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

  // Initialize two game boards
  // Each of it has its own AI worker, game rules and board for display
  // Board is used for displaying current game on a website
  // Game is used for checking and calculating the current game position, etc...
  // AI is used for calculating the next move based on current position of the game
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
