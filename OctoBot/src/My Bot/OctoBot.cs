using ChessChallenge.API;
using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Microsoft.CodeAnalysis;
using System.Diagnostics;


public class Node // classetta nodo custom
{
    public int eval { get; set; }

    public Move move { get; set; }

    public Board board { get; set; }

    public Node parent { get; set; }

    public Node child { get; set; }


    public Node() { }

    public Node(Node parent, int eval, Move move, Board b)
    {
        this.parent = parent;
        this.eval = eval;
        this.move = move;
        this.board = b;
    }
    public string MoveHistoryToString()
    {
        if(this.child != null && move!=null)
        {
            var res = move.ToString() + " ";
            res += this.child.MoveHistoryToString();
            return res;
        }
        return "";
    }
}


public class OctoBot : IChessBot
{
    // Piece values for material evaluation
    private Dictionary<PieceType, int> values = new Dictionary<PieceType, int>() {
            { PieceType.Pawn, 100 },
            { PieceType.Bishop, 325 },
            { PieceType.Knight, 300 },
            { PieceType.Queen, 900 },
            { PieceType.Rook, 500 },
            { PieceType.King, 20000 }
        };

    // Phase values for game phase calculation
    private static readonly int[] PhaseValues = { 0, 1, 2, 3, 4, 5, 6 }; // None, Knight, Bishop, Rook, Queen, King

    // Middlegame Piece-Square Tables (PeSTO values)
    private static readonly int[] MgPawnTable = {
        0,   0,   0,   0,   0,   0,   0,   0,
        98, 134,  61,  95,  68, 126,  34, -11,
        -6,   7,  26,  31,  65,  56,  25, -20,
        -14,  13,   6,  21,  23,  12,  17, -23,
        -27,  -2,  -5,  12,  17,   6,  10, -25,
        -26,  -4,  -4, -10,   3,   3,  33, -12,
        -35,  -1, -20, -23, -15,  24,  38, -22,
        0,   0,   0,   0,   0,   0,   0,   0,
    };

    private static readonly int[] MgKnightTable = {
        -167, -89, -34, -49,  61, -97, -15, -107,
        -73, -41,  72,  36,  23,  62,   7,  -17,
        -47,  60,  37,  65,  84, 129,  73,   44,
        -9,  17,  19,  53,  37,  69,  18,   22,
        -13,   4,  16,  13,  28,  19,  21,   -8,
        -23,  -9,  12,  10,  19,  17,  25,  -16,
        -29, -53, -12,  -3,  -1,  18, -14,  -19,
        -105, -21, -58, -33, -17, -28, -19,  -23,
    };

    private static readonly int[] MgBishopTable = {
        -29,   4, -82, -37, -25, -42,   7,  -8,
        -26,  16, -18, -13,  30,  59,  18, -47,
        -16,  37,  43,  40,  35,  50,  37,  -2,
        -4,   5,  19,  50,  37,  37,   7,  -2,
        -6,  13,  13,  26,  34,  12,  10,   4,
        0,  15,  15,  15,  14,  27,  18,  10,
        4,  15,  16,   0,   7,  21,  33,   1,
        -33,  -3, -14, -21, -13, -12, -39, -21,
    };

    private static readonly int[] MgRookTable = {
        32,  42,  32,  51, 63,  9,  31,  43,
        27,  32,  58,  62, 80, 67,  26,  44,
        -5,  19,  26,  36, 17, 45,  61,  16,
        -24, -11,   7,  26, 24, 35,  -8, -20,
        -36, -26, -12,  -1,  9, -7,   6, -23,
        -45, -25, -16, -17,  3,  0,  -5, -33,
        -44, -16, -20,  -9, -1, 11,  -6, -71,
        -19, -13,   1,  17, 16,  7, -37, -26,
    };

    private static readonly int[] MgQueenTable = {
        -28,   0,  29,  12,  59,  44,  43,  45,
        -24, -39,  -5,   1, -16,  57,  28,  54,
        -13, -17,   7,   8,  29,  56,  47,  57,
        -27, -27, -16, -16,  -1,  17,  -2,   1,
        -9, -26,  -9, -10,  -2,  -4,   3,  -3,
        -14,   2, -11,  -2,  -5,   2,  14,   5,
        -35,  -8,  11,   2,   8,  15,  -3,   1,
        -1, -18,  -9,  10, -15, -25, -31, -50,
    };

    private static readonly int[] MgKingTable = {
        -65,  23,  16, -15, -56, -34,   2,  13,
        29,  -1, -20,  -7,  -8,  -4, -38, -29,
        -9,  24,   2, -16, -20,   6,  22, -22,
        -17, -20, -12, -27, -30, -25, -14, -36,
        -49,  -1, -27, -39, -46, -44, -33, -51,
        -14, -14, -22, -46, -44, -30, -15, -27,
        1,   7,  -8, -64, -43, -16,   9,   8,
        -15,  36,  12, -54,   8, -28,  24,  14,
    };

    // Endgame Piece-Square Tables (PeSTO values)
    private static readonly int[] EgPawnTable = {
        0,   0,   0,   0,   0,   0,   0,   0,
        178, 173, 158, 134, 147, 132, 165, 187,
        94, 100,  85,  67,  56,  53,  82,  84,
        32,  24,  13,   5,  -2,   4,  17,  17,
        13,   9,  -3,  -7,  -7,  -8,   3,  -1,
        4,   7,  -6,   1,   0,  -5,  -1,  -8,
        13,   8,   8,  10,  13,   0,   2,  -7,
        0,   0,   0,   0,   0,   0,   0,   0,
    };

    private static readonly int[] EgKnightTable = {
        -58, -38, -13, -28, -31, -27, -63, -99,
        -25,  -8, -25,  -2,  -9, -25, -24, -52,
        -24, -20,  10,   9,  -1,  -9, -19, -41,
        -17,   3,  22,  22,  22,  11,   8, -18,
        -18,  -6,  16,  25,  16,  17,   4, -18,
        -23,  -3,  -1,  15,  10,  -3, -20, -22,
        -42, -20, -10,  -5,  -2, -20, -23, -44,
        -29, -51, -23, -15, -22, -18, -50, -64,
    };

    private static readonly int[] EgBishopTable = {
        -14, -21, -11,  -8, -7,  -9, -17, -24,
        -8,  -4,   7, -12, -3, -13,  -4, -14,
        2,  -8,   0,  -1, -2,   6,   0,   4,
        -3,   9,  12,   9, 14,  10,   3,   2,
        -6,   3,  13,  19,  7,  10,  -3,  -9,
        -12,  -3,   8,  10, 13,   3,  -7, -15,
        -14, -18,  -7,  -1,  4,  -9, -15, -27,
        -23,  -9, -23,  -5, -9, -16,  -5, -17,
    };

    private static readonly int[] EgRookTable = {
        13, 10, 18, 15, 12,  12,   8,   5,
        11, 13, 13, 11, -3,   3,   8,   3,
        7,  7,  7,  5,  4,  -3,  -5,  -3,
        4,  3, 13,  1,  2,   1,  -1,   2,
        3,  5,  8,  4, -5,  -6,  -8, -11,
        -4,  0, -5, -1, -7, -12,  -8, -16,
        -6, -6,  0,  2, -9,  -9, -11,  -3,
        -9,  2,  3, -1, -5, -13,   4, -20,
    };

    private static readonly int[] EgQueenTable = {
        -9,  22,  22,  27,  27,  19,  10,  20,
        -17,  20,  32,  41,  58,  25,  30,   0,
        -20,   6,   9,  49,  47,  35,  19,   9,
        3,  22,  24,  45,  57,  40,  57,  36,
        -18,  28,  19,  47,  31,  34,  39,  23,
        -16, -27,  15,   6,   9,  17,  10,   5,
        -22, -23, -30, -16, -16, -23, -36, -32,
        -33, -28, -22, -43,  -5, -32, -20, -41,
    };

    private static readonly int[] EgKingTable = {
        -74, -35, -18, -18, -11,  15,   4, -17,
        -12,  17,  14,  17,  17,  38,  23,  11,
        10,  17,  23,  15,  20,  45,  44,  13,
        -8,  22,  24,  27,  26,  33,  26,   3,
        -18,  -4,  21,  24,  27,  23,   9, -11,
        -19,  -3,  11,  21,  23,  16,   7,  -9,
        -27, -11,   4,  13,  14,   4,  -5, -17,
        -53, -34, -21, -11, -28, -14, -24, -43
    };

    public Dictionary<ulong, int> seenPositions = new Dictionary<ulong, int>(); // positions table
    public HashSet<ulong> hashPositions = new HashSet<ulong>();
    private int nNodes = 0;




    //-------------------------------------------------------------------- START THINK
    public void CliThink(string fen, string[] moves)
    {
        var list = moves.ToList();
        var Moves = new List<Move>();
        var start = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

        fen = fen == "startpos" ? start : fen;

        Board board = Board.CreateBoardFromFEN(fen);

        foreach(string move in list){
            Moves.Add(new Move(move, board));
        }

        foreach(Move mv in Moves)
        {
            board.MakeMove(mv);
        }
        //Console.WriteLine("bestmove " + Think(board, Moves.Last()));
    }
    public string Think(Board board, Move mv)
    {
        Timer timer = new ChessChallenge.API.Timer(100000000);
        Stopwatch stopWatch = new Stopwatch();
       
        if (board.GetLegalMoves().Count() == 1)
        {
            return board.GetLegalMoves()[0].ToString();
        }

        int depth = 4;
        Node tree = new Node();
        tree.move = mv;
        for (int i = 0; i < depth; i++) // iterative deepening
        {
            AlphaB(int.MinValue, int.MaxValue, board, i, tree);
            Console.WriteLine(  
                "info" +
                " score cp " + Eval(board, i, mv) + 
                " depth " + i +
                " nodes " + this.nNodes +
                " time " + timer.MillisecondsElapsedThisTurn + 
                " pv " + tree.MoveHistoryToString());
        }

        return tree.child.move.ToString();
    }
    public Move Think(Board board, Timer tm)
    {
        if (board.GetLegalMoves().Count() == 1)
        {
            return board.GetLegalMoves()[0];
        }

        // Reduced depth for fast self-play
        int depth = 2;
        Node tree = new Node();
        for (int i = 0; i < depth; i++) // iterative deepening
        {
            AlphaB(int.MinValue, int.MaxValue, board, i, tree);
        }

        return tree.child.move;
    }




    //-------------------------------------------------------------------- SEARCH


    private Node AlphaB(int alpha, int beta, Board board, int depth, Node rootNode)
    {

        if (depth == 0 || board.IsDraw() || board.IsInCheckmate())
        {
            // Only evaluate at leaf nodes
            rootNode.eval = Eval(board, depth, rootNode.move);
            UpdateTreePath(rootNode, depth);
            return rootNode;
        }
        var moves = PrioritizeMoves(board.GetLegalMoves(), board);

        if (board.IsWhiteToMove) // maximizing
        {
            Node max = new Node(rootNode, int.MinValue, new Move(), board);

            foreach (Move move in moves)
            {
                board.MakeMove(move);

                if (hashPositions.Contains(board.ZobristKey))
                {
                    board.UndoMove(move);
                    continue;
                }
                var childDepth = depth - 1;

                // Don't evaluate here - let recursion handle it at leaf nodes
                var child = new Node(rootNode, 0, move, board);
                this.nNodes++;

                child = AlphaB(alpha, beta, board, childDepth, child); // recursive call for children

                if(child.eval > max.eval)
                {
                    max = child;
                }

                alpha = Math.Max(alpha, max.eval);

                if (beta <= alpha)
                {
                    board.UndoMove(move);
                    break;
                }

                board.UndoMove(move);
            }

            rootNode.child = max;
            rootNode.eval = max.eval;
            return rootNode;
        }
        else // minimizing
        {
            Node min = new Node(rootNode, int.MaxValue, new Move(), board);

            foreach (Move move in moves)
            {
                board.MakeMove(move);

                if (hashPositions.Contains(board.ZobristKey))
                {
                    board.UndoMove(move);
                    continue;
                }
                var childDepth = depth-1;

                // Don't evaluate here - let recursion handle it at leaf nodes
                var child = new Node(rootNode, 0, move, board);
                this.nNodes++;

                child = AlphaB(alpha, beta, board, childDepth, child); // recursive call for children

                if (child.eval < min.eval)
                {
                    min = child;
                }

                beta = Math.Min(beta, min.eval);

                if (beta <= alpha)
                {
                    board.UndoMove(move);
                    break;
                }

                board.UndoMove(move);
            }
            rootNode.child = min;
            rootNode.eval = min.eval;
            return rootNode;
        }

    }

    private void UpdateTreePath(Node node, int depth)
    {
        if (node.child != null)
        {
            node.eval = node.child.eval;
        }
        if (node.parent != null)
        {
            UpdateTreePath(node.parent, depth); // recursively update the parent node
        }
    }

    private Move[] PrioritizeMoves(Move[] possibleMoves, Board board)
    {
        // Simple MVV-LVA: captures first, then promotions, then moves to safe squares
        return possibleMoves.OrderByDescending(m => 
            (m.IsCapture ? 1000 : 0) + 
            (m.IsPromotion ? 500 : 0) +
            (!board.SquareIsAttackedByOpponent(m.TargetSquare) ? 100 : 0)
        ).ToArray();
    }

    private bool IsSquareWeak(Board b, Square targetSquare)
    {
        return !b.SquareIsAttackedByOpponent(targetSquare);
    }




    //-------------------------------------------------------------------- EVALUATION
    private int Eval(Board board, int depth, Move move)
    {
        return TaperedEval(board) + MoveEval(board, move, board.IsWhiteToMove);
    }

    private int TaperedEval(Board board)
    {
        int mgScore = 0;
        int egScore = 0;
        int gamePhase = 0;

        // Calculate game phase and scores
        foreach (PieceList pieceList in board.GetAllPieceLists())
        {
            bool isWhite = pieceList.IsWhitePieceList;
            int colorMultiplier = isWhite ? 1 : -1;

            foreach (Piece piece in pieceList)
            {
                PieceType type = piece.PieceType;
                int square = piece.Square.Index;
                
                // Flip square index for black pieces (PSTs are from white's perspective)
                int tableIndex = isWhite ? square : (square ^ 56);

                // Add material value
                mgScore += values[type] * colorMultiplier;
                egScore += values[type] * colorMultiplier;

                // Add positional value from PSTs
                int mgPst = GetMgPstValue(type, tableIndex);
                int egPst = GetEgPstValue(type, tableIndex);
                
                mgScore += mgPst * colorMultiplier;
                egScore += egPst * colorMultiplier;

                // Update game phase
                gamePhase += PhaseValues[(int)type];
            }
        }

        // Clamp game phase to max 24
        gamePhase = Math.Min(gamePhase, 24);

        // Tapered evaluation: interpolate between middlegame and endgame
        int finalScore = (mgScore * gamePhase + egScore * (24 - gamePhase)) / 24;

        // Additional positional factors
        finalScore += BoardEval(board, 0);

        return finalScore;
    }

    private int GetMgPstValue(PieceType type, int square)
    {
        return type switch
        {
            PieceType.Pawn => MgPawnTable[square],
            PieceType.Knight => MgKnightTable[square],
            PieceType.Bishop => MgBishopTable[square],
            PieceType.Rook => MgRookTable[square],
            PieceType.Queen => MgQueenTable[square],
            PieceType.King => MgKingTable[square],
            _ => 0
        };
    }

    private int GetEgPstValue(PieceType type, int square)
    {
        return type switch
        {
            PieceType.Pawn => EgPawnTable[square],
            PieceType.Knight => EgKnightTable[square],
            PieceType.Bishop => EgBishopTable[square],
            PieceType.Rook => EgRookTable[square],
            PieceType.Queen => EgQueenTable[square],
            PieceType.King => EgKingTable[square],
            _ => 0
        };
    }

    private int BoardEval(Board board, int depth)
    {
        int score = 0;
        int turn = board.IsWhiteToMove ? -1 : 1;
        List<Move> gameHistory = board.GameMoveHistory.ToList();
        int nlegalMoves = board.GetLegalMoves().Count();

        if (hashPositions.Contains(board.ZobristKey))
        {
            return seenPositions[board.ZobristKey];     // posizione gia vista
        }
        if (board.IsInCheckmate())
        {
            score += 999999999 * turn;
            seenPositions.TryAdd(board.ZobristKey, score);  // checkmate
            return score;       
        }

        if (board.IsDraw())
        {
            seenPositions.TryAdd(board.ZobristKey, 0);      // patta
            return 0;
        }

        if (board.TrySkipTurn())
        {
            score += (board.GetLegalMoves().Count() - nlegalMoves) * turn;    // maximize moves e minimizza moves nemico
            board.UndoSkipTurn();
        }

        foreach (Piece piece in board.GetAllPieceLists().SelectMany(p => p))
        {
            if (piece.IsPawn)
            {
                score += piece.IsWhite ? piece.Square.File : -7-piece.Square.File;
            }
            
            int attackValue = BitboardHelper.GetNumberOfSetBits(
                BitboardHelper.GetPieceAttacks(piece.PieceType, piece.Square, board, piece.IsWhite));   // attacchi possibili pezzi

            score += attackValue * (piece.IsWhite ? 1 : -1);
        }

        if (gameHistory.Count >= 3 && 
            gameHistory[^3].TargetSquare.Equals(gameHistory.Last().StartSquare) && 
            Math.Sign(score) == Math.Sign(turn))
        {
            score += -5 * turn;         // ripetizione se sei in vantaggio = male
        }

        seenPositions.TryAdd(board.ZobristKey, score);
        return score;
    }

    private int MoveEval(Board board, Move lastmove, bool isWhitetoMove)
    {
        int turn = isWhitetoMove ? -1 : 1;
        int score = 0;

        if (board.HasKingsideCastleRight(isWhitetoMove) || board.HasQueensideCastleRight(isWhitetoMove))
        {
            score += turn; // incentivo castle
        }
        if (board.GameMoveHistory.Count() > 3 && 
            board.GameMoveHistory[^3].TargetSquare.Equals(lastmove.StartSquare)) // one move rule
        {
            score += values[lastmove.MovePieceType]/100 * turn;
        }

        return score;
    }




    //-------------------------------------------------------------------- LOGGING
    private void Logging(string filename, string log)
    {
        File.AppendAllText("C:\\Users\\usr\\source\\repos\\tinyChessBot\\Chess-Challenge\\src\\My Bot\\logs\\" + filename, log); // finestre
        //File.AppendAllText("/home/hos/Desktop/proj/tinyChessBot/Chess-Challenge/src/My Bot/" + filename, log);    // linux
    }

}
