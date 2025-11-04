using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ChessChallenge.API;

namespace SelfPlayApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("OctoBot Self-Play Data Generator");
            Console.WriteLine("=================================");

            int numGames = args.Length > 0 ? int.Parse(args[0]) : 1000000;
            string outputFile = args.Length > 1 ? args[1] : "training_data.epd";
            string openingFile = "openings.epd";

            int numCores = Environment.ProcessorCount;
            Console.WriteLine($"Target games: {numGames}");
            Console.WriteLine($"Output file: {outputFile}");
            Console.WriteLine($"Using {numCores} CPU cores for parallel processing");

            var generator = new SelfPlayGenerator(openingFile, outputFile);
            generator.GenerateGames(numGames);

            Console.WriteLine("Data generation complete!");
        }
    }

    class SelfPlayGenerator
    {
        private readonly string openingFile;
        private readonly string outputFile;
        private readonly List<string> openings;
        private readonly object fileLock = new object();
        private readonly object consoleLock = new object();
        private int gamesCompleted = 0;
        private int positionsCollected = 0;

        public SelfPlayGenerator(string openingFile, string outputFile)
        {
            this.openingFile = openingFile;
            this.outputFile = outputFile;
            this.openings = LoadOpenings();

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
            var startTime = DateTime.Now;

            // Use Parallel.For to generate games concurrently
            Parallel.For(0, numGames, new ParallelOptions 
            { 
                MaxDegreeOfParallelism = Environment.ProcessorCount 
            }, 
            i =>
            {
                // Each thread gets its own Random instance (seeded differently)
                var threadRandom = new Random(Guid.NewGuid().GetHashCode());
                
                // Each thread gets its own bot instances to avoid shared state
                var bot1 = new OctoBot();
                var bot2 = new OctoBot();

                var (positions, result) = PlayGame(threadRandom, bot1, bot2);
                
                // Thread-safe file writing
                lock (fileLock)
                {
                    using (StreamWriter writer = File.AppendText(outputFile))
                    {
                        foreach (string fen in positions)
                        {
                            writer.WriteLine($"{fen}; {result};");
                            positionsCollected++;
                        }
                    }
                }

                // Thread-safe progress reporting
                int completed;
                int collected;
                lock (consoleLock)
                {
                    gamesCompleted++;
                    completed = gamesCompleted;
                    collected = positionsCollected;

                    if (completed % 10 == 0)
                    {
                        var elapsed = DateTime.Now - startTime;
                        double gamesPerSecond = completed / elapsed.TotalSeconds;
                        var eta = TimeSpan.FromSeconds((numGames - completed) / gamesPerSecond);
                        
                        Console.WriteLine($"Games: {completed}/{numGames} ({completed * 100.0 / numGames:F1}%) | " +
                                        $"Positions: {collected} | " +
                                        $"Speed: {gamesPerSecond:F1} games/sec | " +
                                        $"ETA: {eta:hh\\:mm\\:ss}");
                    }
                }
            });

            var totalTime = DateTime.Now - startTime;
            Console.WriteLine($"\n\nTotal games: {gamesCompleted}");
            Console.WriteLine($"Total positions: {positionsCollected}");
            Console.WriteLine($"Total time: {totalTime:hh\\:mm\\:ss}");
            Console.WriteLine($"Average speed: {gamesCompleted / totalTime.TotalSeconds:F2} games/sec");
        }

        private (List<string> positions, string result) PlayGame(Random random, OctoBot bot1, OctoBot bot2)
        {
            // Clear position caches before each game to prevent memory bloat
            bot1.seenPositions.Clear();
            bot1.hashPositions.Clear();
            bot2.seenPositions.Clear();
            bot2.hashPositions.Clear();

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

            // Reuse timer object for performance
            ChessChallenge.API.Timer timer = new ChessChallenge.API.Timer(100, 100, 10000, 0);

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

                // Get bot move
                Move move = board.IsWhiteToMove ? bot1.Think(board, timer) : bot2.Think(board, timer);

                // Add small random perturbation (1 in 50 chance to pick random move)
                if (random.Next(50) == 0 && legalMoves.Length > 1)
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
