/*
    Statki
    Copyright (C) 2022  kuba6000

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


const playerTable = [[], [], [], [], [], [], [], []];
const enemyTable  = [[], [], [], [], [], [], [], []];
let gameStage = 0;
let selectedShip = 0;
let selectedOrientation = 0;
let availableShips = [2, 2, 2, 2];
let currentShipHint = [];

let playerWinCounter = 8;
let enemyWinCounter = 8;

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


let enemyTableAvailable = [];

function getEnemyTableIndex(x, y){
    for(let i = 0; i < enemyTableAvailable.length; i++)
    {
        if(enemyTableAvailable[i][0] == x && enemyTableAvailable[i][1] == y)
        {
            return i;
        }
    }
    return -1;
}

function newGame(){
    gamehtml = document.getElementById("game");
    enemyGameHTML = document.getElementById("gameenemy");
    let html = "<table>";
    let htmlenemy = "<table>";
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
    let shipsToGenerate = [];
    let total = 0;
    for (let i = 0; i < availableShips.length; i++)
    {
        shipsToGenerate.push([i+1, availableShips[i]]);
        total += availableShips[i];
    }
    for (let i = 0; i < total; i++)
    {
        let iToPlace = Math.floor(Math.random()*shipsToGenerate.length);
        let shipToPlace = shipsToGenerate[iToPlace];
        let length = shipToPlace[0];
        shipToPlace[1]--;
        if(shipToPlace[1] == 0)
            shipsToGenerate.splice(iToPlace, 1);
        let tiles;
        let tries = 0;
        do{
            let randomTile = enemyTableAvailable[Math.floor(Math.random()*enemyTableAvailable.length)];
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
        let ship = new Ship(length, tiles);
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

const allPossibleDirections = [[-1,0],[1,0],[0,-1],[0,1]];

function canBeAShipTile(x,y, gameTable = playerTable){
    if(!isValidTile(x, y))
        return false;
    
    for(let i = 0; i < allPossibleDirections.length; i++){
        let ox = allPossibleDirections[i][0];
        let oy = allPossibleDirections[i][1];
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
    let gameTile = playerTable[x][y];
    if(gameTile[0] == 0)
    {
        // Place a ship
        if(selectedShip == 0) return;
        let tiles = tryPlaceShip(x, y, selectedShip, selectedOrientation);
        if(tiles.length == 0) return;
        let ship = new Ship(selectedShip, tiles);
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
        let ship = gameTile[1];
        let tiles = ship.tiles;
        let length = ship.length;
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

let AIShipSuggestion = [];

function randomEnemyMove(){
    setTimeout(() => {
        let i = 0;
        if(AIShipSuggestion.length == 0)
            i = Math.floor(Math.random()*enemyTableAvailable.length);
        else{
            i = Math.floor(Math.random()*AIShipSuggestion.length);
            let suggested = getEnemyTableIndex(AIShipSuggestion[i][0], AIShipSuggestion[i][1]);
            AIShipSuggestion.splice(i, 1);
            i = suggested;
        }
        let gameTile = enemyTableAvailable[i][2];
        let x = enemyTableAvailable[i][0];
        let y = enemyTableAvailable[i][1];
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
            let ship = gameTile[1];
            ship.doDamage();
            AIShipSuggestion = [];
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
                    return;
                }
            }
            else{
                let possibleAISuggestions = [];
                for(let j = 0; j < allPossibleDirections.length; j++)
                {
                    let ox = allPossibleDirections[j][0];
                    let oy = allPossibleDirections[j][1];
                    if (!isValidTile(x + ox, y + oy)) continue;
                    if (playerTable[x + ox][y + oy][2].className == "hit") {
                        possibleAISuggestions = [];
                        for(let off = 1; ; off++)
                        {
                            if (!isValidTile(x + (ox*off), y + (oy*off))) break;
                            if (playerTable[x + (ox*off)][y + (oy*off)][2].className == "miss") break;
                            if (playerTable[x + (ox*off)][y + (oy*off)][2].className == "hit") continue;
                            possibleAISuggestions.push([x + (ox*off), y + (oy*off)]);
                            break;
                        }
                        for(let off = -1; ; off--)
                        {
                            if (!isValidTile(x + (ox*off), y + (oy*off))) break;
                            if (playerTable[x + (ox*off)][y + (oy*off)][2].className == "miss") break;
                            if (playerTable[x + (ox*off)][y + (oy*off)][2].className == "hit") continue;
                            possibleAISuggestions.push([x + (ox*off), y + (oy*off)]);
                            break;
                        }
                        break;
                    }
                    else if(playerTable[x + ox][y + oy][2].className != "miss")
                        possibleAISuggestions.push([x + ox, y + oy]);
                }
                AIShipSuggestion = possibleAISuggestions;
            }
            randomEnemyMove();
        }
    }, 1000+Math.floor(Math.random()*2000));
}

function onEnemyTileClick(el, x, y){
    if(gameStage != 1) return;
    let gameTile = enemyTable[x][y];
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
        let ship = gameTile[1];
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
    let tilesused = [];
    for(let i = 0; i < length; i++)
    {
        let cx = x;
        let cy = y;
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
    let gameTile = playerTable[x][y];
    if(gameTile[0] == 0)
    {
        let tiles = tryPlaceShip(x, y, selectedShip, selectedOrientation);
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