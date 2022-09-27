gameTable = [[],[],[],[],[],[],[],[]];

function newGame(){
    gamehtml = document.getElementById("game");
    var html = "<table>";
    for (let y = 0; y < 8; y++) {
        html += "<tr>";
        // Just to construct a multi table
        for (let x = 0; x < 8; x++) {
            //html += "<td>" + x + " " + y + "</td>";
            html += "<td id='tilex"+x+"y"+y+"' class='water' onclick='onTileClick(this, "+x+", "+y+");'> </td>";
            gameTable[x][y] = [0,0];
        }
        html += "</tr>";
    }
    html += "</table>";
    gamehtml.innerHTML = html;
}

function getHTMLElement(x,y){
    return document.getElementById("tilex" + x + "y" + y);
}

function findShip(x,y){
    var i = 0;
    var sx, sy;
    [-1,0,1].forEach(ox => {
        (ox == 0 ? [-1,1] : [0]).forEach(oy => {
            if(x+ox < 0 || x+ox > 7 || y+oy < 0 || y+oy > 7)
                return;
            if(gameTable[x+ox][y+oy][0] == 1)
            {
                sx = x+ox;
                sy = y+oy;
                i++;
            }
        });
    });
    return i <= 1;
}

function onTileClick(el, x, y){
    var gameTile = gameTable[x][y];
    if(!findShip(x, y))
        return;
    gameTile[0]++;
    if(gameTile[0] == 2) gameTile[0] = 0;
    if(gameTile[0] == 0)
        el.className = "water";
    else if(gameTile[0] == 1)
        el.className = "ship";
}