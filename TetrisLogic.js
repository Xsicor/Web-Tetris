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
let ROTATE180 = 'Space';
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
const fileSelect = document.getElementById("loadSkin"),
  fileElem = document.getElementById("fileElem");

let currentSkinCanvas = document.getElementById('currentSkinCanvas');
let currentSkinctx = currentSkinCanvas.getContext('2d');
currentSkinCanvas.width = 372;
currentSkinCanvas.height = 30;

let currentSkinIMG;
let app;


let running = 0;
let coordinateArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));
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

let shapes = [Z, L, O, S, I, J, T];
let shapeColors = [[255, 0, 0], [255, 165, 0], [255, 255, 0], [0, 255, 0], [0, 255, 255], [0, 0, 255], [128, 0, 128]];

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
        this.color = shapeColors[shapes.indexOf(shape)];
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
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        canvas.width = 650;
        canvas.height = 650;

        document.getElementById('currentEditedBlock').width = 120;
        document.getElementById('currentEditedBlock').height = 60;

        let editorSkin = document.getElementsByClassName('editorCanvasSkinBlock');
        for(let i = 0; i < editorSkin.length; i++){
            editorSkin[i].width = 30;
            editorSkin[i].height = 30;
            editorSkin[i].addEventListener('click', SkinEditor.ChangeBlock);
        }

        this.ClearCanvas();
        this.DrawGridLines();
        Settings.Setup()

        document.getElementById('sprint').addEventListener('click', Logic.StartGameDelay);
        document.getElementById('settings').addEventListener('click', Settings.Display);
        document.getElementById('skinCustomiser').addEventListener('click', this.showCustomiser);
        document.getElementById('currentSkin').addEventListener('click', this.ShowCurrentSkin);
        fileSelect.addEventListener("click", CustomSkin.LoadSkin, false);
        fileElem.addEventListener("change", CustomSkin.UpdateCurrentSkin);
        document.getElementById('skinEditor').addEventListener('click', SkinEditor.Click);
        document.getElementById('downloadSkin').addEventListener('click', downloadCanvas, false);
        document.getElementById('saveEditorSkin').addEventListener('click', SkinEditor.SaveSkin);
        document.getElementById('cancelSkin').addEventListener('click', SkinEditor.ExitEditor);
        
        this.DrawDefaultSkin();
        document.getElementById('editor').appendChild(startPixelEditor({}));
    }

    static showCustomiser() {
        let options = document.getElementById('skinEditorOptions');
        if(options.style.display === 'none'){
            options.style.display = 'block';
        } else {
            options.style.display = 'none';
            currentSkinCanvas.style.display = 'none';
        }
    }

    static DrawBlock(piece, x, y){
        let sx = shapes.indexOf(piece.shape) * 31;
        let sy = 0
        ctx.drawImage(currentSkinCanvas, sx, sy, BLOCKSIZE, BLOCKSIZE, x, y, BLOCKSIZE, BLOCKSIZE);
    }

    static DrawDefaultSkin(){
        let x = 0;
        let y = 0;
        for(let i = 0; i < 7; i++){
            currentSkinctx.fillStyle = 'rgb(' + shapeColors[i][0] + ',' + shapeColors[i][1] + ',' + shapeColors[i][2] + ')';
            currentSkinctx.fillRect(x, y, BLOCKSIZE, BLOCKSIZE);
            x += 31;
        }
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
    
    static DrawPlacedBlocks = ()=>{
        for(let x = 0; x < placedPiecesArray.length; x++){
            for(let y = 0; y < placedPiecesArray[x].length; y++){
                if (!(typeof placedPiecesArray[x][y] == "string")) {
                    continue;
                }
                let coorX = coordinateArray[y][x].x;
                let coorY = coordinateArray[y][x].y;

                let sx = parseInt(placedPiecesArray[x][y]) * 31;
                let sy = 0
                ctx.drawImage(currentSkinCanvas, sx, sy, BLOCKSIZE, BLOCKSIZE, coorX, coorY, BLOCKSIZE, BLOCKSIZE);
            }
        }
    }

    static DrawCurrentPiece = ()=>{
        let piecePosition = Logic.ConvertToCoordinates(currentPiece);

        for(let i = 0; i < piecePosition.length; i++){
            let x = piecePosition[i][0];
            let y = piecePosition[i][1];

            if(y > -1){
                let coorY = coordinateArray[x][y].y;
                let coorX = coordinateArray[x][y].x;

                this.DrawBlock(currentPiece, coorX, coorY);
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

    static DrawGhostPiece = ()=>{
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

                this.DrawBlock(currentPiece, coorX, coorY);
                ctx.globalCompositeOperation = "saturation";
                ctx.fillStyle = "hsl(0,25%,50%)";  // saturation at 100%
                ctx.fillRect(coorX, coorY, BLOCKSIZE, BLOCKSIZE);  // apply the comp filter
                ctx.globalCompositeOperation = "source-over";  // restore default comp
            }
        }

        currentPiece.y -= counter;
    }

    static DrawPreview = ()=>{
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

                this.DrawBlock(piece, coorX, coorY);
            }
        }
    }

    static DrawHold = ()=>{
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

            this.DrawBlock(holdPiece, coorX, coorY);
            
        }
    }

    static DrawLinesCleared(){
        ctx.fillStyle = 'grey';
        ctx.font = '10px Arial'
        ctx.fillText('Lines Cleared', 80, 560);
        ctx.font = '20px Arial';
        ctx.fillText(Logic.linesCleared + '/40', 90, 590);
    }

    static ShowCurrentSkin(){
        if(currentSkinCanvas.style.display == 'none'){
            currentSkinCanvas.style.display = 'block';
        } else {
            currentSkinCanvas.style.display = 'none';
        }
    }
}

class SkinEditor{

    static coordinates;
    static skinBlockctx;
    static shapesIndex;
    
    static Click = ()=>{
        this.coordinates = [[1,0], [2,0], [2,1], [3,1]];
        this.skinBlockctx = document.getElementById('zBlock').getContext('2d');
        document.getElementById('skinEditor').disabled = true;
        document.getElementById('editorWrapper').style.display = 'block'
        this.DrawSkin();
        this.DrawBlockCanvas();
        this.DrawEditedBlock();
    }

    static DrawBlockCanvas(){
        let blockPicture = CreateBlockPicture(this.skinBlockctx);
        let state = app.state;
        state.picture = blockPicture;
        app.syncState(state);
    }

    static SaveSkin = ()=>{
        let editorSkin = document.getElementsByClassName('editorCanvasSkinBlock');
        let sy = 0;
        for(let i = 0; i < editorSkin.length; i++){
            let sx = i * 31;
            currentSkinctx.drawImage(editorSkin[i], 0, 0, BLOCKSIZE, BLOCKSIZE, sx, sy, BLOCKSIZE, BLOCKSIZE);
        }
        this.ExitEditor();
    }

    static ExitEditor(){
        document.getElementById('skinEditor').disabled = false;
        document.getElementById('editorWrapper').style.display = 'none'
    }

    static DrawEditedBlock = ()=>{
        for(let i = 0; i < 4; i++){
            document.getElementById('currentEditedBlock').getContext('2d').drawImage(
                this.skinBlockctx.canvas, 0, 0, BLOCKSIZE, BLOCKSIZE, this.coordinates[i][0] * BLOCKSIZE, this.coordinates[i][1] * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE);
        }
    }

    static ChangeBlock = (e)=>{
        let blockName = e.target.id;
        document.getElementById('currentEditedBlock').getContext('2d').clearRect(0, 0, 120, 60);
        console.log(blockName);
        switch(blockName) {
            case 'zBlock':
                this.skinBlockctx = document.getElementById('zBlock').getContext('2d');
                this.coordinates = [[1,0], [2,0], [2,1], [3,1]];
                break;
            
            case 'lBlock':
                console.log('running');
                this.skinBlockctx = document.getElementById('lBlock').getContext('2d');
                this.coordinates = [[3,0], [3,1], [2,1], [1,1]];
                break;
            
            case 'oBlock':
                console.log('running');
                this.skinBlockctx = document.getElementById('oBlock').getContext('2d');
                this.coordinates = [[1,0], [2,0], [1,1], [2,1]];
                break;

            case 'sBlock':
                console.log('running');
                this.skinBlockctx = document.getElementById('sBlock').getContext('2d');
                this.coordinates = [[2,0], [1,0], [1,1], [0,1]];
                break;

            case 'iBlock':
                console.log('running');
                this.skinBlockctx = document.getElementById('iBlock').getContext('2d');
                this.coordinates = [[0,1], [1,1], [2,1], [3,1]];
                break;

            case 'jBlock':
                console.log('running');
                this.skinBlockctx = document.getElementById('jBlock').getContext('2d');
                this.coordinates = [[1,0], [3,1], [2,1], [1,1]];
                break;

            case 'tBlock':
                console.log('running');
                this.skinBlockctx = document.getElementById('tBlock').getContext('2d');
                this.coordinates = [[2,0], [1,1], [2,1], [3,1]];
                break;
            
        }
        this.DrawBlockCanvas();
        this.DrawEditedBlock();
    }

    static updateEditedBlock = (pixels)=>{
        for (let {x, y, color} of pixels) {
            for(let i = 0; i < 4; i++){
                let newX = (this.coordinates[i][0] * BLOCKSIZE) + x;
                let newY = (this.coordinates[i][1] * BLOCKSIZE) + y;
                document.getElementById('currentEditedBlock').getContext('2d').fillStyle = color;
                document.getElementById('currentEditedBlock').getContext('2d').fillRect(newX, newY, 1, 1);
            }
        }
    }

    static updateSkin = (pixels)=>{
        for (let {x, y, color} of pixels) {
            this.skinBlockctx.fillStyle = color;
            this.skinBlockctx.fillRect(x, y, 1, 1);
        }
    }

    static DrawSkin(){
        let editorSkin = document.getElementsByClassName('editorCanvasSkinBlock');
        let sy = 0;
        for(let i = 0; i < editorSkin.length; i++){
            let sx = i * 31;
            editorSkin[i].getContext('2d').drawImage(
                currentSkinCanvas, sx, sy, BLOCKSIZE, BLOCKSIZE, 0, 0, BLOCKSIZE, BLOCKSIZE)
        }
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
            placedPiecesArray[position[1]][position[0]] = shapes.indexOf(currentPiece.shape).toString();
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
            if(!(placedPiecesArray[y][x] === 0)){
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

    static Display = ()=>{
        settingsMenu.style.display = "block";
    }

    static Setup = ()=>{
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
        document.getElementById('resetGame').value = STARTSPRINT;
        document.getElementById('resetGame').addEventListener('click', this.GetKey);
    }

    static GetKey = (event)=>{
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

            case 'resetGame':
                STARTSPRINT = this.newKey;
                document.getElementById('resetGame').value = STARTSPRINT;
                document.getElementById('resetGame').style.backgroundColor = 'white';
        }
    }

    static Submit(event){
        settingsMenu.style.display = 'none';
        event.preventDefault();
        das = document.getElementById('DAS').value
        arr = document.getElementById('ARR').value
    }
}

class CustomSkin{
    static newSkinImage;
    static newSkinFile;

    static LoadSkin(){
        if (fileElem) {
            fileElem.click();
        }
    }

    static UpdateCurrentSkin = ()=>{
        this.newSkinFile = fileElem.files[0];
        const promise = createImageBitmap(this.newSkinFile);
        const promise2 = promise.then(function(skin){
            currentSkinctx.fillStyle = '#111';
            currentSkinctx.fillRect(0, 0, 372, 30);
            currentSkinctx.drawImage(skin, 0, 0, skin.width, skin.height, 0, 0, 372, 30);
        });
    }
}

function downloadCanvas() {
    let link = elt('a', {
        href: currentSkinCanvas.toDataURL(),
        download: 'TetrisSkin.png'
    });
      
    document.body.appendChild(link);
    link.click();
    link.remove();
    
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

class Picture {
  constructor(width, height, pixels) {
    this.width = width;
    this.height = height;
    this.pixels = pixels;
  }
  
  static empty(width, height, color) {
    let pixels = new Array(width*height).fill(color);
    return new Picture(width, height, pixels);
  }
  
  pixel(x,y) {
    return this.pixels[x + y * this.width];
  }
  
  draw(pixels) {
    let copy = this.pixels.slice();
    for (let {x, y, color} of pixels) {
      copy[x + y * this.width] = color;
    }
    SkinEditor.updateEditedBlock(pixels);
    SkinEditor.updateSkin(pixels);
    return new Picture(this.width, this.height, copy);
  }
}

// STATE MANAGEMENT BEGIN
// function introduced early in the chapter but made irrelevant by later extension of Undo Control.
// function updateState(state, action) {
//   return Object.assign({}, state, action);
// }

function historyUpdateState(state, action) {
  if (action.undo == true) {
    if (state.done.length == 0) return state;
    return Object.assign({}, state, {
      picture: state.done[0],
      done: state.done.slice(1),
      doneAt: 0
    });
  } else if (action.picture &&
            state.doneAt < Date.now() - 1000) {
    return Object.assign({}, state, action, {
      done: [state.picture, ...state.done],
      doneAt: Date.now()
    });
  } else {
    return Object.assign({}, state, action);
  }
}
// STATE MANAGEMENT END

// helper function to quickly create and insert dom nodes
function elt(type, props, ...children) {
  let dom = document.createElement(type);
  
  if (props) Object.assign(dom, props);
  
  for (let child of children) {
    if (typeof child != "string") dom.appendChild(child);
    else dom.appendChild(document.createTextNode(child));
  }
  
  return dom;
}

const scale = 10;

class PictureCanvas {
  constructor(picture, pointerDown) {
    this.dom = elt("canvas", {
      onmousedown: event => this.mouse(event, pointerDown),
      ontouchstart: event => this.touch(event, pointerDown)
    });
    this.syncState(picture);
  }
  
  syncState(picture) {
    if (this.picture == picture) return;
    drawPicture(picture, this.dom, scale, this.picture);
  }
  
  mouse(downEvent, onDown) {
    if (downEvent.button != 0) return;
    
    let pos = pointerPosition(downEvent, this.dom);
    let onMove = onDown(pos);
    
    if (!onMove) return;
    
    let move = moveEvent => {
      if (moveEvent.buttons == 0) {
        this.dom.removeEventListener('mousemove', move)
      } else {
        let newPos = pointerPosition(moveEvent, this.dom);
        if (newPos.x == pos.x && newPos.y == pos.y) return;
        
        pos = newPos;
        onMove(newPos);
      }
    };
    
    this.dom.addEventListener('mousemove', move);
  }
  
  touch(startEvent, onDown) {
    let pos = pointerPosition(startEvent.touches[0], this.dom);
    let onMove = onDown(pos);
    startEvent.preventDefault();
    if (!onMove) return;
    
    let move = moveEvent => {
      let newPos = pointerPosition(moveEvent.touches[0],
                                  this.dom);
      if (newPos.x == pos.x && newPos.y == pos.y) return;
      pos = newPos;
      onMove(newPos);
    };
    
    let end = () => {
      this.dom.removeEventListener('touchmove', move);
      this.dom.removeEventListener('touchend', end);
    };
    
    this.dom.addEventListener('touchmove', move);
    this.dom.addEventListener('touchend', end);
  }
}

function drawPicture(newPic, canvas, scale, oldPic) {
  if (!oldPic || oldPic.width !== newPic.width && oldPic.height !== newPic.height) {
    canvas.width = newPic.width * scale;
    canvas.height = newPic.height * scale;        
  }
  let cx = canvas.getContext('2d');
  
  for (let y=0; y<newPic.height; y++) {
    for (let x=0; x<newPic.width; x++) {
      if (!oldPic || oldPic.pixel(x, y) !== newPic.pixel(x, y)) {
        cx.fillStyle = newPic.pixel(x, y);
        cx.fillRect(x * scale, y * scale, scale, scale);        
      }
    }
  }
}

function pointerPosition(pos, domNode) {
  let rect = domNode.getBoundingClientRect();
  return {x: Math.floor((pos.clientX - rect.left) / scale),
          y: Math.floor((pos.clientY - rect.top) / scale)};
}

// UI ELEMENTS BEGIN
class PixelEditor {
  constructor(state, config) {
    let {tools, controls, dispatch} = config;
    this.state = state;
    
    this.canvas = new PictureCanvas(state.picture, pos => {
      let tool = tools[this.state.tool];
      let onMove = tool(pos, this.state, dispatch);
      if (onMove) return pos => onMove(pos, this.state);
    });
    this.controls = controls.map(
      Control => new Control(state, config));
    this.dom = elt('div', {tabIndex: 0}, this.canvas.dom, elt('br'),
                   ...this.controls.reduce(
                     (a,c) => a.concat(' ', c.dom), []));
    
    this.dom.addEventListener('keydown', e => {
      
      // listen for Ctrl / Cmd key + assigned control shortcut letter
      if (e.ctrlKey) {
        this.controls.forEach((ctrl,i) => {
          if (ctrl.shortcut && e.code === `Key${ctrl.shortcut}`) {
            e.preventDefault();
            ctrl.dom.click();
          }
        });
      } else {
        // listen for first letter of tool names
        let toolShortcuts = Object.keys(tools).map(tool => tool.slice(0,1));
        toolShortcuts.forEach(letter => {
          if (e.key === letter) { 
            dispatch({tool: Object.keys(tools)[toolShortcuts.indexOf(letter)]});
          }
        });        
      }
    });
  }
  
  syncState(state) {
    this.state = state;
    this.canvas.syncState(state.picture);
    for (let ctrl of this.controls) ctrl.syncState(state);
  }
}

class ToolSelect {
  constructor(state, {tools, dispatch}) {
    this.select = elt('select', {
      onchange: () => dispatch({tool: this.select.value})
    }, ...Object.keys(tools).map(name => elt('option', {
      selected: name == state.tool
    }, name)));
    this.dom = elt('label', null, '🖌 Tool: ', this.select);
  }
  
  syncState(state) { this.select.value = state.tool; }
}

class ColorSelect {
  constructor(state, {dispatch}) {
    this.input = elt('input', {
      type: "color",
      value: state.color,
      onchange: () => dispatch({color: this.input.value})
    });
    this.dom = elt('label', null, "🎨 Color: ", this.input);
    this.shortcut = 'C';
  }
  
  syncState(state) { this.input.value = state.color; }
}

class SaveButton {
  constructor(state) {
    this.picture = state.picture;
    this.dom = elt('button', {
      onclick: () => this.save()
    }, '💾 Save');
    this.shortcut = 'S';
  }
  
  save() {
    let canvas = elt('canvas');
    drawPicture(this.picture, canvas, 5);
    let link = elt('a', {
      href: canvas.toDataURL(),
      download: 'pixelart.png'
    });
    
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  
  syncState(state) { this.picture = state.picture; }
}

class LoadButton {
  constructor(_, {dispatch}) {
    this.dom = elt('button', {
      onclick: () => startLoad(dispatch)
    }, '📁 Load');
    this.shortcut = 'L';
  }
  
  syncState() {}
}

function startLoad(dispatch) {
  let input = elt('input', {
    type: "file",
    onchange: () => finishLoad(input.files[0], dispatch)
  });
  
  document.body.appendChild(input);
  input.click();
  input.remove();
}

function finishLoad(file, dispatch) {
  if (file == null) return;
  let reader = new FileReader();
  reader.addEventListener('load', () => {
    let image = elt('img', {
      onload: () => dispatch({
        picture: pictureFromImage(image)
      }),
      src: reader.result
    });
  });
  reader.readAsDataURL(file);
}

function pictureFromImage(image) {
  let width = Math.min(100, image.width);
  let height = Math.min(100, image.height);
  let canvas = elt('canvas', {width, height});
  let cx = canvas.getContext('2d');
  cx.drawImage(image, 0, 0);
  
  let pixels = [];
  let {data} = cx.getImageData(0, 0, width, height);
  
  function hex(n) { //helper function to make rgb color strings from canvas ImageData
    return n.toString(16).padStart(2, "0");
  }
  
  for (let i=0; i<data.length; i+=4) {
    let [r, g, b] = data.slice(i, i+3);
    pixels.push(`#${hex(r)}${hex(g)}${hex(b)}`);
  }
  return new Picture(width, height, pixels);
}

class UndoButton {
  constructor(state, {dispatch}) {
    this.dom = elt('button', {
      onclick: () => dispatch({undo: true}),
      disabled: state.done.length == 0
    }, '⮪ Undo');
    this.shortcut = 'Z';
  }
  
  syncState(state) {
    this.dom.disabled = state.done.length == 0;
  }
}
// UI ELEMENTS END


// DRAWING FUNCTIONALITY BEGIN
function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)**2+(y2-y1)**2);
}

function drawLine(from, to, color) {
  let points = [];
  if (Math.abs(from.x - to.x) > Math.abs(from.y - to.y)) {
    if (from.x > to.x) [from, to] = [to, from];
    let slope = (to.y - from.y) / (to.x - from.x);
    for (let {x, y} = from; x <= to.x; x++) {
      points.push({x, y: Math.round(y), color});
      y += slope;
    }
  }
  else {
    if (from.y > to.y) [from, to] = [to, from];
    let slope = (to.x - from.x) / (to.y - from.y);
    for (let {x, y} = from; y <= to.y; y++) {
      points.push({x: Math.round(x),y, color});
      x += slope;
    }
  }
  return points;
}

function draw(pos, state, dispatch) {
  function connect(newPos, state) {
    let line = drawLine(pos, newPos, state.color);
    pos = newPos;
    dispatch({picture: state.picture.draw(line)});
  }
  connect(pos, state);
  return connect;
}

function line(start, state, dispatch) {
  return end => {
    let line = drawLine(start, end, state.color);
    dispatch({picture: state.picture.draw(line)});
  };
}

function rectangle(start, state, dispatch) {
  function drawRectangle(pos) {
    let xStart = Math.min(start.x, pos.x);
    let yStart = Math.min(start.y, pos.y);
    let xEnd = Math.max(start.x, pos.x);
    let yEnd = Math.max(start.y, pos.y);
    let drawn = [];
    for (let y=yStart; y<=yEnd; y++) {
      for (let x=xStart; x<=xEnd; x++) {
        drawn.push({x, y, color: state.color});
      }
    }
    dispatch({picture: state.picture.draw(drawn)});
  }
  drawRectangle(start);
  return drawRectangle;
}

function circle(start, state, dispatch) {
  function drawCircle(pos) {
    let drawn = [];
    let r = Math.floor(dist(start.x, start.y, pos.x, pos.y));
    
    for (let y=start.y-r; y<=start.y+r; y++) {
      for (let x=start.x-r; x<=start.x+r; x++) {
        if (Math.floor(dist(start.x, start.y, x, y)) <= r) {
          drawn.push({x, y, color: state.color});
        }
      }
    }
    dispatch({picture: state.picture.draw(drawn)});
  }
  drawCircle(start);
  return drawCircle;
}

const around = [{dx: -1, dy: 0}, {dx: 1, dy: 0},
                {dx: 0, dy: -1}, {dx: 0, dy: 1}];

function fill({x, y}, state, dispatch) {
  let targetColor = state.picture.pixel(x, y);
  let drawn = [{x, y, color: state.color}];
  for (let done=0; done<drawn.length; done++) {
    for (let {dx, dy} of around) {
      let x = drawn[done].x + dx, y = drawn[done].y + dy;

      if (x >= 0 && x < state.picture.width &&
          y >= 0 && y < state.picture.height &&
          state.picture.pixel(x, y) == targetColor &&
         !drawn.some(p => p.x == x && p.y == y)) {
        drawn.push({x, y, color: state.color});
      }
    }
  }
  
  dispatch({picture: state.picture.draw(drawn)});
}

function pick(pos, state, dispatch) {
  dispatch({color: state.picture.pixel(pos.x, pos.y)});
}
// DRAWING FUNCTIONALITY END

function CreateBlockPicture(canvas){
    let testPicture = Picture.empty(30, 30, "#f0f0f0");
    let currentSkinImageData = canvas.getImageData(0, 0, BLOCKSIZE, BLOCKSIZE);
    let pixels = []
    for(let j = 0; j < BLOCKSIZE; j++){
        for(let i = 0; i < BLOCKSIZE; i++){
            let colorIndices = getColorIndicesForCoord(i, j, BLOCKSIZE);

            var redIndex = colorIndices[0];
            var greenIndex = colorIndices[1];
            var blueIndex = colorIndices[2];

            var r = currentSkinImageData.data[redIndex];
            var g = currentSkinImageData.data[greenIndex];
            var b = currentSkinImageData.data[blueIndex];
                
            let colorHex = ConvertToHex(r, g, b);
            let pixel = {x: i, y: j, color: colorHex};

            pixels.push(pixel);
        }
    }
    testPicture = testPicture.draw(pixels);
    return testPicture;
}

function getColorIndicesForCoord(x, y, width) {
    var red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
}

function ConvertToHex(r, g, b){
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);
  
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    return "#" + r + g + b;
}
// Initiate App
let startState = { tool: "draw",
             color: "#000000",
             picture: Picture.empty(30, 30, '#f0f0f0'),
             done: [],
             doneAt: 0
            };
const baseTools = {draw, line, fill, circle, rectangle, pick};
const baseControls = [ToolSelect, ColorSelect, UndoButton];

function startPixelEditor({state = startState,
                           tools = baseTools,
                           controls = baseControls}) {
  app = new PixelEditor(state, {
    tools,
    controls,
    dispatch(action) {
      state = historyUpdateState(state, action);
      app.syncState(state);
    }
  });  
  return app.dom;
}
