'use strict'

const MINE = '<img class="mine"; style="height:65%"; src="img/bomb.svg">';
const EMPTY = '';
const FLAG = '<img class="mine"; style="height:100%"; src="img/warning.gif">';
const SHOWN_GREY = 'rgb(186, 186, 178)';
const LIGHT_GREY = 'rgb(200, 200, 200)';
const COVER_GREY = 'rgb(143, 143, 142)';


var gBoard;

var mouseIsDown = false;

var hintMode = false;
var hints = 3;
var megaHintMode = false;
var megaHintCount = 1;
var megaHintParts = 2;
var megaCell;


var gtimerInterval;

var firstClick = 1;

var life;
var count = 0;
var steps = 0;

var gGame = {
    isOn: false,
    shownCount: 0, markedCount: 0, secsPassed: 0, gameLvl: 0
}

var gLevel = {
    SIZE: 4,
    MINES: 2
};

function onInit(size, mines, lvl) {
    endGame()
    reset(size, mines, lvl)
    gBoard = createBoard();
    renderBoard(gBoard, '.board')
    addMines()
    runGeneration(gBoard)
    document.addEventListener('contextmenu', event => event.preventDefault());

}

function reset(size, mines, lvl) {
    life = 3
    firstClick = 1;
    gLevel.SIZE = size
    gLevel.MINES = mines
    gGame.shownCount = 0
    gGame.gameLvl = lvl
    steps = 0

    hintMode = false;
    hints = 3;
    megaHintMode = false;
    megaHintCount = 1;
    megaHintParts = 2;
    megaCell;


    document.querySelector('.hint1').style.display = 'inline'
    document.querySelector('.hint2').style.display = 'inline'
    document.querySelector('.hint3').style.display = 'inline'

    document.querySelector('.life1').style.display = 'inline'
    document.querySelector('.life2').style.display = 'inline'
    document.querySelector('.life3').style.display = 'inline'

    if (gGame.gameLvl === 1) {
        life = 1
        document.querySelector('.life2').style.display = 'none'
        document.querySelector('.life3').style.display = 'none'
    }


    document.querySelector('.nEmoji').style.display = 'inline'
    document.querySelector('.winEmoji').style.display = 'none'
    document.querySelector('.loseEmoji').style.display = 'none'

    document.querySelector('.mine-ex').style.display = 'inline'

    if (gGame.gameLvl === 1) document.querySelector('.mine-ex').style.display = 'none'
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
            // console.log('mat[i][j] = ' + mat[i][j]);
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (!mat[i][j].isMine && !mat[i][j].isShown) {

                var cellClass = '.' + getClassName({ i: i, j: j })
                document.querySelector(cellClass).style.backgroundColor = SHOWN_GREY;
                if (gBoard[i][j].minesAroundCount === '' && !gBoard[i][j].isShown) {
                    document.querySelector(cellClass).style.backgroundColor = LIGHT_GREY;
                    expandShown2(i, j, mat)
                }
                gBoard[i][j].isShown = true
                renderCell({ i: i, j: j }, mat[i][j].minesAroundCount)
            }
        }
    }
}

function expandShown2(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            // console.log('mat[i][j] = ' + mat[i][j]);
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (!mat[i][j].isMine && !mat[i][j].isShown) {

                var cellClass = '.' + getClassName({ i: i, j: j })
                document.querySelector(cellClass).style.backgroundColor = SHOWN_GREY;
                if (gBoard[i][j].minesAroundCount === '' && !gBoard[i][j].isShown) {
                    document.querySelector(cellClass).style.backgroundColor = LIGHT_GREY;
                }
                gBoard[i][j].isShown = true
                renderCell({ i: i, j: j }, mat[i][j].minesAroundCount)
            }
        }
    }
}


function onCellClicked(elCell, i, j, ev) {

    if (hintMode && !megaHintMode) {
        hintModeOn(i, j, gBoard)
        return
    }

    if (megaHintMode && !hintMode) {
        if (megaHintParts === 2) {
            megaCell = { i: i, j: j }
            megaHintParts--
            return
        }
        if (megaHintParts === 1) {
            megaHintModeOn(i, j, gBoard)
            return
        }

    }
    if (ev.button === 0) {
        if (firstClick === 1 && !gBoard[i][j].isMine) activeTimer();
        if (!gGame.isOn || gBoard[i][j].isShown) return


        if (gBoard[i][j].minesAroundCount > 0 &&
            !gBoard[i][j].isMine) {

            renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount)
            elCell.style.backgroundColor = SHOWN_GREY;
            // console.log(elCell, gBoard[i][j])
            steps++
            gBoard[i][j].isShown = true
            // console.log('steps', steps)
        }

        else if (gBoard[i][j].minesAroundCount === '' &&
            !gBoard[i][j].isMine) {
            renderCell({ i: i, j: j }, '')
            elCell.style.backgroundColor = LIGHT_GREY;
            gBoard[i][j].isShown = true
            expandShown(i, j, gBoard)
            steps++
        }

        else if (gBoard[i][j].isMine && firstClick === 0) {
            renderCell({ i: i, j: j }, MINE)
            if (life !== 0) {
                var elLife = '.' + 'life' + life
                document.querySelector(elLife).style.display = 'none'
                life--
                // console.log('life : ', life)
                // console.log('cell Class', elCell)
                elCell.style.backgroundColor = 'tomato';
                steps++
                gBoard[i][j].isShown = true
            }
            if (life === 0) {
                elCell.style.backgroundColor = 'tomato';
                gBoard[i][j].isShown = true
                endGame()
                console.log('life : ', life)
            }

        }
        gBoard[i][j].isShown = true

        stepsCounter(steps)
        victoryCheck(gBoard)

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
                // console.log('victory check', count)
                // console.log('victory check', gGame.shownCount - gLevel.MINES)
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


function hintClick() {
    if (!gGame.isOn) return
    hintMode = true
    var hintNum = '.hint' + hints
    // console.log('hint num :', hintNum)
    document.querySelector(hintNum).style.display = 'none'
    hints--
}


function hintModeOn(cellI, cellJ, mat) {

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            // console.log('mat[i][j] = ' + mat[i][j]);
            if (j < 0 || j >= mat[i].length) continue;
            console.log('is shown :', mat[i][j].isShown)
            var cellClass = '.' + getClassName({ i: i, j: j })
            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine) {
                document.querySelector(cellClass).style.backgroundColor = SHOWN_GREY;
            }
            if (gBoard[i][j].minesAroundCount === '' && !gBoard[i][j].isShown && !gBoard[i][j].isMine) {
                document.querySelector(cellClass).style.backgroundColor = LIGHT_GREY;
            }
            if (gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                document.querySelector(cellClass).style.backgroundColor = 'tomato';
            }
            renderCell({ i: i, j: j }, mat[i][j].minesAroundCount)
        }
    }
    setTimeout(hintModeOff, 500, cellI, cellJ, mat)
}


function hintModeOff(cellI, cellJ, mat) {

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            // console.log('mat[i][j] = ' + mat[i][j]);
            if (j < 0 || j >= mat[i].length) continue;
            if (!gBoard[i][j].isShown) {
                var cellClass = '.' + getClassName({ i: i, j: j })
                document.querySelector(cellClass).style.backgroundColor = COVER_GREY;
                renderCell({ i: i, j: j }, '')
                if (gBoard[i][j].isMarked) renderCell({ i: i, j: j }, FLAG)
            }
        }
    }
    hintMode = false
}



function megaHintClick() {
    if (megaHintCount !== 0 && gGame.isOn) {
        megaHintMode = true;
        megaHintCount--
    }
}

function megaHintModeOn(cellI, cellJ, mat) {

    console.log('mega Cell.i :', megaCell.i)
    console.log('CellI :', cellI)

    var length = { i: 0, j: 0 }
    var lowI;
    var lowJ;
    if (megaCell.i > cellI) {
        length.i = megaCell.i
        lowI = cellI
    } else {
        length.i = cellI
        lowI = megaCell.i
    }
    if (megaCell.j > cellJ) {
        length.j = megaCell.j
        lowJ = cellJ
    } else {
        length.j = cellJ
        lowJ = megaCell.j
    }

    for (var i = lowI; i <= length.i; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = lowJ; j <= length.j; j++) {
            console.log('mat[i][j] = ' + mat[i][j]);
            if (j < 0 || j >= mat[i].length) continue;
            var cellClass = '.' + getClassName({ i: i, j: j })

            if (!gBoard[i][j].isShown && !gBoard[i][j].isMine) {
                document.querySelector(cellClass).style.backgroundColor = SHOWN_GREY;
            }
            if (gBoard[i][j].minesAroundCount === '') {
                document.querySelector(cellClass).style.backgroundColor = LIGHT_GREY;
            }
            if (gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                document.querySelector(cellClass).style.backgroundColor = 'tomato';
            }
            renderCell({ i: i, j: j }, mat[i][j].minesAroundCount)
        }
    }
    setTimeout(megaHintModeOff, 2000, cellI, cellJ, mat)
}

function megaHintModeOff(cellI, cellJ, mat) {
    // console.log('mega Cell.i :', megaCell.i)
    // console.log('CellI :', cellI)

    var length = { i: 0, j: 0 }
    var lowI;
    var lowJ;
    if (megaCell.i > cellI) {
        length.i = megaCell.i
        lowI = cellI
    } else {
        length.i = cellI
        lowI = megaCell.i
    }
    if (megaCell.j > cellJ) {
        length.j = megaCell.j
        lowJ = cellJ
    } else {
        length.j = cellJ
        lowJ = megaCell.j
    }

    for (var i = lowI; i <= length.i; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = lowJ; j <= length.j; j++) {
            console.log('mat[i][j] = ' + mat[i][j]);
            if (j < 0 || j >= mat[i].length) continue;
            if (!gBoard[i][j].isShown) {
                var cellClass = '.' + getClassName({ i: i, j: j })
                document.querySelector(cellClass).style.backgroundColor = COVER_GREY;
                renderCell({ i: i, j: j }, '')
            }
        }
    }
    megaHintMode = false
    megaHintParts--
    megaCell = null
}


function mineExClick(board) {
    if (gGame.gameLvl === 1) return
    if (!gGame.isOn) return

    var gMines = getMineCell()

    for (var i = 0; i < 3; i++) {
        var idx = getRandomIntInclusive(0, gMines.length - 1);
        var pos = gMines[idx]
        var numOfNegs = setMinesNegsCount(pos.i, pos.j, board)
        // console.log('negs : ', numOfNegs)
        gBoard[pos.i][pos.j].isMine = false
        gBoard[pos.i][pos.j].minesAroundCount = numOfNegs

        // console.log('get Mines :', gMines)
        // console.log('cell :', gBoard[pos.i][pos.j])
        // console.log('cell i :', pos.i)
        // console.log('cell j :', pos.j)

    }
    alert('You got -3 Mines on the board now')
}