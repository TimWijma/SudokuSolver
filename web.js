// Create sudoku grid as HTML table
let output = '<table>'

for(let y = 0;y < 9;y++) {
  output += '<tr>'
  for(let x = 0;x < 9;x++) {
    output += '<td><input class="sudoku-cell-input" type="number" id="' + y + x +  '"></td>'
  }
  output += '</tr>'
}
output += '</table>'

document.getElementById('table').innerHTML = output
document.getElementById('output').innerHTML = output


let cellX
let cellY
let cellCoords

function eventListeners() {
document.querySelectorAll('.sudoku-cell-input').forEach(function(elem) {
    // If you type a 2nd number in input, make the value that. If value = 0, empty field.
    elem.addEventListener("input", function() {
        activeCell = document.activeElement
        if((elem.value < 1 || elem.value > 9) && elem.value.charAt(1) != 0) {
            elem.value = elem.value.charAt(1)
        } else if (elem.value.includes('0')) {
            elem.value = ''
        }

        let sudokuString = ''
        // Create sudoku string from all cells in grid
        document.querySelectorAll('.sudoku-cell-input').forEach(function(cell) {
            if(cell.value == '') {
                sudokuString += '0'
            } else {
                sudokuString += cell.value
            }
        })
        sudoku = new Sudoku(sudokuString)

        sudoku.isValid()
        sudoku.showInvalid()
        elem.focus()
    })

    elem.addEventListener('focus', function() {
        cellX = parseInt(elem.id.charAt(1)) // Get X coord from cell id
        cellY = parseInt(elem.id.charAt(0)) // Get Y coord

        let allCells = document.querySelectorAll('#table .sudoku-cell-input')
        for(let i = 0;i < allCells.length;i++) {

            allCells[i].style.opacity = '1' // Reset all cells to default style
            thisX = parseInt(allCells[i].id.charAt(1))
            thisY = parseInt(allCells[i].id.charAt(0))

            if(cellX == thisX) {
                allCells[i].style.opacity = '0.9'
            }
            if(cellY == thisY) {
                allCells[i].style.opacity = '0.9' 
            }
        }

    })

    // Change coords based on keyinput
    elem.addEventListener('keydown', function(event) {
        switch (event.keyCode) {
            case 38: // Up
                event.preventDefault() // Removes default up/down number input behaviour
                moveGrid('y', -1)
                break;
            case 40: // Down
                event.preventDefault()
                moveGrid('y', 1)
                break;
            case 37: // Left
                moveGrid('x', -1)
                break;
            case 39: // Right
                moveGrid('x', 1)
                break;
            case 8: // Backspace empties field
                elem.value = 0
                break;
        }
    })
})
}

eventListeners()

function moveGrid(axis, direction) {
     
    if(axis === 'x') {
        cellX = cellX + direction;
        if(cellX < 0) { // Loop around grid when 'out of bounds'
            cellX = 8;
        } else if (cellX > 8) {
            cellX = 0;
        }
    } 
    else if (axis === 'y') {
        cellY = cellY + direction;
        if(cellY < 0) {
            cellY = 8
        } else if (cellY > 8) {
            cellY = 0
        }
    }
    cellCoords = cellY.toString() + cellX.toString() // Create string with both coords
    document.getElementById(cellCoords).focus() // Focus on cell with those coords
}

document.getElementById('show-string').addEventListener('click', function() { // Switch visibility of string container
    let stringContainer = document.getElementById('string')

    if(stringContainer.style.opacity == 0) {
        stringContainer.style.display = 'flex'
        stringContainer.style.opacity = 1
    } else {
        stringContainer.style.opacity = 0
        stringContainer.style.display = 'none'

    }
})

document.getElementById('cleargrids').addEventListener('click', function() {
    let allCells = document.querySelectorAll('#table .sudoku-cell-input')
    let allCells2 = document.querySelectorAll('#output td')

    for(let i = 0;i < allCells.length;i++) {
        allCells[i].value = null;
        allCells[i].style.backgroundColor = 'white'
    }

    for(let i = 0;i < allCells2.length;i++) {
        allCells2[i].innerHTML = ''
    }

    document.getElementById('speed').innerHTML = ''
})