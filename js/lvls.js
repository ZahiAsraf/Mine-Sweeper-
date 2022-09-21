'use strict'

function lvlBeg(){
    lvl = 1;
    size = 4;
    gMine = 2;
    // gNums(1, 16)
    gBoard = createBoard();
    renderBoard(gBoard,'.board')
    addMines()
    runGeneration(gBoard)

}



function lvlMed(){
    lvl = 2;
    size = 8;
    gMine = 14;
    gBoard = createBoard();
    renderBoard(gBoard,'.board')
    addMines()
    runGeneration(gBoard)

}

function lvlEx(){
    lvl = 3;
    size = 12;
    gMine = 32;
    gBoard = createBoard();
    renderBoard(gBoard,'.board')
    addMines()
    runGeneration(gBoard)

}