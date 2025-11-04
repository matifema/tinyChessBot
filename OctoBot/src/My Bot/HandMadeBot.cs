using ChessChallenge.API;
using System;
using System.Collections.Generic;
using Node;

public class HandMadeBot: IChessBot {
    private int nNodes = 0;

    // transposition table
    private Dictionary<ulong, (int depth, int eval, int flag)> transpositionTable = new Dictionary<ulong, (int, int, int)>();
    private const int TT_EXACT = 0;
    private const int TT_ALPHA = 1;
    private const int TT_BETA = 2;
    
    // piece material evaluation
    private Dictionary<PieceType, int> values = new Dictionary<PieceType, int>() {
        { PieceType.Pawn, 100 },
        { PieceType.Bishop, 330 },
        { PieceType.Knight, 320 },
        { PieceType.Queen, 900 },
        { PieceType.Rook, 500 },
        { PieceType.King, 20000 }
    };



    // ----------------------------------------------------------------- THINK

    public Move Think(Board board, Timer tm)
    {
        Move[] legalMoves = board.GetLegalMoves();
        
        if (legalMoves.Length == 0)
        {
            return Move.NullMove;
        }
        
        if (legalMoves.Length == 1)
        {
            return legalMoves[0];
        }

        int depth = 3;
        Node tree = new Node();
        for (int i = 0; i < depth; i++) // iterative deepening
        {
            AlphaB(int.MinValue, int.MaxValue, board, i, tree);
        }

        // Safety check: if tree.child is null, return first legal move
        if (tree.child == null || tree.child.move.IsNull)
        {
            return legalMoves[0];
        }

        return tree.child.move;
    }

    
    
    //-------------------------------------------------------------------- SEARCH


    private Node AlphaB(int alpha, int beta, Board board, int depth, Node rootNode)
    {
        ulong zobristKey = board.ZobristKey;
        
        // Check transposition table
        if (transpositionTable.TryGetValue(zobristKey, out var ttEntry) && ttEntry.depth >= depth)
        {
            if (ttEntry.flag == TT_EXACT)
            {
                rootNode.eval = ttEntry.eval;
                return rootNode;
            }
            else if (ttEntry.flag == TT_ALPHA && ttEntry.eval <= alpha)
            {
                rootNode.eval = alpha;
                return rootNode;
            }
            else if (ttEntry.flag == TT_BETA && ttEntry.eval >= beta)
            {
                rootNode.eval = beta;
                return rootNode;
            }
        }

        if (depth == 0)
        {
            // Use quiescence search instead of static eval at depth 0
            rootNode.eval = QuiescenceSearch(alpha, beta, board);
            UpdateTreePath(rootNode, depth);
            return rootNode;
        }

        if (board.IsDraw() || board.IsInCheckmate())
        {
            rootNode.eval = Eval(board, depth, rootNode.move);
            UpdateTreePath(rootNode, depth);
            return rootNode;
        }

        var moves = board.GetLegalMoves();
        
        // Safety check: if no legal moves, evaluate position
        if (moves.Length == 0)
        {
            rootNode.eval = Eval(board, depth, rootNode.move);
            UpdateTreePath(rootNode, depth);
            return rootNode;
        }

        if (board.IsWhiteToMove) // maximizing
        {
            Node max = new Node(rootNode, int.MinValue, new Move(), board);
            int originalAlpha = alpha;

            foreach (Move move in moves)
            {
                board.MakeMove(move);

                if (hashPositions.Contains(board.ZobristKey))
                {
                    board.UndoMove(move);
                    continue;
                }
                var childDepth = depth - 1;

                var child = new Node(rootNode, 0, move, board);
                this.nNodes++;

                child = AlphaB(alpha, beta, board, childDepth, child);

                if(child.eval > max.eval)
                {
                    max = child;
                }

                alpha = Math.Max(alpha, max.eval);

                if (beta <= alpha)
                {
                    board.UndoMove(move);
                    break; // Beta cutoff
                }

                board.UndoMove(move);
            }

            rootNode.child = max;
            rootNode.eval = max.eval;
            
            // Store in transposition table
            int flag = max.eval <= originalAlpha ? TT_ALPHA : (max.eval >= beta ? TT_BETA : TT_EXACT);
            transpositionTable[zobristKey] = (depth, max.eval, flag);
            
            return rootNode;
        }
        else // minimizing
        {
            Node min = new Node(rootNode, int.MaxValue, new Move(), board);
            int originalBeta = beta;

            foreach (Move move in moves)
            {
                board.MakeMove(move);

                if (hashPositions.Contains(board.ZobristKey))
                {
                    board.UndoMove(move);
                    continue;
                }
                var childDepth = depth-1;

                var child = new Node(rootNode, 0, move, board);
                this.nNodes++;

                child = AlphaB(alpha, beta, board, childDepth, child);

                if (child.eval < min.eval)
                {
                    min = child;
                }

                beta = Math.Min(beta, min.eval);

                if (beta <= alpha)
                {
                    board.UndoMove(move);
                    break; // Alpha cutoff
                }

                board.UndoMove(move);
            }
            
            rootNode.child = min;
            rootNode.eval = min.eval;
            
            // Store in transposition table
            int flag = min.eval >= originalBeta ? TT_BETA : (min.eval <= alpha ? TT_ALPHA : TT_EXACT);
            transpositionTable[zobristKey] = (depth, min.eval, flag);
            
            return rootNode;
        }
    }

    // Quiescence search to avoid horizon effect
    private int QuiescenceSearch(int alpha, int beta, Board board)
    {
        // Stand pat evaluation - use TaperedEval directly to avoid MoveEval with null move
        int standPat = TaperedEval(board) + BoardEval(board, 0);
        
        if (board.IsInCheckmate())
        {
            return board.IsWhiteToMove ? int.MinValue + 1 : int.MaxValue - 1;
        }
        
        if (board.IsDraw())
        {
            return 0;
        }

        if (standPat >= beta)
        {
            return beta;
        }
        
        if (alpha < standPat)
        {
            alpha = standPat;
        }

        // Only search captures and promotions
        Move[] captureMoves = board.GetLegalMoves(true);
        
        // Sort captures by MVV-LVA
        var sortedCaptures = captureMoves.OrderByDescending(m => 
            (m.IsCapture ? 1000 + (int)m.CapturePieceType * 10 - (int)m.MovePieceType : 0) +
            (m.IsPromotion ? 900 : 0)
        ).ToArray();

        foreach (Move move in sortedCaptures)
        {
            board.MakeMove(move);
            int score = -QuiescenceSearch(-beta, -alpha, board);
            board.UndoMove(move);

            if (score >= beta)
            {
                return beta;
            }
            
            if (score > alpha)
            {
                alpha = score;
            }
        }

        return alpha;
    }

    private void UpdateTreePath(Node node, int depth)
    {
        if (node.child != null)
        {
            node.eval = node.child.eval;
        }
        if (node.parent != null)
        {
            UpdateTreePath(node.parent, depth);
        }
    }

    private Move[] PrioritizeMoves(Move[] possibleMoves, Board board)
    {
        // Enhanced move ordering: MVV-LVA for captures, then promotions, then safe moves
        return possibleMoves.OrderByDescending(m => 
        {
            int score = 0;
            
            // Captures: victim value - attacker value
            if (m.IsCapture)
            {
                score += 10000 + (int)m.CapturePieceType * 100 - (int)m.MovePieceType;
            }
            
            // Promotions
            if (m.IsPromotion)
            {
                score += 9000 + (int)m.PromotionPieceType * 100;
            }
            
            // Penalize moves that leave pieces hanging
            board.MakeMove(m);
            if (board.SquareIsAttackedByOpponent(m.TargetSquare))
            {
                // Piece is attacked after move - penalize based on piece value
                score -= (int)m.MovePieceType * 50;
            }
            board.UndoMove(m);
            
            // Moves to safe squares
            if (!board.SquareIsAttackedByOpponent(m.TargetSquare))
            {
                score += 100;
            }
            
            // Center control bonus
            int file = m.TargetSquare.File;
            int rank = m.TargetSquare.Rank;
            if (file >= 2 && file <= 5 && rank >= 2 && rank <= 5)
            {
                score += 50;
            }
            
            return score;
        }).ToArray();
    }

    private bool IsSquareWeak(Board b, Square targetSquare)
    {
        return !b.SquareIsAttackedByOpponent(targetSquare);
    }


    //-------------------------------------------------------------------- EVALUATION
    
    private int Eval(Board board, int depth, Move move){
        return 0
    }

}