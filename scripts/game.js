(function () {
  const dimensionShockCounterEl = $('#dimension-shock-counter');
  const statusMonitorEl = $('#status-monitor');
  const board0El = $('#board0');
  const board1El = $('#board1');
  const MOVES_BEFORE_SHOCK = 11;

  let IS_SHOCKED = false;
  let leftBeforeShock = MOVES_BEFORE_SHOCK;

  function noop(boardId) {
  }

  /**
   * Start a new game.
   */
  function newGame() {
    initializeAI();
    updateShockCounter();
    updateStatusMonitor();
  }

  /**
   * Triggers when game is over.
   */
  function gameOver() {
    updateStatusMonitor();
    alert('Game Over');
  }

  /**
   * Makes a dimension shock.
   */
  function dimensionShock() {
    if (IS_SHOCKED) {
      const game0 = GAMES[0].game;
      const game1 = GAMES[1].game;
      const board0 = GAMES[0].board;
      const board1 = GAMES[1].board;
      const board0Position = board0.position();
      const board1Position = board1.position();
      const mixedPosition = Object.assign(board0Position, board1Position);

      Object.keys(mixedPosition).forEach(cell => {
        const piece = mixedPosition[cell];
        const type = piece.slice(1).toLowerCase();
        const color = piece.slice(0, 1);

        game0.put({type, color}, cell);
      });

      console.log(`Game -> Validating FEN ${game0.fen()}...`);
      console.log(game0.validate_fen(game0.fen()));
      game0.load(game0.fen());

      updateBoard(0);

      setTimeout(() => board1El.css('display', 'none'), 300);
    } else {
      const game0 = GAMES[0].game;
      const game1 = GAMES[1].game;

      game1.load(game0.fen());
      updateBoard(1);

      setTimeout(() => board1El.css('display', ''), 300);
    }

    IS_SHOCKED = !IS_SHOCKED;
  }

  /**
   * Resets an AI configuration and starts as a new game.
   */
  function initializeAI() {
    GAMES[0].ai.postMessage('debug on');
    GAMES[0].ai.postMessage('ucinewgame');
    GAMES[0].ai.postMessage('position startpos');
    GAMES[0].ai.onmessage = onAIRespond.bind(null, 0);

    GAMES[1].ai.postMessage('debug on');
    GAMES[1].ai.postMessage('ucinewgame');
    GAMES[1].ai.postMessage('position startpos');
    GAMES[1].ai.onmessage = onAIRespond.bind(null, 1);
  }

  /**
   * Triggers when AI responds with a next move.
   *
   * @param {Number} boardId
   * @param {Object} event
   */
  function onAIRespond(boardId, event) {
    const data = event.data;

    console.log('AI -> ' + data);

    if (data.match(/bestmove/)) {
      const move = data.slice(9);
      const source = move.slice(0, 2);
      const target = move.slice(2, -1);

      makeMove(boardId, source, target);
      updateBoard(boardId);
    }
  }

  /**
   * Updates status monitor and shows the current status of each game.
   */
  function updateStatusMonitor() {
    console.log(`Game -> Updating status...`);

    const game0 = GAMES[0].game;
    const game1 = GAMES[1].game;
    const turn0 = game0.turn() === 'b' ? 'Blacks move' : 'Whites move';
    const turn1 = game1.turn() === 'b' ? 'Blacks move' : 'Whites move';

    let status = '<b>Board 1</b>: ' + (IS_SHOCKED ? 'Shock, ' : '') + turn0;

    if (game0.in_checkmate()) status += ', Checkmate';
    if (game0.in_check()) status += ', Check';
    if (game0.in_draw()) status += ', Draw';
    if (game0.in_stalemate()) status += ', Stalemate';

    status += '<br><b>Board 2</b>: ' + (IS_SHOCKED ? '' : 'Shock, ') + turn1;

    if (game1.in_checkmate()) status += ', Checkmate';
    if (game1.in_check()) status += ', Check';
    if (game1.in_draw()) status += ', Draw';
    if (game1.in_stalemate()) status += ', Stalemate';

    statusMonitorEl.html(status);
  }

  /**
   * Updates shock counter and triggers dimension shock if needed.
   */
  function updateShockCounter() {
    console.log(`Game -> Updating shock counter...`);

    if (leftBeforeShock === 0) {
      leftBeforeShock = MOVES_BEFORE_SHOCK;
      setTimeout(dimensionShock, 300);
    }

    dimensionShockCounterEl.text(`Dimension Shock after ${leftBeforeShock} move(s)`);
    leftBeforeShock -= 1;
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
    if (!move) return false;

    updateShockCounter();
    updateStatusMonitor();

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

    console.log(`Board -> Board #${boardId} is updating...`);

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
    if (boardId === 0 && IS_SHOCKED) return false;
    if (boardId === 1 && !IS_SHOCKED) return false;

    console.log(`Board -> Dragging ${piece} from ${source}...`);
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
    if (boardId === 0 && IS_SHOCKED) return 'snapback';
    if (boardId === 1 && !IS_SHOCKED) return 'snapback';

    console.log(`Game -> Trying to make move ${source}-${target} with ${piece}...`);

    const move = makeMove(boardId, source, target);
    if (!move) return 'snapback';

    const game = GAMES[boardId].game;
    const ai = GAMES[boardId].ai;
    const fen = game.fen();

    console.log(`Board -> Drop end, sending FEN ${fen} to AI`);
    ai.postMessage(`position fen ${fen}`);
    ai.postMessage('go depth 4');
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
    if (boardId === 0 && IS_SHOCKED) return;
    if (boardId === 1 && !IS_SHOCKED) return;

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

  console.log(`Game -> Initializing board, game and AI...`);

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

  console.log(`Game -> Starting new game...`);

  newGame();
})();
