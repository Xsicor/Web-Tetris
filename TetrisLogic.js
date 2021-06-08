let canvas;
let ctx;
const gBArrayHeight = 20; // Number of cells in array height
const gBArrayWidth = 10; // Number of cells in array width
const gameboardX = 115;
const gameboardY = 20;
const BLOCKSIZE = 20;

const MOVELEFT = 37;
const MOVERIGHT = 39;
const HARDDROP = 38;
const SOFTDROP = 40;
const ROTATECLOCKWISE = 88;
const ROTATECOUNTER = 90;
const ROTATE180 = 32;
const HOLD = 67;
const STARTSPRINT = 70;

let previewNo = 5;
let holdPiece = null;
let currentPiece;
let linesCleared;
let gameStart = false;

var timerDisplay = document.getElementById('timer');

let running = 0;
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
        
        if(this.offset.includes(piece)){
            return new Piece(4, 2, piece);
        }
        if(piece == I){
            return new Piece(5, 3, piece); 
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

class Preview{
    constructor(){
        this.list = []
        for(let i = 0; i < previewNo; i++){
            this.list.push(bag.Next());
        }
    }

    Next(){
        let nextPiece = this.list.shift();
        this.list.push(bag.Next());
        return nextPiece;
    }
}

class Draw{
    
    static Setup = ()=>{
        canvas = document.getElementById('myCanvas');
        ctx = canvas.getContext('2d');
        canvas.width = 650;
        canvas.height = 650;

        // Double the size of elements to fit the screen
        ctx.scale(1.5, 1.5);

        this.ClearCanvas();
        this.DrawGridLines();

        let sprintButton = document.getElementById('sprint');
        sprintButton.addEventListener('click', Logic.StartGameDelay);
        document.addEventListener('keydown', Logic.HandleKeyPress);
    }
    
    static DrawGridLines(){
        ctx.strokeStyle = 'grey';
        ctx.beginPath();
        
        for(let i = gameboardX + BLOCKSIZE + 1; i < gameboardX + 202 - BLOCKSIZE; i += BLOCKSIZE){
            ctx.moveTo(i, gameboardY);
            ctx.lineTo(i, gameboardY + 402);
            ctx.stroke();
        }
    
        for(let i = gameboardY + BLOCKSIZE + 1; i < gameboardY + 402 - BLOCKSIZE; i += BLOCKSIZE){
            ctx.moveTo(gameboardX, i);
            ctx.lineTo(gameboardX + 202, i);
            ctx.stroke();
        }
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

    static ClearCanvas(){
        // Draw Canvas background
        ctx.fillStyle = 'rgb(17,17,17)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw gameboard rectangle
        ctx.strokeStyle = 'white';
        ctx.strokeRect(gameboardX, gameboardY, 202, 402);
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

    static DrawPreview(){
        let coorX;
        let coorY;

        for(let i = 0; i < previewNo; i++){
            let piece = preview.list[i];
            let piecePosition = Logic.ConvertToCoordinates(piece);

            for(let j = 0; j < piecePosition.length; j++){
                let x = piecePosition[j][0];
                let y = piecePosition[j][1];
    
                if(y == -1){
                    coorY = coordinateArray[x][y+1].y - BLOCKSIZE;
                    coorX = coordinateArray[x][y+1].x;
                } else{
                    coorY = coordinateArray[x][y].y;
                    coorX = coordinateArray[x][y].x;
                }
                coorY += (BLOCKSIZE * 3) * i + (BLOCKSIZE * 2);
                coorX += BLOCKSIZE * 8;

                if(piece.shape == I){
                    coorY -= BLOCKSIZE;
                }

                ctx.fillStyle = 'rgb(' + piece.color[0] + ',' + piece.color[1] + ',' + piece.color[2] + ')';
                ctx.fillRect(coorX, coorY, BLOCKSIZE, BLOCKSIZE);
                
            }
        }
    }

    static DrawHold(){
        if(holdPiece == null){
            return;
        }
        let coorX;
        let coorY;
        let piecePosition = Logic.ConvertToCoordinates(holdPiece);
        for(let j = 0; j < piecePosition.length; j++){
            let x = piecePosition[j][0];
            let y = piecePosition[j][1];

            if(y == -1){
                coorY = coordinateArray[x][y+1].y - BLOCKSIZE;
                coorX = coordinateArray[x][y+1].x;
            } else{
                coorY = coordinateArray[x][y].y;
                coorX = coordinateArray[x][y].x;
            }
            coorY +=  BLOCKSIZE * 2;
            coorX -= BLOCKSIZE * 7;

            if(holdPiece.shape == I){
                coorY -= BLOCKSIZE;
                coorX -= BLOCKSIZE;
            }

            ctx.fillStyle = 'rgb(' + holdPiece.color[0] + ',' + holdPiece.color[1] + ',' + holdPiece.color[2] + ')';
            ctx.fillRect(coorX, coorY, BLOCKSIZE, BLOCKSIZE);
            
        }
    }
}

class Logic{
    static placePiece;
    static canHold = true; 

    static StartSprint = () =>{
        this.ResetEverything();
        CreateCoordArray();
        currentPiece = bag.Next();
        Logic.DrawBlocks();
        startTimer();
        gameStart = true;
    }

    static StartGameDelay = () =>{
        setTimeout(this.StartSprint, 0);
    }

    static ResetEverything(){
        bag = new Bag();
        preview = new Preview();
        coordinateArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));
        placedPiecesArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));
        currentPiece = null;
        holdPiece = null;
    }

    static HandleKeyPress = (key)=>{
        if(!(gameStart)){
            if(key.keyCode == STARTSPRINT){
                Logic.StartGameDelay();
            }
            return;
        }
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
                while(true){
                    currentPiece.y += 1;
                    if (!(Logic.ValidSpace(currentPiece))){
                        currentPiece.y -= 1;
                        break;
                    }
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
                if (!(Logic.ValidSpace(currentPiece))){
                    if (!(Logic.SRS(true))){
                        currentPiece.rotation -= 1;
                    }
                }
                break;

            case ROTATECOUNTER:
                if (currentPiece.rotation == 0){
                    currentPiece.rotation = currentPiece.shape.length - 1;
                } else{
                currentPiece.rotation -= 1;
                }

                if (!(Logic.ValidSpace(currentPiece))){
                    if (!(Logic.SRS(false))){
                        currentPiece.rotation += 1;
                    }
                }
                break;

            case HOLD:
                if(Logic.canHold){
                    Logic.canHold = false;
                    Logic.Hold();
                }
                break;
            
            case STARTSPRINT:
                Logic.StartGameDelay();
                break;

            default:
        }
        if(Logic.placePiece){
            this.ChangePiece();
            Logic.placePiece = false;
            Logic.canHold = true;
        }
        this.DrawBlocks();
    }

    static SRS(clockwise){
        let rotate = currentPiece.rotation % currentPiece.shape.length;
        if(currentPiece.shape == I){
            if(rotate == 0){
                if(clockwise){ //Rotate from 3 to 0
                    currentPiece.x += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 3;
                    currentPiece.y += 2;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 3;
                    currentPiece.y -= 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 2;
                    currentPiece.y += 1;
                    return false;
                } else{ //Rotate from 1 to 0
                    currentPiece.x += 2;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 3;
                    currentPiece.y -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 3;
                    currentPiece.y += 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    currentPiece.y -= 2;
                    return false;
                }
            }
            if(rotate == 1){
                if(clockwise){ //Rotate from 0 to 1
                    currentPiece.x -= 2;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 3;
                    currentPiece.y += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 3;
                    currentPiece.y -= 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    currentPiece.y += 2;
                    return false;
                } else{ //Rotate from 2 to 1
                    currentPiece.x += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 3;
                    currentPiece.y += 2;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 3;
                    currentPiece.y -= 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 2;
                    currentPiece.y += 1;
                    return false;
                }
            }
            if(rotate == 2){
                if(clockwise){
                    currentPiece.x -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 3;
                    currentPiece.y -= 2;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 3;
                    currentPiece.y += 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 2;
                    currentPiece.y -= 1;
                    return false;  
                } else{ //Rotate from 3 to 2
                    currentPiece.x -= 2;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 3;
                    currentPiece.y += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 3;
                    currentPiece.y -= 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    currentPiece.y += 2;
                    return false;
                }
            }
            if(rotate == 3){
                if(clockwise){ //Rotate from 2 to 3
                    currentPiece.x += 2;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 3;
                    currentPiece.y -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 3;
                    currentPiece.y += 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    currentPiece.y -= 2;
                    return false;
                } else{ //Rotate from 0 to 3
                    currentPiece.x -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 3;
                    currentPiece.y -= 2;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 3;
                    currentPiece.y += 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 2;
                    currentPiece.y -= 1;
                    return false;  
                }
            }
        } else{ //S Z L J T pieces
            if(rotate == 0){
                if(clockwise){
                    currentPiece.x -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.y += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    currentPiece.y -= 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    currentPiece.y += 2;
                    return false;
                } else{
                    currentPiece.x += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.y += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    currentPiece.y -= 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    currentPiece.y += 2;
                    return false;
                }
            }
            if(rotate == 1){
                if(clockwise){
                    currentPiece.x -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.y -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    currentPiece.y += 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    currentPiece.y -= 2;
                    return false;
                } else{
                    currentPiece.x -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.y -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    currentPiece.y += 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    currentPiece.y -= 2;
                    return false;
                }
            }
            if(rotate == 2){
                if(clockwise){
                    currentPiece.x += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.y += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    currentPiece.y -= 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    currentPiece.y += 2;
                    return false;
                } else{
                    currentPiece.x -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.y += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    currentPiece.y -= 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    currentPiece.y += 2;
                    return false;
                }
            }
            if(rotate == 3){
                if(clockwise){
                    currentPiece.x += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.y -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    currentPiece.y += 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    currentPiece.y -= 2;
                    return false;
                } else{
                    currentPiece.x += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.y -= 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    currentPiece.y += 3;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x += 1;
                    if(this.ValidSpace(currentPiece)){
                        return true;
                    }
                    currentPiece.x -= 1;
                    currentPiece.y -= 2;
                    return false;
                }
            }
        }
    }

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

        currentPiece = preview.Next();
        Logic.ClearRows();
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

    static DrawBlocks(){
        Draw.ClearCanvas();
        Draw.DrawGridLines();
        Draw.DrawGhostPiece();
        Draw.DrawPlacedBlocks();
        Draw.DrawCurrentPiece();
        Draw.DrawPreview();
        Draw.DrawHold();
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

    static Hold(){
        if(holdPiece == null){
            holdPiece = currentPiece;
            currentPiece = preview.Next();
        } else{
            let temp = currentPiece;
            currentPiece = holdPiece;
            holdPiece = temp;
        }
        
        if(bag.offset.includes(holdPiece.shape)){
            holdPiece.x = 4;
            holdPiece.y = 2;
        } else if(holdPiece.shape == I){
            holdPiece.x = 5;
            holdPiece.y = 3;
        } else if(holdPiece.shape == O){
            holdPiece.x = 5;
            holdPiece.y = 2;
        }
        holdPiece.rotation = 0;
    }
}

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
    for(let y = gameboardY + 1; y <= gameboardY + 402; y += BLOCKSIZE){
        for(let x = gameboardX + 1; x <= gameboardX + 202; x += BLOCKSIZE){
            coordinateArray[i][j] = new Coordinates(x,y);
            i++;
        }
        j++;
        i = 0;
    }
} 

function startTimer(){
    if(!running){
        startTime = new Date().getTime();
        tInterval = setInterval(getShowTime, 1);
   
        paused = 0;
        running = 1;
    }
}

function getShowTime(){
    updatedTime = new Date().getTime();
    difference =  updatedTime - startTime;

    var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((difference % (1000 * 60)) / 1000);
    var milliseconds = Math.floor((difference % (1000 * 60)) / 1);
    milliseconds = milliseconds % 1000;

    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    milliseconds = (milliseconds < 100) ? (milliseconds < 10) ? "00" + milliseconds : "0" + milliseconds : milliseconds;
    timerDisplay.innerHTML = minutes + ':' + seconds + ':' + milliseconds;
}
  
let bag = new Bag();
let preview = new Preview();
document.addEventListener('DOMContentLoaded', Draw.Setup);

