'use strict'

const MINE = '<img class="mine"; style="height:100%"; src="img/bomb.svg">';
const EMPTY = '';
const FLAG = '<img class="mine"; style="height:100%"; src="img/warning.gif">';
const SHOWN_GREY = 'rgb(186, 186, 178)';
const LIGHT_GREY = 'rgb(200, 200, 200)';


var gBoard;
var mouseIsDown = false;
var gtimerInterval;
var firstClick = 1;
var life;
var count = 0;
var steps = 0;

var gGame = {
    isOn: false,
    shownCount: 0, markedCount: 0, secsPassed: 0
}

var gLevel = {
    SIZE: 4,
    MINES: 2
};

function onInit(size, mines) {
    endGame()
    reset(size, mines)
    gBoard = createBoard();
    renderBoard(gBoard, '.board')
    addMines()
    runGeneration(gBoard)
    document.addEventListener('contextmenu', event => event.preventDefault());

}

function reset(size, mines) {
    life = 3
    firstClick = 1;
    gLevel.SIZE = size
    gLevel.MINES = mines
    gGame.shownCount = 0
    steps = 0

    var elLife = '.' + 'life' + life
    document.querySelector('.life1').style.display = 'inline'
    document.querySelector('.life2').style.display = 'inline'
    document.querySelector('.life3').style.display = 'inline'

    document.querySelector('.nEmoji').style.display = 'inLine'
    document.querySelector('.winEmoji').style.display = 'none'
    document.querySelector('.loseEmoji').style.display = 'none'
}

function createBoard() {
    var board = [];

    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
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

    for (var i = 0; i < gLevel.MINES; i++) {
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



function expandShown(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            console.log('mat[i][j] = ' + mat[i][j]);
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (!mat[i][j].isMine) {
                mat[i][j].isShown = true

                var cellClass = '.' + getClassName({ i: i, j: j })
                document.querySelector(cellClass).style.backgroundColor = SHOWN_GREY;
                if (gBoard[i][j].minesAroundCount === '') {
                    document.querySelector(cellClass).style.backgroundColor = LIGHT_GREY;
                    gBoard[i][j].isShown = true
                    expandShown2(i, j, mat)
                    // if (!gBoard[i][j].minesAroundCount) {
                    //     expandShown(i, j, mat);
                    // }
                }
                renderCell({ i: i, j: j }, mat[i][j].minesAroundCount)
            }
        }
    }
}

function expandShown2(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            console.log('mat[i][j] = ' + mat[i][j]);
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (!mat[i][j].isMine) {
                mat[i][j].isShown = true

                var cellClass = '.' + getClassName({ i: i, j: j })
                document.querySelector(cellClass).style.backgroundColor = SHOWN_GREY;
                if (gBoard[i][j].minesAroundCount === '') {
                    document.querySelector(cellClass).style.backgroundColor = LIGHT_GREY;
                    gBoard[i][j].isShown = true

                    // if (!gBoard[i][j].minesAroundCount) {
                    //     expandShown(i, j, mat);
                    // }
                }
                renderCell({ i: i, j: j }, mat[i][j].minesAroundCount)
            }
        }
    }
}


function onCellClicked(elCell, i, j, ev) {


    if (ev.button === 0) {
        if (firstClick === 1 && !gBoard[i][j].isMine) activeTimer();
        if (!gGame.isOn || gBoard[i][j].isShown) return

        gBoard[i][j].isShown = true
        if (gBoard[i][j].minesAroundCount > 0 &&
            !gBoard[i][j].isMine) {

            renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount)
            elCell.style.backgroundColor = SHOWN_GREY;
            // console.log(elCell, gBoard[i][j])
            steps++
            console.log('steps', steps)
        }

        else if (gBoard[i][j].minesAroundCount === '' &&
            !gBoard[i][j].isMine) {
            renderCell({ i: i, j: j }, '')
            elCell.style.backgroundColor = LIGHT_GREY;
            expandShown(i, j, gBoard)
            steps++
        }

        else if (gBoard[i][j].isMine && firstClick === 0) {
            renderCell({ i: i, j: j }, MINE)
            if (life === 1) {
                endGame()
                console.log('life : ', life)
            } else life--
            var elLife = '.' + 'life' + life
            document.querySelector(elLife).style.display = 'none'
            console.log('life : ', life)
            console.log('cell Class', elCell)
            elCell.style.backgroundColor = 'tomato';
            steps++
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
    stepsCounter(steps)
    victoryCheck(gBoard)
}


function stepsCounter(num) {
    var count = document.querySelector('.nextNum span')
    count.innerText = num
}


function activeTimer() {
    if (firstClick === 1) {
        showTimer()
        firstClick--
        gGame.isOn = true
    }
}


window.addEventListener('mousedown', function () {
    mouseIsDown = true;
    if (gGame.isOn) {
        setTimeout(function () {
            if (mouseIsDown) {
                // mouse was held down for > 2 seconds
                document.querySelector(".onEmoji").style.display = 'inLine';
                document.querySelector('.nEmoji').style.display = 'none'
            }
        }, 1);
    }
});

window.addEventListener('mouseup', function () {
    mouseIsDown = false;
    if (gGame.isOn) {
        document.querySelector('.nEmoji').style.display = 'inLine'
        document.querySelector(".onEmoji").style.display = 'none';
    }
});

function victoryCheck(board) {
    count = 0;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isShown && !board[i][j].isMine) {
                count++
                console.log('victory check', count)
                console.log('victory check', gGame.shownCount - gLevel.MINES)
            }
        }
    }
    if (count === gGame.shownCount - gLevel.MINES) {
        endGame()
        console.log(' Victory !')
    }
}

function endGame() {
    clearInterval(gtimerInterval);
    gGame.isOn = false

    document.querySelector('.nEmoji').style.display = 'none'
    if (count === gGame.shownCount - gLevel.MINES) {
        document.querySelector('.winEmoji').style.display = 'inLine'
        document.querySelector('.nEmoji').style.display = 'none'
    } else
        document.querySelector('.loseEmoji').style.display = 'inLine'
    document.querySelector('.nEmoji').style.display = 'none'
}


function hintClick(num) {

}



