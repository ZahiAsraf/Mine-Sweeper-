'use strict'



function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j
	return cellClass
}

function getEmptyCell() {
	const emptyPositions = []

	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var currCell = gBoard[i][j] 
                // console.log(currCell)
			if (currCell.minesAroundCount !== MINE) {
				var pos = { i: i, j: j }
				emptyPositions.push(pos)
			}
		}
	}
    // console.log('empty pos', emptyPositions)
	return emptyPositions
}

function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}