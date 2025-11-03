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
        private const double LearningRate = 0.1;
        private const int Epochs = 100;

        public TexelTuner(string dataFile)
        {
            Console.WriteLine("Loading training data...");
            positions = LoadPositions(dataFile);
            Console.WriteLine($"Loaded {positions.Count} positions");

            // Initialize PST arrays with current values (we'll tune these)
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
            // Copy initial values from OctoBot (these would need to be exposed or duplicated)
            // For now, initialize to zero - in practice, you'd copy from OctoBot's initial values
            Console.WriteLine("Initializing PSTs with starting values...");
        }

        private List<TrainingPosition> LoadPositions(string filename)
        {
            var result = new List<TrainingPosition>();
            
            foreach (string line in File.ReadLines(filename))
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

            for (int epoch = 0; epoch < Epochs; epoch++)
            {
                double error = CalculateError();
                
                if (error < bestError)
                {
                    bestError = error;
                }

                Console.WriteLine($"Epoch {epoch + 1}/{Epochs}: Error = {error:F6} (Best: {bestError:F6})");

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
            // Simplified gradient descent
            // In a full implementation, you'd compute actual gradients
            // For now, we use a simple local search approach
            
            // This is a placeholder - full implementation would compute gradients
            // for each PST value and update accordingly
            
            // Example: small random perturbations (hill climbing)
            Random rng = new Random();
            for (int i = 0; i < 64; i++)
            {
                if (rng.NextDouble() < 0.1) // 10% chance to perturb each value
                {
                    mgPawnTable[i] += rng.Next(-5, 6);
                    egPawnTable[i] += rng.Next(-5, 6);
                }
            }
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
