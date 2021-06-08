let canvas;
let ctx;
const gBArrayHeight = 20; // Number of cells in array height
const gBArrayWidth = 10; // Number of cells in array width
const BLOCKSIZE = 20;

const MOVELEFT = 37;
const MOVERIGHT = 39;
const HARDDROP = 38;
const SOFTDROP = 40;
const ROTATECLOCKWISE = 88;
const ROTATECOUNTER = 90;
const ROTATE180 = 32;
const HOLD = 67;

let currentPiece;
let linesCleared;


let coordinateArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));

// 6. Array for storing stopped shapes
// It will hold colors when a shape stops and is added
let placedPiecesArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));


let DIRECTION = {
    IDLE: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};

let S = [['.....',
          '..00.',
          '.00..',
          '.....',
          '.....'],
         ['.....',
          '..0..',
          '..00.',
          '...0.',
          '.....'],
         ['.....',
          '.....',
          '..00.',
          '.00..',
          '.....'],
         ['.....',
          '.0...',
          '.00..',
          '..0..',
          '.....']];

let Z = [['.....',
          '.00..',
          '..00.',
          '.....',
          '.....'],
         ['.....',
          '...0.',
          '..00.',
          '..0..',
          '.....'],
         ['.....',
          '.....',
          '.00..',
          '..00.',
          '.....'],
         ['.....',
          '..0..',
          '.00..',
          '.0...',
          '.....']];

let I = [['.....',
          '0000.',
          '.....',
          '.....',
          '.....'],
         ['..0..',
          '..0..',
          '..0..',
          '..0..',
          '.....'],
         ['.....',
          '.....',
          '0000.',
          '.....',
          '.....'],
         ['.0...',
          '.0...',
          '.0...',
          '.0...',
          '.....']];

let O = [['.....',
          '.00..',
          '.00..',
          '.....',
          '.....']];

let J = [['.....',
          '.0...',
          '.000.',
          '.....',
          '.....'],
         ['.....',
          '..00.',
          '..0..',
          '..0..',
          '.....'],
         ['.....',
          '.....',
          '.000.',
          '...0.',
          '.....'],
         ['.....',
          '..0..',
          '..0..',
          '.00..',
          '.....']];

let L = [['.....',
          '...0.',
          '.000.',
          '.....',
          '.....'],
         ['.....',
          '..0..',
          '..0..',
          '..00.',
          '.....'],
         ['.....',
          '.....',
          '.000.',
          '.0...',
          '.....'],
         ['.....',
          '.00..',
          '..0..',
          '..0..',
          '.....']];

let T = [['.....',
         '..0..',
         '.000.',
         '.....',
         '.....'],
         ['.....',
          '..0..',
          '..00.',
          '..0..',
          '.....'],
         ['.....',
          '.....',
          '.000.',
          '..0..',
          '.....'],
         ['.....',
          '..0..',
          '.00..',
          '..0..',
          '.....']];

let shapes = [S, Z, I, O, J, L, T];
let shape_colors = [[0, 255, 0], [255, 0, 0], [0, 255, 255], [255, 255, 0], [0, 0, 255], [255, 165, 0], [128, 0, 128]];

class Coordinates{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

class Piece{
    constructor(x, y, shape){
        this.x = x;
        this.y = y;
        this.shape = shape;
        this.color = shape_colors[shapes.indexOf(shape)];
        this.rotation = 0;
    }
}

class Bag{
    constructor(){
        this.pieces = [S, Z, I, O, J, L, T];
        this.offset = [S, Z, J, L, T];
        this.pieces = Shuffle(this.pieces);
    }
    
    Next = ()=> {
        let piece = this.pieces.pop();
        if(this.isEmpty()){
            this.Generate();
        }
        
        if(piece in this.offset){
            return new Piece(4, 2, piece);
        }
        return new Piece(5, 2, piece);
    }

    Generate(){
        this.pieces = [S, Z, I, O, J, L, T, S, Z, I, O, J, L, T];
        this.pieces = Shuffle(this.pieces);
    }

    isEmpty(){
        return this.pieces.length == 0;
    }

}

class Draw{
    static DrawGridLines(){
        ctx.strokeStyle = 'grey';
        ctx.beginPath();
        
        for(let i = 30; i < 210; i += BLOCKSIZE){
            ctx.moveTo(i, 10);
            ctx.lineTo(i, 410);
            ctx.stroke();
        }
    
        for(let i = 30; i < 410; i += BLOCKSIZE){
            ctx.moveTo(10, i);
            ctx.lineTo(210, i);
            ctx.stroke();
        }
    }

    static Setup = ()=>{
        canvas = document.getElementById('myCanvas');
        ctx = canvas.getContext('2d');
        canvas.width = 900;
        canvas.height = 900;

        // Double the size of elements to fit the screen
        ctx.scale(2, 2);

        // Draw Canvas background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw gameboard rectangle
        ctx.strokeStyle = 'white';
        ctx.strokeRect(9, 9, 202, 402);

        CreateCoordArray();

        currentPiece = bag.Next();
        Logic.RedrawBlocks();
        
        document.addEventListener('keydown', Logic.HandleKeyPress);
    }

    static DrawPlacedBlocks(){
        for(let x = 0; x < placedPiecesArray.length; x++){
            for(let y = 0; y < placedPiecesArray[x].length; y++){
                if (!(typeof placedPiecesArray[x][y] == "string")) {
                    continue;
                }
                let coorX = coordinateArray[y][x].x;
                let coorY = coordinateArray[y][x].y;
                ctx.fillStyle = placedPiecesArray[x][y];
                ctx.fillRect(coorX, coorY, BLOCKSIZE, BLOCKSIZE);
            }
        }
    }

    static DrawCurrentPiece(){
        let piecePosition = Logic.ConvertToCoordinates(currentPiece);

        for(let i = 0; i < piecePosition.length; i++){
            let x = piecePosition[i][0];
            let y = piecePosition[i][1];

            if(y > -1){
                let coorY = coordinateArray[x][y].y;
                let coorX = coordinateArray[x][y].x;

                ctx.fillStyle = 'rgb(' + currentPiece.color[0] + ',' + currentPiece.color[1] + ',' + currentPiece.color[2] + ')';
                ctx.fillRect(coorX, coorY, BLOCKSIZE, BLOCKSIZE);
            }
        }
        
    }

    static ClearBoard(){
        // Draw Canvas background
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw gameboard rectangle
        ctx.strokeStyle = 'white';
        ctx.strokeRect(9, 9, 202, 402);
    }

    static DrawGhostPiece(){
        let counter = 0;
        while(true){
            currentPiece.y += 1;
            counter += 1

            if (!(Logic.ValidSpace(currentPiece))){
                currentPiece.y -= 1;
                counter -= 1;
                break;
            }
        }

        let piecePosition = Logic.ConvertToCoordinates(currentPiece);
        for(let i = 0; i < piecePosition.length; i++){
            let x = piecePosition[i][0];
            let y = piecePosition[i][1];

            if(y > -2){
                let coorY = coordinateArray[x][y].y;
                let coorX = coordinateArray[x][y].x;
                let r = currentPiece.color[0];
                let g = currentPiece.color[1];
                let b = currentPiece.color[2];
                let rt = r + (0.5 * (255 - r));
                let gt = g + (0.5 * (255 - g))
                let bt = b + (0.5 * (255 - b))

                ctx.fillStyle = 'rgb(' + rt + ',' + gt + ',' + bt + ')';
                ctx.fillRect(coorX, coorY, BLOCKSIZE, BLOCKSIZE);
            }
        }

        currentPiece.y -= counter;
    }
}

class Logic{
    static placePiece;

    static ConvertToCoordinates(piece){
        let positions = [];
        let shape = piece.shape[piece.rotation % piece.shape.length];
        
        for(const[i, line] of shape.entries()){
            for(let j = 0; j < line.length; j++){
                if(line.charAt(j) == '0'){
                    positions.push([piece.x + j, piece.y + i]);
                }
            }
        }
        
        for(const[i, pos] of positions.entries()){
            positions[i] = [pos[0] - 2, pos[1] - 4];
        }

        return positions;
    }
    
    static ChangePiece(){
        let piecePosition = Logic.ConvertToCoordinates(currentPiece);
        for(const position of piecePosition){
            placedPiecesArray[position[1]][position[0]] = 'rgb(' + currentPiece.color[0] + ',' + currentPiece.color[1] + ',' + currentPiece.color[2] + ')';
        }

        currentPiece = bag.Next();
        Logic.ClearRows();
    }
    // Main loop of program where everything is tested
    static HandleKeyPress = (key)=>{
        switch(key.keyCode){
            case MOVELEFT:
                currentPiece.x -= 1;

                if(!(this.ValidSpace(currentPiece))){
                    currentPiece.x += 1;
                }
                break;
            
            case MOVERIGHT:
                currentPiece.x += 1;
                
                if(!(this.ValidSpace(currentPiece))){
                    currentPiece.x -= 1;
                }
                break;
            
            case SOFTDROP:
                currentPiece.y += 1;

                if(!(this.ValidSpace(currentPiece))){
                    currentPiece.y -= 1;
                }
                break;
            
            case HARDDROP:
                while(true){
                    currentPiece.y += 1;
                    if (!(Logic.ValidSpace(currentPiece))){
                        currentPiece.y -= 1;
                        break;
                    }
                }
                Logic.placePiece = true;
                break;

            case ROTATECLOCKWISE:
                currentPiece.rotation += 1;
                break;``

            case ROTATECOUNTER:
                if (currentPiece.rotation == 0){
                    currentPiece.rotation = currentPiece.shape.length - 1;
                } else{
                currentPiece.rotation -= 1;
                }
                break;

            default:
        }
        if(Logic.placePiece){
            this.ChangePiece();
            Logic.placePiece = false;
        }
        this.RedrawBlocks();
    }

    static ValidSpace(piece){
        let piecePosition = Logic.ConvertToCoordinates(piece);

        for(let i = 0; i < piecePosition.length; i++){
            let x = piecePosition[i][0];
            let y = piecePosition[i][1];

            if(x < 0 || x > 9){
                return false;
            }
            if(y < -2 || y > 19){
                return false;
            }
            if(y == -1 || y == -2){
                continue;
            }
            if(!(placedPiecesArray[y][x] == 0)){
                return false;
            }
        }

        return true;
    }

    static RedrawBlocks(){
        Draw.ClearBoard();
        Draw.DrawGridLines();
        Draw.DrawGhostPiece();
        Draw.DrawPlacedBlocks();
        Draw.DrawCurrentPiece();
    }

    static ClearRows(){
        let lines = 0;
        for(let i = gBArrayHeight - 1; i > -1; i--){
            while(true){
                let row = placedPiecesArray[i];
                let full = true;
                for(const element of row){
                    if(typeof(element) == 'number'){
                        full = false;
                    }        
                }

                if(full){
                    lines += 1;
                    for(let k = i; k > 0; k--){
                        for(let j = 0; j < row.length; j++){
                            let color = placedPiecesArray[k - 1][j];
                            placedPiecesArray[k - 1][j] = 0;
                            placedPiecesArray[k][j] = color;
                        }
                    }
                } else{
                    break;
                }
            }
        }
    }
}

// class Main{
//     constructor(){
        
//     }
// }

function Shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function CreateCoordArray(){
    let i = 0, j = 0;
    for(let y = 10; y <= 410; y += BLOCKSIZE){
        for(let x = 10; x <= 210; x += BLOCKSIZE){
            coordinateArray[i][j] = new Coordinates(x,y);
            i++;
        }
        j++;
        i = 0;
    }
} 



let bag = new Bag();
// draw = new Draw();
document.addEventListener('DOMContentLoaded', Draw.Setup);

