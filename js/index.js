'use strict'

const MINE = '💣';
const EMPTY = '';
const FLAG = '🚩'

var lvl = 0;
var gMine = 0;
var gBoard;
var size;
var mineCount = 0;
var gtimerInterval;

var gGame = {
    isOn: false,
    shownCount: 0, markedCount: 0, secsPassed: 0
}

function onInit() {
    lvlBeg()
    runGeneration(gBoard)
    console.log('shown Count', gGame.shownCount)
    document.addEventListener('contextmenu', event => event.preventDefault());
    MineRemained(gMine)
}

function createBoard() {
    var board = [];
    var count = -1;



    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            // count++
            board[i][j] = {
                minesAroundCount: 4,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            gGame.shownCount++
        }
    }
    return board;

}


function renderBoard(board) {
    // console.table(board);
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            var title = '';
            var cellClass = getClassName({ i: i, j: j })
            // console.log('title', title)

            strHTML += `<td class="${cellClass}"
            onmousedown="onCellClicked(this,${i},${j},event)">
            ${''}</td>`


            // var gCellClass = getClassName(currCell)
            // var elCell = document.querySelector(gCellClass)
            // elCell.classList.add('occupied')
        }
        strHTML += `</tr>\n`
    }
    // console.log('strHTML', strHTML)
    var elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// location is an object like this - { i: 2, j: 7 }
function renderCell(location, value) {
    // console.log('location', location)
    // console.log('value', value)
    var cellSelector = '.' + getClassName(location)
    // console.log('cellSelector', cellSelector)
    var elCell = document.querySelector(cellSelector)

    // Select the elCell and set the value
    // const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}


function addMines() {
    var pos = getEmptyCell();
    // console.log('empty posistions', pos)

    for (var i = 0; i < gMine; i++) {
        var idx = getRandomIntInclusive(0, pos.length - 1);
        var emptyPos = pos[idx]
        // console.log('empty pos', emptyPos)

        gBoard[emptyPos.i][emptyPos.j].isMine = true;
        gBoard[emptyPos.i][emptyPos.j].minesAroundCount = MINE;

        pos.splice(idx, 1)


    }
    // console.log('empty posistions', pos)
}

function runGeneration(board) {
    var newBoard = copyMat(board);
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = { i: i, j: j };

            // console.log('new board i j', newBoard[i][j])
            var numOfNegs = setMinesNegsCount(i, j, board);
            if (newBoard[i][j].minesAroundCount !== MINE) {

                if (numOfNegs === 0) {
                    newBoard[i][j].minesAroundCount = ''
                    renderCell(currCell, newBoard[i][j].minesAroundCount)
                } else if (numOfNegs > 0) {
                    newBoard[i][j].minesAroundCount = numOfNegs;
                    // renderCell(currCell, numOfNegs)

                    // console.log('cell', newBoard[i][j].minesAroundCount)
                    // console.log('curr cell', currCell)

                }
            }
        }
    }
    return newBoard;
}

function setMinesNegsCount(cellI, cellJ, mat) {
    var negsCount = 0;

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j].minesAroundCount === MINE) {
                negsCount++;
                // console.log('negs Count', negsCount)
            }
        }
    }
    return negsCount;
}




// function setMinesBlow(elCell,cellI,cellJ) {

//     for (var i = cellI - 1; i <= cellI + 1; i++) {
//         if (i < 0 || i >= gBoard.length) continue
//         for (var j = cellJ - 1; j <= cellJ + 1; j++) {
//             if (j < 0 || j >= gBoard[0].length) continue
//             if (i === cellI && j === cellJ) continue
//             var currCell = gBoard[i][j];
//             if (!gBoard[i][j].isMine) {

//                 renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount)
//                 elCell.style.backgroundColor = 'rgb(186, 186, 178)';
//                 gBoard.isShown = true
//                 console.log('el Cell:', elCell)
//             }
//             if (!currCell.isMine &&
//                 gBoard[i][j].minesAroundCount === '' &&
//                 !gBoard[i][j].isShown){

//                     renderCell({ i: i, j: j }, '')
//                     elCell.style.backgroundColor = 'rgb(200, 200, 200)';
//                     gBoard.isShown = true
//                     console.log('el Cell:', elCell)
//                 }
//         }
//     }
// }

function onCellClicked(elCell, i, j, ev) {

    if (ev.button === 0) {
        gBoard[i][j].isShown = true
        if (gBoard[i][j].isShown &&
            gBoard[i][j].minesAroundCount > 0 &&
            !gBoard[i][j].isMine) {

            renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount)
            elCell.style.backgroundColor = 'rgb(186, 186, 178)';
            // console.log(elCell, gBoard[i][j])
        }

        if (gBoard[i][j].isShown &&
            gBoard[i][j].minesAroundCount === '' &&
            !gBoard[i][j].isMine) {
            renderCell({ i: i, j: j }, '')

            elCell.style.backgroundColor = 'rgb(200, 200, 200)';

        }

        if (gBoard[i][j].isShown && gBoard[i][j].isMine) {
            renderCell({ i: i, j: j }, MINE)

            console.log('cell Class', elCell)
            elCell.style.backgroundColor = 'tomato';
            gMine--
            MineRemained(gMine)
            
        }
    } else if (ev.button === 2 && !gBoard[i][j].isShown) {
        // console.log('ev', ev)
        if (gBoard[i][j].isMarked) {
            renderCell({ i: i, j: j }, '')
            gBoard[i][j].isMarked = false
            // console.log('is marked :', gBoard[i][j].isMarked)
            gGame.markedCount--
            // console.log(' gGame.markedCount', gGame.markedCount)
        } else {
            renderCell({ i: i, j: j }, FLAG)
            gBoard[i][j].isMarked = true
            // console.log('is marked :', gBoard[i][j].isMarked)
            gGame.markedCount++
            // console.log(' gGame.markedCount', gGame.markedCount)

        }
    } else return
}

function MineRemained(num){
    var count = document.querySelector('.nextNum span')
    count.innerText = num 
}

function showTimer() {
    var timer = document.querySelector('.time span')
    var start = Date.now()

    gtimerInterval = setInterval(function () {
        var currTs = Date.now()

        var secs = parseInt((currTs - start) / 1000)
        var ms = (currTs - start) - secs * 1000
        ms = '000' + ms
        // 00034 // 0001
        ms = ms.substring(ms.length - 3, ms.length)

        timer.innerText = `\n ${secs}:${ms}`
    }, 100)
}