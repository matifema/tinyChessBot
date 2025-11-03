using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ChessChallenge.API;

namespace SelfPlayApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("OctoBot Self-Play Data Generator");
            Console.WriteLine("=================================");

            int numGames = args.Length > 0 ? int.Parse(args[0]) : 1000;
            string outputFile = args.Length > 1 ? args[1] : "training_data.epd";
            string openingFile = "openings.epd";

            Console.WriteLine($"Target games: {numGames}");
            Console.WriteLine($"Output file: {outputFile}");

            var generator = new SelfPlayGenerator(openingFile, outputFile);
            generator.GenerateGames(numGames);

            Console.WriteLine("Data generation complete!");
        }
    }

    class SelfPlayGenerator
    {
        private readonly string openingFile;
        private readonly string outputFile;
        private readonly Random random;
        private readonly List<string> openings;
        private readonly OctoBot bot1;
        private readonly OctoBot bot2;

        public SelfPlayGenerator(string openingFile, string outputFile)
        {
            this.openingFile = openingFile;
            this.outputFile = outputFile;
            this.random = new Random();
            this.openings = LoadOpenings();
            this.bot1 = new OctoBot();
            this.bot2 = new OctoBot();

            // Clear output file
            File.WriteAllText(outputFile, "");
        }

        private List<string> LoadOpenings()
        {
            if (!File.Exists(openingFile))
            {
                Console.WriteLine($"Warning: Opening file '{openingFile}' not found. Using start position only.");
                return new List<string> { "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" };
            }

            return File.ReadAllLines(openingFile)
                .Where(line => !string.IsNullOrWhiteSpace(line) && !line.StartsWith("#"))
                .ToList();
        }

        public void GenerateGames(int numGames)
        {
            int gamesCompleted = 0;
            int positionsCollected = 0;

            for (int i = 0; i < numGames; i++)
            {
                Console.Write($"\rPlaying game {i + 1}/{numGames}... ");

                var (positions, result) = PlayGame();
                
                // Write positions to file
                using (StreamWriter writer = File.AppendText(outputFile))
                {
                    foreach (string fen in positions)
                    {
                        writer.WriteLine($"{fen}; {result};");
                        positionsCollected++;
                    }
                }

                gamesCompleted++;

                if ((i + 1)  % 10 == 0)
                {
                    Console.WriteLine($"\nGames: {gamesCompleted}, Positions: {positionsCollected}");
                }
            }

            Console.WriteLine($"\n\nTotal games: {gamesCompleted}");
            Console.WriteLine($"Total positions: {positionsCollected}");
        }

        private (List<string> positions, string result) PlayGame()
        {
            // Select random opening
            string startFen = openings[random.Next(openings.Count)];
            ChessChallenge.API.Board board = ChessChallenge.API.Board.CreateBoardFromFEN(startFen);

            List<string> positions = new List<string>();
            int moveCount = 0;
            int maxMoves = 200;
            int adjudicationThreshold = 800; // Centipawns
            int adjudicationMoves = 5;
            int consecutiveHighEval = 0;
            int lastEval = 0;

            while (moveCount < maxMoves)
            {
                // Check for game end
                if (board.IsInCheckmate())
                {
                    string result = board.IsWhiteToMove ? "0-1" : "1-0";
                    return (positions, result);
                }

                if (board.IsDraw())
                {
                    return (positions, "1/2-1/2");
                }

                Move[] legalMoves = board.GetLegalMoves();
                if (legalMoves.Length == 0)
                {
                    return (positions, "1/2-1/2");
                }

                // Get bot move with small randomness
                ChessChallenge.API.Timer timer = new ChessChallenge.API.Timer(10000, 10000, 100000, 0);
                Move move = board.IsWhiteToMove ? bot1.Think(board, timer) : bot2.Think(board, timer);

                // Add small random perturbation (1 in 20 chance to pick random move)
                if (random.Next(20) == 0 && legalMoves.Length > 1)
                {
                    move = legalMoves[random.Next(legalMoves.Length)];
                }

                board.MakeMove(move);
                moveCount++;

                // Start recording positions after move 10
                if (moveCount > 10)
                {
                    positions.Add(board.GetFenString());
                }

                // Adjudication: check if position is clearly winning
                if (moveCount > 20)
                {
                    // Simple eval for adjudication (material count)
                    int eval = SimpleEval(board);
                    
                    if (Math.Abs(eval) > adjudicationThreshold)
                    {
                        if (Math.Sign(eval) == Math.Sign(lastEval))
                        {
                            consecutiveHighEval++;
                            if (consecutiveHighEval >= adjudicationMoves)
                            {
                                string result = eval > 0 ? "1-0" : "0-1";
                                return (positions, result);
                            }
                        }
                        else
                        {
                            consecutiveHighEval = 1;
                        }
                    }
                    else
                    {
                        consecutiveHighEval = 0;
                    }
                    
                    lastEval = eval;
                }
            }

            // Max moves reached - adjudicate as draw
            return (positions, "1/2-1/2");
        }

        private int SimpleEval(ChessChallenge.API.Board board)
        {
            int[] pieceValues = { 0, 100, 300, 300, 500, 900, 0 }; // None, Pawn, Knight, Bishop, Rook, Queen, King
            int score = 0;

            for (int pieceType = 1; pieceType <= 6; pieceType++)
            {
                int whitePieces = board.GetPieceList((PieceType)pieceType, true).Count;
                int blackPieces = board.GetPieceList((PieceType)pieceType, false).Count;
                score += (whitePieces - blackPieces) * pieceValues[pieceType];
            }

            return score;
        }
    }
}
