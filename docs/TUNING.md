# Plan for Self-Tuning Tapered Evaluation in OctoBot                                       
                                                                                           
## 1. Objective                                                                            
                                                                                           
To significantly enhance `OctoBot`'s playing strength by replacing the current static      
evaluation with a **tapered evaluation** function using **phased Piece-Square Tables       
(PSTs)**. These tables will be optimized through an automated tuning process based on game 
outcomes.                                                                                  
                                                                                           
This approach will allow the bot to understand and correctly value piece positions         
differently in the middlegame versus the endgame.                                          
                                                                                           
## 2. Core Concepts                                                                        
                                                                                           
### Tapered Evaluation                                                                     
                                                                                           
Instead of a single evaluation function, tapered evaluation uses two: one for the          
**middlegame (MG)** and one for the **endgame (EG)**. The final evaluation is an           
interpolation between the two, based on the current `game phase`.                          
                                                                                           
`Final Score = (MG_Score * phase + EG_Score * (24 - phase)) / 24`                          
                                                                                           
### Game Phase Calculation                                                                 
                                                                                           
The `phase` of the game is a number that indicates how close the game is to the endgame.   
It's typically calculated based on the non-pawn material on the board.                     
                                                                                           
- A `phase` of `24` represents the starting position (full middlegame).                    
- A `phase` of `0` represents a bare endgame.                                              
                                                                                           
The calculation will be based on piece values (e.g., Knight=1, Bishop=1, Rook=2, Queen=4). 
                                                                                           
```csharp                                                                                  
// Example Phase Calculation                                                               
int gamePhase = 0;                                                                         
gamePhase += board.GetPieceList(PieceType.Knight, true).Count * 1;                         
gamePhase += board.GetPieceList(PieceType.Knight, false).Count * 1;                        
gamePhase += board.GetPieceList(PieceType.Bishop, true).Count * 1;                         
gamePhase += board.GetPieceList(PieceType.Bishop, false).Count * 1;                        
gamePhase += board.GetPieceList(PieceType.Rook, true).Count * 2;                           
gamePhase += board.GetPieceList(PieceType.Rook, false).Count * 2;                          
gamePhase += board.GetPieceList(PieceType.Queen, true).Count * 4;                          
gamePhase += board.GetPieceList(PieceType.Queen, false).Count * 4;                         
// gamePhase will be clamped between 0 and 24.                                             
```                                                                                        

Automated Tuning (Texel's Method)                                                          

We will not tune the PSTs by hand. Instead, we'll build a separate tuner application that  
learns the best PST values from game data. The core idea is based on logistic regression:  

 1 Generate Data: Create a large dataset of positions (.epd format is standard), each with 
   a final game result (Win, Loss, or Draw). This can be done through self-play or by      
   converting PGN databases.                                                               
 2 Minimize Error: The tuner adjusts the MG and EG PST values iteratively to minimize the  
   difference between the engine's evaluation and the actual game outcome. The goal is to  
   make the evaluation function a better predictor of a win.                               
 3 Output: The result is a set of optimized PSTs that can be hardcoded back into the bot.  

## 2.5. Data Generation via Self-Play                                                      
                                                                                           
To generate the high-quality, diverse dataset required for tuning, we will implement a     
self-play framework. This avoids biases from external game databases and produces data     
perfectly tailored to the bot's own strengths and weaknesses.                              
                                                                                           
### 1. Self-Play Application                                                               
                                                                                           
A new console application or mode will be created to run games of `OctoBot` vs `OctoBot`.  
This can leverage the existing `ChallengeController` logic.                                
                                                                                           
### 2. Ensuring Game Diversity                                                             
                                                                                           
To prevent the bot from playing the same games repeatedly, we must introduce sources of    
variation:                                                                                 
                                                                                           
-   **Opening Book**: Use a small, varied opening book (e.g., in `.polyglot` or `EPD`      
format) to force diverse starting positions.                                               
-   **Stochasticity**: Introduce a small amount of randomness into the evaluation function 
or move selection process during self-play. For example, add a tiny random value to the    
evaluation of each move. This ensures different paths are explored.                        
-   **Adjudication**: End games prematurely based on clear-cut evaluations (e.g., if the   
score is `> +800` for 5 consecutive moves, declare a win) to speed up data generation.     
                                                                                           
### 3. Data Collection Process                                                             
                                                                                           
1.  **Start a Game**: The self-play application starts a new game, possibly from a random  
opening book position.                                                                     
2.  **Play the Game**: The two `OctoBot` instances play against each other.                
3.  **Record Positions**: After a certain number of plies (e.g., after move 20), start     
recording the FEN of the board state at each ply.                                          
4.  **Determine Outcome**: When the game ends (checkmate, stalemate, draw by repetition,   
adjudication), determine the result (`1-0`, `0-1`, or `1/2-1/2`).                          
5.  **Export Data**: Write all recorded FENs from that game to a `.epd` data file, each    
annotated with the final game result.                                                      
                                                                                           
Example EPD line: `rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6; r1    
1-0;`
3. Implementation Plan                                                                     

Step 1: Implement Tapered Evaluation in OctoBot.cs                                         

 1 Define PSTs: In OctoBot.cs, define two sets of arrays for Piece-Square Tables:          
   MiddlegamePsts and EndgamePsts. Each set will have 6 tables (Pawn, Knight, Bishop, Rook,
   Queen, King).                                                                           
 2 Initialize PSTs: Populate the tables with initial values from a reliable source (e.g.,  
   the Chess Programming Wiki or a known open-source engine).                              
 3 Calculate Game Phase: Implement a function int CalculateGamePhase(Board board) as       
   described above.                                                                        
 4 Modify Evaluate():                                                                      
    • The main Evaluate() function in OctoBot.cs will be refactored.                       
    • It will first calculate the current gamePhase.                                       
    • It will then calculate two separate scores: mgScore and egScore, by summing the      
      material and PST values from the respective tables.                                  
    • Finally, it will return the interpolated score using the formula mentioned in section
      2.                                                                                   

Step 2: Create the Tuner Application                                                       

This should be a new, separate C# console project (e.g., OctoBot.Tuner) for simplicity and 
to keep dependencies separate from the main bot.                                           

 1 Data Loader: Create a component to read positions and their outcomes from a file (e.g., 
   .epd format).                                                                           
 2 Evaluation Mirror: The tuner needs to have an exact copy of OctoBot's tapered evaluation
   logic to calculate scores for given positions.                                          
 3 Tuning Algorithm:                                                                       
    • Implement the core tuning logic based on the Texel Tuning method. This involves      
      calculating an error gradient and updating weights (PST values) to reduce that error.
    • The tuner will iterate over the dataset multiple times, gradually converging on      
      optimal values.                                                                      
 4 Output Generator: After tuning, the application should print the optimized              
   MiddlegamePsts and EndgamePsts arrays in a format that can be easily copied and pasted  
   back into OctoBot.cs.                                                                   

Step 3: Integrate and Test                                                                 

 1 Update PSTs: Replace the initial PST values in OctoBot.cs with the new, tuned values    
   generated by the tuner.                                                                 
 2 Measure Strength: Run a gauntlet of games between the new version of OctoBot and the old
   version to get a statistically significant ELO difference. This will validate that the  
   tuning process was successful.                                                          


4. Affected Files & New Projects                                                           

-   **`OctoBot/src/My Bot/OctoBot.cs`**: Will require significant modification to its      
`Evaluate()` function and the addition of data structures for the phased PSTs.             
-   **New Project: `OctoBot.Tuner`** (or similar): A new C# console application project    
will be created to handle the offline tuning process. This project will contain the data   
loading, tuning algorithm, and output generation logic.                                    
-   **New Project: `OctoBot.SelfPlay`** (or similar): A new C# console application to      
generate training data. It will run `OctoBot` vs `OctoBot` matches, introduce variation,   
and export game data to `.epd` files. Alternatively, this logic could be integrated into   
the main `ChessChallenge.Application`.     

5. Resources & Further Reading                                                             

 • Chess Programming Wiki: Tapered Eval                                                    
 • Chess Programming Wiki: Piece-Square Tables                                             
 • Texel's Tuning Method Explained                                                         
 • Stockfish's Tuner 'fishtest' (for architectural inspiration)
