let canvas;
let ctx;
const gBArrayHeight = 20; // Number of cells in array height
const gBArrayWidth = 10; // Number of cells in array width
const gameboardX = 175;
const gameboardY = 20;
const BLOCKSIZE = 30;

let MOVELEFT = 'ArrowLeft';
let MOVERIGHT = 'ArrowRight';
let HARDDROP = 'ArrowUp';
let SOFTDROP = 'ArrowDown';
let ROTATECLOCKWISE = 'KeyX';
let ROTATECOUNTER = 'KeyZ';
let ROTATE180 = 32;
let HOLD = 'KeyC';
let STARTSPRINT = 'KeyF';

let das = 100;
let arr = 0;
let previewNo = 5;
let holdPiece = null;
let currentPiece;
let linesCleared;
let gameStart = false;
let autoRepeatRateHandler;
let fall;

var timerDisplay = document.getElementById('timer');
let settingsMenu = document.getElementById('settingsMenu');
let settingsForm = document.getElementById('settingsForm');

let running = 0;
let coordinateArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));

// 6. Array for storing stopped shapes
// It will hold colors when a shape stops and is added
let placedPiecesArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));

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

class Timer{
    constructor(functionCheck){
        this.startTime;
        this.tInterval;
        this.paused = true;
        this.running = false;
        this.minutes = 0;
        this.seconds = 0;
        this.difference = 0
        this.milliseconds = 0;
        this.functionCheck = functionCheck;
    }

    Reset = () =>{
        clearInterval(this.tInterval);
        this.paused = true;
        this.running = false;
        this.difference = 0;
        this.milliseconds = 0;
        this.seconds = 0;
        this.minutes = 0;
    }

    Start = () =>{
        this.startTime = new Date().getTime();
        this.tInterval = setInterval(this.Update, 1);
        this.paused = false;
        this.running = true;
    }

    Stop = () =>{
        clearInterval(this.tInterval);
    }

    Update = () =>{
        let updatedTime = new Date().getTime();
        this.difference =  updatedTime - this.startTime;

        this.minutes = Math.floor((this.difference % (1000 * 60 * 60)) / (1000 * 60));
        this.seconds = Math.floor((this.difference % (1000 * 60)) / 1000);
        this.milliseconds = Math.floor((this.difference % (1000 * 60)) / 1);
        this.milliseconds = this.milliseconds % 1000;

        this.minutes = (this.minutes < 10) ? "0" + this.minutes : this.minutes;
        this.seconds = (this.seconds < 10) ? "0" + this.seconds : this.seconds;
        this.milliseconds = (this.milliseconds < 100) ? (this.milliseconds < 10) ? "00" + this.milliseconds : "0" + this.milliseconds : this.milliseconds;
        this.functionCheck(this.milliseconds);
    }
}

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

        this.ClearCanvas();
        this.DrawGridLines();

        let sprintButton = document.getElementById('sprint');
        sprintButton.addEventListener('click', Logic.StartGameDelay);
        let settingsButton = document.getElementById('settings');
        settingsButton.addEventListener('click', Settings.Display);
    }

    static DrawTimer(){
        timerDisplay.innerHTML = this.minutes + ':' + this.seconds + ':' + this.milliseconds;
    }
    
    static DrawGridLines(){
        ctx.strokeStyle = 'grey';
        ctx.beginPath();
        
        for(let i = gameboardX + BLOCKSIZE + 1; i < gameboardX + 302 - BLOCKSIZE; i += BLOCKSIZE){
            ctx.moveTo(i, gameboardY);
            ctx.lineTo(i, gameboardY + 602);
            ctx.stroke();
        }
    
        for(let i = gameboardY + BLOCKSIZE + 1; i < gameboardY + 602 - BLOCKSIZE; i += BLOCKSIZE){
            ctx.moveTo(gameboardX, i);
            ctx.lineTo(gameboardX + 302, i);
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
        ctx.strokeRect(gameboardX, gameboardY, 302, 602);
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

    static DrawLinesCleared(){
        ctx.fillStyle = 'grey';
        ctx.font = '10px Arial'
        ctx.fillText('Lines Cleared', 80, 560);
        ctx.font = '20px Arial';
        ctx.fillText(Logic.linesCleared + '/40', 90, 590);
    }
}

class Logic{
    static placePiece;
    static canHold = true; 
    static leftDas = false;
    static rightDas = false;
    static leftKeyHeld = false;
    static rightKeyHeld = false;
    static firstKeyHeld = 0; //If both left and right keys held same time
    static softdropHeld = false;
    static linesCleared = 0;

    static AutoRepeat = () =>{
        if(this.firstKeyHeld == 0){
            if(this.leftDas){
                while(true){
                    currentPiece.x -= 1;
                    if (!(this.ValidSpace(currentPiece))){
                        currentPiece.x += 1;
                        break;
                    }
                }
            } else if(this.rightDas){
                while(true){
                    currentPiece.x += 1;
                    if (!(this.ValidSpace(currentPiece))){
                        currentPiece.x -= 1;
                        break;
                    }
                }
            }
        }
        if(this.firstKeyHeld == MOVERIGHT){ //Move piece left as left key pressed most recently
            if(this.leftDas){
                while(true){
                    currentPiece.x -= 1;
                    if (!(this.ValidSpace(currentPiece))){
                        currentPiece.x += 1;
                        break;
                    }
                }
            }
        } else if(this.firstKeyHeld == MOVELEFT){ //Move piece right as right key pressed most recently
            if(this.rightDas){
                while(true){
                    currentPiece.x += 1;
                    if (!(this.ValidSpace(currentPiece))){
                        currentPiece.x -= 1;
                        break;
                    }
                }
            }
        }
        if(this.softdropHeld){
            while(true){
                currentPiece.y += 1;
                if (!(Logic.ValidSpace(currentPiece))){
                    currentPiece.y -= 1;
                    break;
                }
            }
        }

        Logic.DrawBlocks();
        return;
    }

    static HandleKeyUp = (key) =>{
        switch(key.code){
            case MOVELEFT:
                this.leftDas = false;
                this.leftKeyHeld = false;
                this.firstKeyHeld = 0;
                leftDasTimer.Reset();
                break;

            case MOVERIGHT:
                this.rightDas = false;
                this.rightKeyHeld = false;
                this.firstKeyHeld = 0;
                rightDasTimer.Reset();
                break;

            case SOFTDROP:
                this.softdropHeld = false;
                break;
            default:
        }
    }

    static CheckDas = (milliseconds) =>{
        let truncatedMilliseconds = parseInt(milliseconds, 10);
        if(truncatedMilliseconds >= das){
            if(this.leftKeyHeld){
                this.leftDas = true;
                leftDasTimer.Reset();
            }
            if(this.rightKeyHeld){
                this.rightDas = true;
                rightDasTimer.Reset();
            }
        }
    }

    static HandleKeyPress = (key) =>{
        // if(!(gameStart)){
        //     if(key.keyCode == STARTSPRINT){
        //         Logic.StartGameDelay();
        //     }
        //     return;
        // }
        switch(key.code){
            case MOVELEFT:
                if(!(this.leftKeyHeld)){
                    leftDasTimer.Start();
                    this.leftKeyHeld = true;
                    if(this.rightKeyHeld){
                        this.firstKeyHeld = MOVERIGHT;
                    }
                
                    currentPiece.x -= 1;
                    if(!(this.ValidSpace(currentPiece))){
                        currentPiece.x += 1;
                    }
                }
                break;
            
            case MOVERIGHT:
                if(!(this.rightKeyHeld)){
                    rightDasTimer.Start();
                    this.rightKeyHeld = true;
                    if(this.leftKeyHeld){
                        this.firstKeyHeld = MOVELEFT;
                    }

                    currentPiece.x += 1;
                    if(!(this.ValidSpace(currentPiece))){
                        currentPiece.x -= 1;
                    }
                }
                break;
            
            case SOFTDROP:
                if(!(this.softdropHeld)){
                    this.softdropHeld = true;
                    while(true){
                        currentPiece.y += 1;
                        if (!(Logic.ValidSpace(currentPiece))){
                            currentPiece.y -= 1;
                            break;
                        }
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

    static Fall(){
        currentPiece.y += 1;
        if(!(Logic.ValidSpace(currentPiece))){
            currentPiece.y -= 1;
        }
    }

    static StartSprint = () =>{
        this.ResetEverything();
        CreateCoordArray();
        currentPiece = bag.Next();
        Logic.DrawBlocks();
        sprintTimer.Start();
        gameStart = true;
        autoRepeatRateHandler = setInterval(Logic.AutoRepeat, 1);
        fall = setInterval(Logic.Fall, 750);
        this.linesCleared = 0;
        document.addEventListener('keydown', Logic.HandleKeyPress);
        document.addEventListener('keyup', Logic.HandleKeyUp);
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
        clearInterval(autoRepeatRateHandler);
        clearInterval(fall);
        sprintTimer.Reset();
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

    static CheckLoss(piecePosition){ //TODO Fix check 
        for(let i = 0; i < piecePosition.length; i++){
            if(piecePosition[i][1] < -1){
                return true;
            }
        }
        return false;
    }

    static EndGame(){
        sprintTimer.Stop();
        clearInterval(autoRepeatRateHandler);
        clearInterval(fall);
        gameStart = false;
        leftDasTimer.Reset();
        rightDasTimer.Reset();
        document.removeEventListener('keydown', Logic.HandleKeyPress)
        document.removeEventListener('keyup', Logic.HandleKeyUp)
    }
    
    static ChangePiece = () =>{
        let piecePosition = Logic.ConvertToCoordinates(currentPiece);
        for(const position of piecePosition){
            placedPiecesArray[position[1]][position[0]] = 'rgb(' + currentPiece.color[0] + ',' + currentPiece.color[1] + ',' + currentPiece.color[2] + ')';
        }

        currentPiece = preview.Next();
        this.linesCleared += Logic.ClearRows();
        if(this.linesCleared >= 40){
            this.EndGame();
        }
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
        Draw.DrawLinesCleared();
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
        return lines;
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

class Settings{
    static newKey = '';
    static bindingToChange = '';

    static Display = () =>{
        settingsMenu.style.display = "block";
        settingsForm.addEventListener('submit', this.Submit);
        document.getElementById('DAS').value = das;
        document.getElementById('ARR').value = arr;
        document.getElementById('hardDrop').value = HARDDROP;
        document.getElementById('hardDrop').addEventListener('click', this.GetKey);
        document.getElementById('softDrop').value = SOFTDROP;
        document.getElementById('softDrop').addEventListener('click', this.GetKey);
        document.getElementById('moveLeft').value = MOVELEFT;
        document.getElementById('moveLeft').addEventListener('click', this.GetKey);
        document.getElementById('moveRight').value = MOVERIGHT;
        document.getElementById('moveRight').addEventListener('click', this.GetKey);
        document.getElementById('clockwise').value = ROTATECLOCKWISE;
        document.getElementById('clockwise').addEventListener('click', this.GetKey);
        document.getElementById('counterClockwise').value = ROTATECOUNTER;
        document.getElementById('counterClockwise').addEventListener('click', this.GetKey);
        document.getElementById('hold').value = HOLD;
        document.getElementById('hold').addEventListener('click', this.GetKey);
    }

    static GetKey = (event) =>{
        document.addEventListener('keydown', this.ChangeBinding);
        this.bindingToChange = event.currentTarget.id;
        event.currentTarget.style.backgroundColor = "yellow";
    }

    static ChangeBinding = (key, action) =>{
        this.newKey = key.code;
        document.removeEventListener('keydown', this.ChangeBinding);

        switch(this.bindingToChange){
            case 'hardDrop':
                HARDDROP = this.newKey;
                document.getElementById('hardDrop').value = HARDDROP;
                document.getElementById('hardDrop').style.backgroundColor = 'white';
                break;

            case 'softDrop':
                SOFTDROP = this.newKey;
                document.getElementById('softDrop').value = SOFTDROP;
                document.getElementById('softDrop').style.backgroundColor = 'white';
                break;

            case 'moveLeft':
                MOVELEFT = this.newKey;
                document.getElementById('moveLeft').value = MOVELEFT;
                document.getElementById('moveLeft').style.backgroundColor = 'white';
                break;

            case 'moveRight':
                MOVERIGHT = this.newKey;
                document.getElementById('moveRight').value = MOVERIGHT;
                document.getElementById('moveRight').style.backgroundColor = 'white';
                break;

            case 'clockwise':
                ROTATECLOCKWISE = this.newKey;
                document.getElementById('clockwise').value = ROTATECLOCKWISE;
                document.getElementById('clockwise').style.backgroundColor = 'white';
                break;

            case 'counterClockwise':
                ROTATECOUNTER = this.newKey;
                document.getElementById('counterClockwise').value = ROTATECOUNTER;
                document.getElementById('counterClockwise').style.backgroundColor = 'white';
                break;

            case 'hold':
                HOLD = this.newKey;
                document.getElementById('hold').value = HOLD;
                document.getElementById('hold').style.backgroundColor = 'white';
                break;
        }
    }

    static Submit(event){
        settingsMenu.style.display = 'none';
        event.preventDefault();
        das = document.getElementById('DAS').value
        arr = document.getElementById('ARR').value
    }
}

function Shuffle(a){
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
    for(let y = gameboardY + 1; y <= gameboardY + 602; y += BLOCKSIZE){
        for(let x = gameboardX + 1; x <= gameboardX + 302; x += BLOCKSIZE){
            coordinateArray[i][j] = new Coordinates(x,y);
            i++;
        }
        j++;
        i = 0;
    }
} 

let bag = new Bag();
let preview = new Preview();
let sprintTimer = new Timer(Draw.DrawTimer);
let leftDasTimer = new Timer(Logic.CheckDas);
let rightDasTimer = new Timer(Logic.CheckDas);
document.addEventListener('DOMContentLoaded', Draw.Setup);

