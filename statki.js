gameTable = [[],[],[],[],[],[],[],[]];
selectedShip = 0;
selectedOrientation = 0;
availableShips = [2,2,2,2];
currentShipHint = [];

class Ship{
    constructor(length, tiles){
        this.length = length;
        this.damaged = 0;
        this.tiles = tiles;
    }
    isDead() {
        return this.damaged == this.length;
    }
    doDamage(){
        if(this.damaged < this.length)
            this.damaged++;
    }
}

function getTileHTMLElement(x,y){
    return document.getElementById("tilex" + x + "y" + y);
}

function newGame(){
    gamehtml = document.getElementById("game");
    var html = "<table>";
    for (let y = 0; y < 8; y++) {
        html += "<tr>";
        for (let x = 0; x < 8; x++) {
            html += "<td id='tilex"+x+"y"+y+"' class='water' onclick='onTileClick(this, "+x+", "+y+");' onmouseenter='onTileMouseEnter(this, "+x+", "+y+")'> </td>";
        }
        html += "</tr>";
    }
    html += "</table>";
    gamehtml.innerHTML = html;

    for (let x = 0; x < 8; x++)
        for (let y = 0; y < 8; y++)
            gameTable[x][y] = [0, null, getTileHTMLElement(x, y)];
}

function isValidTile(x,y){
    return !(x < 0 || x > 7 || y < 0 || y > 7);
}

function canBeAShipTile(x,y){
    if(!isValidTile(x, y))
        return false;
    const alldirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for(let i = 0; i < alldirs.length; i++){
        var ox = alldirs[i][0];
        var oy = alldirs[i][1];
        if(!isValidTile(x + ox, y + oy))
            continue;
        if(gameTable[x+ox][y+oy][0] == 1)
            return false;
    };
    return true;
}

function onTileClick(el, x, y){
    resetHints();
    var gameTile = gameTable[x][y];
    if(gameTile[0] == 0)
    {
        // Place a ship
        if(selectedShip == 0) return;
        var tiles = tryPlaceShip(x, y, selectedShip, selectedOrientation);
        if(tiles.length == 0) return;
        var ship = new Ship(selectedShip, tiles);
        tiles.forEach(tile => {
            tile[0] = 1;
            tile[1] = ship;
            tile[2].className = "ship";
        });
        availableShips[selectedShip-1]--;
        shipbutton = document.getElementById("shipx"+selectedShip);
        shipbutton.innerHTML = "X"+selectedShip+" Zostało: "+availableShips[selectedShip-1];
        if(availableShips[selectedShip-1] == 0)
            shipbutton.disabled = true;
        shipbutton.className = "";
        selectedShip = 0;
        return;
    }
    else if(gameTile[0] == 1)
    {
        // Remove ship
        var ship = gameTile[1];
        var tiles = ship.tiles;
        tiles.forEach(tile => {
            tile[0] = 0;
            tile[1] = null;
            tile[2].className = "water";
        });
        return;
    }
}

function onShipClick(el, shiplen){
    document.getElementById("shipx1").className = "";
    document.getElementById("shipx2").className = "";
    document.getElementById("shipx3").className = "";
    document.getElementById("shipx4").className = "";
    selectedShip = shiplen;
    el.className = "buttonselected";
}

function resetHints(){
    currentShipHint.forEach(element => {
        element.className = "water";
    });
    currentShipHint = [];
}

function tryPlaceShip(x, y, length, orientation){
    var tilesused = [];
    for(let i = 0; i < length; i++)
    {
        var cx = x;
        var cy = y;
        if(orientation == 1)
            cy += i;
        else
            cx += i;
        if(!canBeAShipTile(cx, cy)) return [];
        tilesused.push(gameTable[cx][cy]);
    }
    return tilesused;
}

function onTileMouseEnter(el, x, y){
    resetHints();
    if(selectedShip == 0) return;
    var gameTile = gameTable[x][y];
    if(gameTile[0] == 0)
    {
        var tiles = tryPlaceShip(x, y, selectedShip, selectedOrientation);
        tiles.forEach(tile => {
            currentShipHint.push(tile[2]);
            tile[2].className = "shiphint";
        });
    }
}

function onKeyPress(event){
    if(event.code == "KeyR")
    {
        selectedOrientation = Math.abs(selectedOrientation - 1);
        resetHints();
    }
}