using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ChessChallenge.API;

namespace OctoBot.Tuner
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("OctoBot PST Tuner (Texel's Method)");
            Console.WriteLine("===================================");

            string dataFile = args.Length > 0 ? args[0] : "training_data.epd";
            
            if (!File.Exists(dataFile))
            {
                Console.WriteLine($"Error: Data file '{dataFile}' not found!");
                Console.WriteLine("Please run OctoBot.SelfPlay first to generate training data.");
                return;
            }

            var tuner = new TexelTuner(dataFile);
            tuner.Tune();
        }
    }

    class TrainingPosition
    {
        public string Fen { get; set; } = "";
        public double Result { get; set; } // 1.0 = white win, 0.5 = draw, 0.0 = black win
    }

    class TexelTuner
    {
        private readonly List<TrainingPosition> positions;
        private readonly int[] mgPawnTable;
        private readonly int[] mgKnightTable;
        private readonly int[] mgBishopTable;
        private readonly int[] mgRookTable;
        private readonly int[] mgQueenTable;
        private readonly int[] mgKingTable;
        private readonly int[] egPawnTable;
        private readonly int[] egKnightTable;
        private readonly int[] egBishopTable;
        private readonly int[] egRookTable;
        private readonly int[] egQueenTable;
        private readonly int[] egKingTable;

        private const double K = 1.2; // Scaling constant for sigmoid
        private const double LearningRate = 0.01; // Reduced for stability
        private const int Epochs = 100;
        private const int MaxPositions = 100000; // Limit positions for performance

        public TexelTuner(string dataFile)
        {
            Console.WriteLine("Loading training data...");
            positions = LoadPositions(dataFile);
            Console.WriteLine($"Loaded {positions.Count} positions");

            // Initialize PST arrays
            mgPawnTable = new int[64];
            mgKnightTable = new int[64];
            mgBishopTable = new int[64];
            mgRookTable = new int[64];
            mgQueenTable = new int[64];
            mgKingTable = new int[64];
            egPawnTable = new int[64];
            egKnightTable = new int[64];
            egBishopTable = new int[64];
            egRookTable = new int[64];
            egQueenTable = new int[64];
            egKingTable = new int[64];

            InitializePSTs();
        }

        private void InitializePSTs()
        {
            Console.WriteLine("Initializing PSTs with PeSTO starting values...");
            
            // Middlegame tables (PeSTO values)
            int[] mgPawn = {
                0,   0,   0,   0,   0,   0,   0,   0,
                98, 134,  61,  95,  68, 126,  34, -11,
                -6,   7,  26,  31,  65,  56,  25, -20,
                -14,  13,   6,  21,  23,  12,  17, -23,
                -27,  -2,  -5,  12,  17,   6,  10, -25,
                -26,  -4,  -4, -10,   3,   3,  33, -12,
                -35,  -1, -20, -23, -15,  24,  38, -22,
                0,   0,   0,   0,   0,   0,   0,   0,
            };

            int[] mgKnight = {
                -167, -89, -34, -49,  61, -97, -15, -107,
                -73, -41,  72,  36,  23,  62,   7,  -17,
                -47,  60,  37,  65,  84, 129,  73,   44,
                -9,  17,  19,  53,  37,  69,  18,   22,
                -13,   4,  16,  13,  28,  19,  21,   -8,
                -23,  -9,  12,  10,  19,  17,  25,  -16,
                -29, -53, -12,  -3,  -1,  18, -14,  -19,
                -105, -21, -58, -33, -17, -28, -19,  -23,
            };

            int[] mgBishop = {
                -29,   4, -82, -37, -25, -42,   7,  -8,
                -26,  16, -18, -13,  30,  59,  18, -47,
                -16,  37,  43,  40,  35,  50,  37,  -2,
                -4,   5,  19,  50,  37,  37,   7,  -2,
                -6,  13,  13,  26,  34,  12,  10,   4,
                0,  15,  15,  15,  14,  27,  18,  10,
                4,  15,  16,   0,   7,  21,  33,   1,
                -33,  -3, -14, -21, -13, -12, -39, -21,
            };

            int[] mgRook = {
                32,  42,  32,  51, 63,  9,  31,  43,
                27,  32,  58,  62, 80, 67,  26,  44,
                -5,  19,  26,  36, 17, 45,  61,  16,
                -24, -11,   7,  26, 24, 35,  -8, -20,
                -36, -26, -12,  -1,  9, -7,   6, -23,
                -45, -25, -16, -17,  3,  0,  -5, -33,
                -44, -16, -20,  -9, -1, 11,  -6, -71,
                -19, -13,   1,  17, 16,  7, -37, -26,
            };

            int[] mgQueen = {
                -28,   0,  29,  12,  59,  44,  43,  45,
                -24, -39,  -5,   1, -16,  57,  28,  54,
                -13, -17,   7,   8,  29,  56,  47,  57,
                -27, -27, -16, -16,  -1,  17,  -2,   1,
                -9, -26,  -9, -10,  -2,  -4,   3,  -3,
                -14,   2, -11,  -2,  -5,   2,  14,   5,
                -35,  -8,  11,   2,   8,  15,  -3,   1,
                -1, -18,  -9,  10, -15, -25, -31, -50,
            };

            int[] mgKing = {
                -65,  23,  16, -15, -56, -34,   2,  13,
                29,  -1, -20,  -7,  -8,  -4, -38, -29,
                -9,  24,   2, -16, -20,   6,  22, -22,
                -17, -20, -12, -27, -30, -25, -14, -36,
                -49,  -1, -27, -39, -46, -44, -33, -51,
                -14, -14, -22, -46, -44, -30, -15, -27,
                1,   7,  -8, -64, -43, -16,   9,   8,
                -15,  36,  12, -54,   8, -28,  24,  14,
            };

            // Endgame tables (PeSTO values)
            int[] egPawn = {
                0,   0,   0,   0,   0,   0,   0,   0,
                178, 173, 158, 134, 147, 132, 165, 187,
                94, 100,  85,  67,  56,  53,  82,  84,
                32,  24,  13,   5,  -2,   4,  17,  17,
                13,   9,  -3,  -7,  -7,  -8,   3,  -1,
                4,   7,  -6,   1,   0,  -5,  -1,  -8,
                13,   8,   8,  10,  13,   0,   2,  -7,
                0,   0,   0,   0,   0,   0,   0,   0,
            };

            int[] egKnight = {
                -58, -38, -13, -28, -31, -27, -63, -99,
                -25,  -8, -25,  -2,  -9, -25, -24, -52,
                -24, -20,  10,   9,  -1,  -9, -19, -41,
                -17,   3,  22,  22,  22,  11,   8, -18,
                -18,  -6,  16,  25,  16,  17,   4, -18,
                -23,  -3,  -1,  15,  10,  -3, -20, -22,
                -42, -20, -10,  -5,  -2, -20, -23, -44,
                -29, -51, -23, -15, -22, -18, -50, -64,
            };

            int[] egBishop = {
                -14, -21, -11,  -8, -7,  -9, -17, -24,
                -8,  -4,   7, -12, -3, -13,  -4, -14,
                2,  -8,   0,  -1, -2,   6,   0,   4,
                -3,   9,  12,   9, 14,  10,   3,   2,
                -6,   3,  13,  19,  7,  10,  -3,  -9,
                -12,  -3,   8,  10, 13,   3,  -7, -15,
                -14, -18,  -7,  -1,  4,  -9, -15, -27,
                -23,  -9, -23,  -5, -9, -16,  -5, -17,
            };

            int[] egRook = {
                13, 10, 18, 15, 12,  12,   8,   5,
                11, 13, 13, 11, -3,   3,   8,   3,
                7,  7,  7,  5,  4,  -3,  -5,  -3,
                4,  3, 13,  1,  2,   1,  -1,   2,
                3,  5,  8,  4, -5,  -6,  -8, -11,
                -4,  0, -5, -1, -7, -12,  -8, -16,
                -6, -6,  0,  2, -9,  -9, -11,  -3,
                -9,  2,  3, -1, -5, -13,   4, -20,
            };

            int[] egQueen = {
                -9,  22,  22,  27,  27,  19,  10,  20,
                -17,  20,  32,  41,  58,  25,  30,   0,
                -20,   6,   9,  49,  47,  35,  19,   9,
                3,  22,  24,  45,  57,  40,  57,  36,
                -18,  28,  19,  47,  31,  34,  39,  23,
                -16, -27,  15,   6,   9,  17,  10,   5,
                -22, -23, -30, -16, -16, -23, -36, -32,
                -33, -28, -22, -43,  -5, -32, -20, -41,
            };

            int[] egKing = {
                -74, -35, -18, -18, -11,  15,   4, -17,
                -12,  17,  14,  17,  17,  38,  23,  11,
                10,  17,  23,  15,  20,  45,  44,  13,
                -8,  22,  24,  27,  26,  33,  26,   3,
                -18,  -4,  21,  24,  27,  23,   9, -11,
                -19,  -3,  11,  21,  23,  16,   7,  -9,
                -27, -11,   4,  13,  14,   4,  -5, -17,
                -53, -34, -21, -11, -28, -14, -24, -43
            };

            Array.Copy(mgPawn, mgPawnTable, 64);
            Array.Copy(mgKnight, mgKnightTable, 64);
            Array.Copy(mgBishop, mgBishopTable, 64);
            Array.Copy(mgRook, mgRookTable, 64);
            Array.Copy(mgQueen, mgQueenTable, 64);
            Array.Copy(mgKing, mgKingTable, 64);
            Array.Copy(egPawn, egPawnTable, 64);
            Array.Copy(egKnight, egKnightTable, 64);
            Array.Copy(egBishop, egBishopTable, 64);
            Array.Copy(egRook, egRookTable, 64);
            Array.Copy(egQueen, egQueenTable, 64);
            Array.Copy(egKing, egKingTable, 64);
        }

        private List<TrainingPosition> LoadPositions(string filename)
        {
            var result = new List<TrainingPosition>();
            
            foreach (string line in File.ReadLines(filename).Take(MaxPositions))
            {
                if (string.IsNullOrWhiteSpace(line)) continue;

                // Parse EPD format: "FEN; result;"
                var parts = line.Split(';');
                if (parts.Length < 2) continue;

                string fen = parts[0].Trim();
                string resultStr = parts[1].Trim();

                double gameResult = resultStr switch
                {
                    "1-0" => 1.0,
                    "0-1" => 0.0,
                    "1/2-1/2" => 0.5,
                    _ => 0.5
                };

                result.Add(new TrainingPosition { Fen = fen, Result = gameResult });
            }

            return result;
        }

        public void Tune()
        {
            Console.WriteLine("\nStarting tuning process...");
            Console.WriteLine($"Epochs: {Epochs}");
            Console.WriteLine($"Learning rate: {LearningRate}");
            Console.WriteLine($"K constant: {K}\n");

            double bestError = double.MaxValue;
            int epochsWithoutImprovement = 0;
            const int earlyStopThreshold = 10;

            for (int epoch = 0; epoch < Epochs; epoch++)
            {
                double error = CalculateError();
                
                if (error < bestError)
                {
                    bestError = error;
                    epochsWithoutImprovement = 0;
                }
                else
                {
                    epochsWithoutImprovement++;
                }

                Console.WriteLine($"Epoch {epoch + 1}/{Epochs}: Error = {error:F6} (Best: {bestError:F6})");

                // Early stopping if no improvement
                if (epochsWithoutImprovement >= earlyStopThreshold)
                {
                    Console.WriteLine($"\nEarly stopping: No improvement for {earlyStopThreshold} epochs");
                    break;
                }

                // Compute gradients and update parameters
                UpdateParameters();

                // Every 10 epochs, show progress
                if ((epoch + 1) % 10 == 0)
                {
                    Console.WriteLine($"Progress: {(epoch + 1) * 100 / Epochs}% complete\n");
                }
            }

            Console.WriteLine("\nTuning complete!");
            Console.WriteLine($"Final error: {bestError:F6}");
            Console.WriteLine("\nOptimized PST values:");
            OutputPSTs();
        }

        private double CalculateError()
        {
            double totalError = 0.0;

            foreach (var pos in positions)
            {
                ChessChallenge.API.Board board = ChessChallenge.API.Board.CreateBoardFromFEN(pos.Fen);
                double eval = EvaluatePosition(board);
                double sigmoid = Sigmoid(eval);
                double error = Math.Pow(pos.Result - sigmoid, 2);
                totalError += error;
            }

            return totalError / positions.Count;
        }

        private double Sigmoid(double eval)
        {
            return 1.0 / (1.0 + Math.Pow(10.0, -K * eval / 400.0));
        }

        private double EvaluatePosition(ChessChallenge.API.Board board)
        {
            // Simplified evaluation using current PST values
            // This mirrors the tapered eval in OctoBot but uses our tunable parameters
            int mgScore = 0;
            int egScore = 0;
            int gamePhase = 0;

            int[] pieceValues = { 0, 100, 300, 300, 500, 900, 20000 };
            // Phase values indexed by PieceType enum: None=0, Pawn=1, Knight=2, Bishop=3, Rook=4, Queen=5, King=6
            int[] phaseValues = { 0, 0, 1, 1, 2, 4, 0 };

            for (int pieceType = 1; pieceType <= 6; pieceType++)
            {
                var whitePieces = board.GetPieceList((PieceType)pieceType, true);
                var blackPieces = board.GetPieceList((PieceType)pieceType, false);

                foreach (var piece in whitePieces)
                {
                    int square = piece.Square.Index;
                    mgScore += pieceValues[pieceType];
                    egScore += pieceValues[pieceType];
                    mgScore += GetMgPstValue((PieceType)pieceType, square);
                    egScore += GetEgPstValue((PieceType)pieceType, square);
                    gamePhase += phaseValues[pieceType];
                }

                foreach (var piece in blackPieces)
                {
                    int square = piece.Square.Index ^ 56; // Flip for black
                    mgScore -= pieceValues[pieceType];
                    egScore -= pieceValues[pieceType];
                    mgScore -= GetMgPstValue((PieceType)pieceType, square);
                    egScore -= GetEgPstValue((PieceType)pieceType, square);
                    gamePhase += phaseValues[pieceType];
                }
            }

            gamePhase = Math.Min(gamePhase, 24);
            int finalScore = (mgScore * gamePhase + egScore * (24 - gamePhase)) / 24;

            return finalScore / 100.0; // Convert to pawns
        }

        private int GetMgPstValue(PieceType type, int square)
        {
            return type switch
            {
                PieceType.Pawn => mgPawnTable[square],
                PieceType.Knight => mgKnightTable[square],
                PieceType.Bishop => mgBishopTable[square],
                PieceType.Rook => mgRookTable[square],
                PieceType.Queen => mgQueenTable[square],
                PieceType.King => mgKingTable[square],
                _ => 0
            };
        }

        private int GetEgPstValue(PieceType type, int square)
        {
            return type switch
            {
                PieceType.Pawn => egPawnTable[square],
                PieceType.Knight => egKnightTable[square],
                PieceType.Bishop => egBishopTable[square],
                PieceType.Rook => egRookTable[square],
                PieceType.Queen => egQueenTable[square],
                PieceType.King => egKingTable[square],
                _ => 0
            };
        }

        private void UpdateParameters()
        {
            // Compute gradients for all PST values using numerical differentiation
            // For each parameter, compute: gradient = (error(param + delta) - error(param - delta)) / (2 * delta)
            
            const double delta = 1.0; // Small perturbation for numerical gradient
            
            // Update all middlegame tables
            UpdateTable(mgPawnTable, PieceType.Pawn, true, delta);
            UpdateTable(mgKnightTable, PieceType.Knight, true, delta);
            UpdateTable(mgBishopTable, PieceType.Bishop, true, delta);
            UpdateTable(mgRookTable, PieceType.Rook, true, delta);
            UpdateTable(mgQueenTable, PieceType.Queen, true, delta);
            UpdateTable(mgKingTable, PieceType.King, true, delta);
            
            // Update all endgame tables
            UpdateTable(egPawnTable, PieceType.Pawn, false, delta);
            UpdateTable(egKnightTable, PieceType.Knight, false, delta);
            UpdateTable(egBishopTable, PieceType.Bishop, false, delta);
            UpdateTable(egRookTable, PieceType.Rook, false, delta);
            UpdateTable(egQueenTable, PieceType.Queen, false, delta);
            UpdateTable(egKingTable, PieceType.King, false, delta);
        }

        private void UpdateTable(int[] table, PieceType pieceType, bool isMg, double delta)
        {
            // Sample a subset of squares for efficiency (update 8 random squares per table per epoch)
            Random rng = new Random();
            var squaresToUpdate = Enumerable.Range(0, 64).OrderBy(x => rng.Next()).Take(8).ToList();
            
            foreach (int square in squaresToUpdate)
            {
                // Compute gradient using central difference
                double gradient = ComputeGradient(table, square, delta);
                
                // Update parameter using gradient descent
                double update = -LearningRate * gradient;
                table[square] += (int)Math.Round(update);
                
                // Clamp values to reasonable range
                table[square] = Math.Clamp(table[square], -200, 200);
            }
        }

        private double ComputeGradient(int[] table, int square, double delta)
        {
            // Save original value
            int original = table[square];
            
            // Compute error with positive perturbation
            table[square] = original + (int)delta;
            double errorPlus = CalculateErrorFast();
            
            // Compute error with negative perturbation
            table[square] = original - (int)delta;
            double errorMinus = CalculateErrorFast();
            
            // Restore original value
            table[square] = original;
            
            // Central difference gradient
            return (errorPlus - errorMinus) / (2.0 * delta);
        }

        private double CalculateErrorFast()
        {
            // Sample a subset of positions for faster gradient computation
            const int sampleSize = 1000;
            double totalError = 0.0;
            Random rng = new Random(42); // Fixed seed for consistency
            
            var sample = positions.OrderBy(x => rng.Next()).Take(Math.Min(sampleSize, positions.Count));
            
            foreach (var pos in sample)
            {
                ChessChallenge.API.Board board = ChessChallenge.API.Board.CreateBoardFromFEN(pos.Fen);
                double eval = EvaluatePosition(board);
                double sigmoid = Sigmoid(eval);
                double error = Math.Pow(pos.Result - sigmoid, 2);
                totalError += error;
            }

            return totalError / Math.Min(sampleSize, positions.Count);
        }

        private void OutputPSTs()
        {
            Console.WriteLine("\n// Middlegame PSTs");
            OutputTable("MgPawnTable", mgPawnTable);
            OutputTable("MgKnightTable", mgKnightTable);
            OutputTable("MgBishopTable", mgBishopTable);
            OutputTable("MgRookTable", mgRookTable);
            OutputTable("MgQueenTable", mgQueenTable);
            OutputTable("MgKingTable", mgKingTable);

            Console.WriteLine("\n// Endgame PSTs");
            OutputTable("EgPawnTable", egPawnTable);
            OutputTable("EgKnightTable", egKnightTable);
            OutputTable("EgBishopTable", egBishopTable);
            OutputTable("EgRookTable", egRookTable);
            OutputTable("EgQueenTable", egQueenTable);
            OutputTable("EgKingTable", egKingTable);
        }

        private void OutputTable(string name, int[] table)
        {
            Console.WriteLine($"private static readonly int[] {name} = {{");
            for (int rank = 0; rank < 8; rank++)
            {
                Console.Write("    ");
                for (int file = 0; file < 8; file++)
                {
                    int index = rank * 8 + file;
                    Console.Write($"{table[index],4},");
                }
                Console.WriteLine();
            }
            Console.WriteLine("};");
        }
    }
}
