public class Node
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