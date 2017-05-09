# Dimension Shock

**Proof of Concept**

*It means, that this game consist of a lot of bugs, unfinished features, etc...*
*Though, it has all the required minimum for testing the main idea of a new gameplay.*

A re-imagining of the chess game, where game involves playing in two distinct dimensions simultaneously.

You can try it here: [https://ghaiklor.github.io/dimension-shock/](https://ghaiklor.github.io/dimension-shock/)

## Original idea

> You begin the game in traditional tactics setup.
> Since there are only two boards and you don't control the split, each unit is free to have more complex stats and interaction than previously possible (like hit points, by golly).

> At the beginning of the game, you are told how many turns until the "time quake", which will create two diverging parallel futures to play in.
> This gives you a chance to set up your units, or if you are quick, a chance to hobble your opponent before the split.

> After the time quake, the board diverges into two identical boards - all units are likewise cloned, as is the state they were in when the quake happened.
> From here, the two players take turns moving a piece, first on one map then the other.

> The goal of the game is to defeat your opponent's king.
> But there is a catch (isn't there always?).
> There are two boards, thus a player wins by defeating both of his opponent's kings.
> If there is a tie (one blue and one red king left standing), there is another time quake after 5 turns - but instead of splitting the field, it merges the two back together.
> The merge rules are simple.
> All units from both sides are put together on the same map.
> In the case where two different units occupy the same square, the stronger unit will prevail (so a pawn and a knight on the same square, even if both red, only the red knight will remain after the merge).
> Play then continues until one or the other king is finally defeated.

## Adapted idea

I took that idea and tried to adapt it to chess.

In general, all remains that same as in original idea, except:

- You start a game with traditional chessboard setup and one board (not two);
- After the dimension shock, chessboard diverges into two identical boards. First board is getting blocked and game continues on the second board;
- After another dimension shock, two chessboards merge into one and game continues on merged board. Since game was played on second chessboard and first was frozen, merge creates extremely new arrangement of pieces;
- Dimension shock happens each 11 moves;
- Game is won by player when player sets a checkmate in one of dimensions;

## Known issues

- When merging two separate chessboards, it creates a set of pieces that breaks normal rules. It leads to many issues with AI that created for usual chess, but not for this variant;

## Credits

The idea for this game was born as adapted idea from [here](http://www.squidi.net/three/entry.php?id=99).
So, thanks to @squidi.

> Can I use the gameplay mechanics for myself?

> Yes, absolutely.
> I have created this website to inspire creativity in others and not only are you allowed, you are encouraged.
> My one thing is that if you do build on an idea from this website, please let people know.
> A little credit goes a long way and it would be greatly appreciated.

## Get in touch

If you have any questions you'd like to discuss, feel free to contact me via [@ghaiklor](https://twitter.com/ghaiklor).
