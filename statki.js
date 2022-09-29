const playerTable = [[], [], [], [], [], [], [], []];
const enemyTable = [[],[],[],[],[],[],[],[]];
gameStage = 0;
selectedShip = 0;
selectedOrientation = 0;
availableShips = [2,2,2,2];
currentShipHint = [];

playerWinCounter = 8;
enemyWinCounter = 8;

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

function getEnemyTileHTMLElement(x,y){
    return document.getElementById("enemytilex" + x + "y" + y);
}


function newGame(){
    gamehtml = document.getElementById("game");
    enemyGameHTML = document.getElementById("gameenemy");
    var html = "<table>";
    var htmlenemy = "<table>";
    for (let y = 0; y < 8; y++) {
        html += "<tr>";
        htmlenemy += "<tr>";
        for (let x = 0; x < 8; x++) {
            html += "<td id='tilex"+x+"y"+y+"' class='water' onclick='onTileClick(this, "+x+", "+y+");' onmouseenter='onTileMouseEnter(this, "+x+", "+y+")'> </td>";
            htmlenemy += "<td id='enemytilex"+x+"y"+y+"' class='water' onclick='onEnemyTileClick(this, "+x+", "+y+");'> </td>";
        }
        html += "</tr>";
        htmlenemy += "</tr>";
    }
    html += "</table>";
    htmlenemy += "</table>";
    gamehtml.innerHTML = html;
    enemyGameHTML.innerHTML = htmlenemy;

    enemyTableAvailable = [];
    for (let x = 0; x < 8; x++)
        for (let y = 0; y < 8; y++){
            playerTable[x][y] = [0, null, getTileHTMLElement(x, y)];
            enemyTable[x][y] = [0, null, getEnemyTileHTMLElement(x, y)];
            enemyTableAvailable[y + (x * 8)] = [x, y, playerTable[x][y]];
        }
    var shipsToGenerate = [];
    var total = 0;
    for (let i = 0; i < availableShips.length; i++)
    {
        shipsToGenerate.push([i+1, availableShips[i]]);
        total += availableShips[i];
    }
    for (let i = 0; i < total; i++)
    {
        var iToPlace = Math.floor(Math.random()*shipsToGenerate.length);
        var shipToPlace = shipsToGenerate[iToPlace];
        var length = shipToPlace[0];
        shipToPlace[1]--;
        if(shipToPlace[1] == 0)
            shipsToGenerate.splice(iToPlace, 1);
        var tiles;
        var tries = 0;
        do{
            var randomTile = enemyTableAvailable[Math.floor(Math.random()*enemyTableAvailable.length)];
            tiles = tryPlaceShip(randomTile[0], randomTile[1], length, Math.floor(Math.random()*2), enemyTable);
            if(tiles.length == 0) continue;
            tries = 0;
            break;
        } while(++tries < 10000);
        if(tries >= 10000)
        {
            document.body.innerHTML = "<h1>Error</h1>";
            return;
        }
        var ship = new Ship(length, tiles);
        tiles.forEach(tile => {
            tile[0] = 1;
            tile[1] = ship;
            //tile[2].className = "ship";
        });
    }
}

function isValidTile(x,y){
    return !(x < 0 || x > 7 || y < 0 || y > 7);
}

function canBeAShipTile(x,y, gameTable = playerTable){
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
    if(gameStage != 0) return;
    var gameTile = playerTable[x][y];
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
        if(availableShips[selectedShip-1] == 0){
            shipbutton.disabled = true;
            if(availableShips[0] == 0 && availableShips[1] == 0 && availableShips[2] == 0 && availableShips[3] == 0)
                document.getElementById("startbutton").disabled = false;
        }
        shipbutton.className = "";
        selectedShip = 0;
        return;
    }
    else if(gameTile[0] == 1)
    {
        // Remove ship
        var ship = gameTile[1];
        var tiles = ship.tiles;
        var length = ship.length;
        tiles.forEach(tile => {
            tile[0] = 0;
            tile[1] = null;
            tile[2].className = "water";
        });
        shipbutton = document.getElementById("shipx"+length);
        availableShips[length-1]++;
        shipbutton.innerHTML = "X"+length+" Zostało: "+availableShips[length-1];
        shipbutton.disabled = false;
        document.getElementById("startbutton").disabled = true;
        return;
    }
}

function randomEnemyMove(){
    setTimeout(() => {
        var i = Math.floor(Math.random()*enemyTableAvailable.length);
        var gameTile = enemyTableAvailable[i][2];
        enemyTableAvailable.splice(i, 1);
        if(gameTile[0] == 0)
        {
            gameTile[2].className = "miss";
            gameStage = 1;
            setStatus("Twój ruch", "green");
            return;
        }
        else if(gameTile[0] == 1)
        {
            gameTile[2].className = "hit";
            var ship = gameTile[1];
            ship.doDamage();
            if(ship.isDead())
            {
                ship.tiles.forEach(tile => {
                    tile[2].className = "broken";
                });
                enemyWinCounter--;
                if(enemyWinCounter == 0)
                {
                    setStatus("Przegrałeś !!", "red");
                    gameStage = 4;
                }
            }
            randomEnemyMove();
        }
    }, 1000+Math.floor(Math.random()*2000));
}

function onEnemyTileClick(el, x, y){
    if(gameStage != 1) return;
    var gameTile = enemyTable[x][y];
    if(gameTile[2].className != "water") return;
    if(gameTile[0] == 0)
    {
        gameTile[2].className = "miss";
        gameStage = 2;
        setStatus("Ruch przeciwnika", "red");
        randomEnemyMove();
        return;
    }
    else if(gameTile[0] == 1)
    {
        gameTile[2].className = "hit";
        var ship = gameTile[1];
        ship.doDamage();
        if(ship.isDead())
        {
            ship.tiles.forEach(tile => {
                tile[2].className = "broken";
            });
            playerWinCounter--;
            if(playerWinCounter == 0)
            {
                setStatus("Wygrałeś !!", "green");
                gameStage = 3;
            }
        }
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

function tryPlaceShip(x, y, length, orientation, gameTable = playerTable){
    var tilesused = [];
    for(let i = 0; i < length; i++)
    {
        var cx = x;
        var cy = y;
        if(orientation == 1)
            cy += i;
        else
            cx += i;
        if(!canBeAShipTile(cx, cy, gameTable)) return [];
        tilesused.push(gameTable[cx][cy]);
    }
    return tilesused;
}

function onTileMouseEnter(el, x, y){
    resetHints();
    if(selectedShip == 0) return;
    var gameTile = playerTable[x][y];
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

function onStartClick(el){
    gameStage = 1;
    enemyGameHTML.style.visibility = "visible";
    document.getElementById("ships").style.visibility = "hidden";
    setStatus("Twój ruch", "green");
}

function setStatus(status, color = "black"){
    document.getElementById("status").innerHTML = "<span style='color: "+color+";'>"+status+"</span>";
}