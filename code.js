class Cell {
    constructor(x, y, value, candidates, parent, boxIndex) {
        this.x = x
        this.y = y
        this.value = value
        this.candidates = candidates
        this.parent = parent
        this.boxIndex = boxIndex
    }

    getBox() {
        return this.parent.getBox(this.x, this.y)
    }

    isPossible(val) {
        if(sudoku.rowArray[this.y].find(cell => cell.value === val)){
            return false
        } else if(sudoku.columnArray[this.x].find(cell => cell.value === val)) {
            return false    
        } else if (sudoku.boxArray[this.boxIndex].find(cell => cell.value === val)) {
            return false
        } else {
            return true
        }
        // Check if value is possible by looping trough the cell's containers
    }    
    
    getCandidate() {
        if(this.value == 0) {
            for(let n = 1;n < 10;n++) {
                if(this.isPossible(n)) {
                    this.candidates.push(n)
                }
            }
        }
    }

    removeCandidate(n) {
        if(this.candidates.length > 0) {
            const index = this.candidates.indexOf(n)
            if(index !== -1) { // If index exists, remove it
                this.candidates.splice(index, 1)
            }
        }
    }

    removeCandidateContainer(n) {
        sudoku.rowArray[this.y].forEach(function (cell) {
            if(cell.candidates.length > 0) {
                const index = cell.candidates.indexOf(n)
                if(index !== -1) {
                    cell.candidates.splice(index, 1)
                }
            }
        })

        sudoku.columnArray[this.x].forEach(function (cell) {
            if(cell.candidates.length > 0) {
                const index = cell.candidates.indexOf(n)
                if(index !== -1) {
                    cell.candidates.splice(index, 1)
                }
            }
        })

        sudoku.boxArray[this.boxIndex].forEach(function (cell) {
            if(cell.candidates.length > 0) {
                const index = cell.candidates.indexOf(n)
                if(index !== -1) {
                    cell.candidates.splice(index, 1)
                }
            }
        }) 
        this.candidates = [] // Set its own candidates to 0, since the cell is solved
    }
}

class Sudoku {
    constructor(sudokuString) {
        const sudokuArray = sudokuString.split('')
        this.rowArray = []
        this.columnArray = []
        this.boxArray = []
        this.donePairs = false
        this.invalids = []

        for (let y = 0; y < 9; y++) {
            const row = []
            
            for (let x = 0; x < 9; x++) {
                
                let value = sudokuArray[y * 9 + x] // Get value from the current cell in the array
                let boxIndex = (Math.floor(y / 3) * 3 + Math.floor(x / 3)) // Create the index of the box the cell is in (0 to 9, top left to bottom right)

                const cell = new Cell(x, y, parseInt(value), [], this, boxIndex)
                row.push(cell)
            }
            this.rowArray.push(row)
        }

        for(let i = 0;i < 9;i++) {
            const column = []
            for(let j = 0;j < 9;j++) {
                column.push(this.rowArray[j][i])
            }
            this.columnArray.push(column)
        }  

        for(var y = 0;y < 3;y++) {
            for(var x = 0;x < 3;x++) {
                this.boxArray.push(this.rowArray[y * 3][x * 3].getBox())
            }
        }
    }

    getBox(x, y) {
        let box = []
        var xBox= Math.floor(x / 3) * 3
        var yBox = Math.floor(y / 3) * 3
        for(var i = 0;i < 3;i++) {
            for(var j = 0;j < 3;j++) {
                box.push(this.rowArray[yBox+i][xBox+j])
            }
        }
        return box
    }

    getAllCandidates() {
        for(const row of this.rowArray) {
            for(const cell of row) {
                if(cell.value === 0) {
                    cell.getCandidate()
                }
            }
        }
    }

    isValid() {
        let isValid = true
        const getContainerInvalid = function(container) {
            for(const row of container) {
                for(var n = 1;n < 10;n++) {
                    if(row.filter(cell => cell.value === n).length > 1) {
                        for(const cell of row) {
                            if(cell.value === n) {
                                sudoku.invalids.push(cell)
                                isValid = false
                            }
                        }
                    }
                }
            }
        }

        getContainerInvalid(this.rowArray) 
        getContainerInvalid(this.columnArray)
        getContainerInvalid(this.boxArray)
        // Checks validity for all 27 containers (9 rows, 9 columns, 9 boxes)


        if(isValid) {
            return true
        } else {
            return false
        }
    }

    showInvalid() {
        let allCells = document.querySelectorAll('.sudoku-cell-input')
        for(let i = 0;i < allCells.length;i++) {
            allCells[i].style.backgroundColor = 'white' // Resets background color of all cells
        }
        for(const cell of this.invalids) {
            document.getElementById(cell.y + '' + cell.x).style.backgroundColor = '#ff2f2c'
        }
    }

    nextEmpty() {
        for(const row of this.rowArray) {
            for(const cell of row) {
                if(cell.value == 0) {
                    return cell
                }
            }
        }
        return false
        // Get next empty cell for backtracking
    }

    backtracking() {
        let currentCell = this.nextEmpty()

        if(currentCell === false) { // If no cells are empty, backtracking is done
            console.log('used backtracking')
            return this
        } else {
            var candidates = currentCell.candidates
            for(var n = 0;n < candidates.length;n++) {
                if(currentCell.isPossible(candidates[n])) {
                    currentCell.value = candidates[n]
                    this.backtracking()
                }
            } 

            if(this.nextEmpty()) {
                currentCell.value = 0 // If all candidates have been tried, and sudoku is not solved, go back to previous backtracking call.
            }
        }
    }

    async backtrackingVisualization() {
        let nextCell = this.nextEmpty()

        if(nextCell === false) {
            console.log('used backtracking')
            return this;
        } else {
            var candidates = nextCell.candidates;
            for(var n = 0;n < candidates.length;n++) {
                if(nextCell.isPossible(candidates[n])) {
                    nextCell.value = candidates[n]
                    this.toHTML()
                    await setDelay(10)
                    await this.backtrackingVisualization()
                }
            } 

            if(this.nextEmpty()) {
                nextCell.value = 0;
            }
        }
    }

    nakedSingles() {
        let solvedAllNaked = true
        
        for(const row of this.rowArray) {
            for(const cell of row) {
                if(cell.candidates.length === 1) {
                    cell.value = cell.candidates[0]
                    cell.removeCandidateContainer(cell.candidates[0])
                    solvedAllNaked = false
                }
            }
        }

        if(solvedAllNaked) {
            console.log('all naked solved')
            if(this.donePairs) { // Check if naked pairs has been called yet
                return this
            } else {
                if(!this.isSolved()){  // Only execute naked pairs if sudoku hasn't been solved by naked pairs yet
                    return this.nakedPairs()
                }
            }
        } else {
            return this.nakedSingles()
        }
    }

    async nakedSinglesVisualization() {
        let solvedAllNaked = true;
        
        for(const row of this.rowArray) {
            for(const cell of row) {
                if(cell.candidates.length === 1) {
                    cell.value = cell.candidates[0];
                    cell.removeCandidateContainer(cell.candidates[0])
                    solvedAllNaked = false;
                }
            }
        }

        if(solvedAllNaked) {
            console.log('all naked solved')
            if(this.donePairs) {
                return this
            } else {
                if(!this.isSolved()){
                    await setDelay(500)
                    await this.nakedPairsVisualization();
                }
            }
        } else {
            this.toHTML()
            await setDelay(500)
            await this.nakedSinglesVisualization()
        }
    }

    hiddenSingles() {
        let solvedAllHidden = true

        const hiddenContainer = function(container) {
            for(const rows of container) {
                let candidates = []
                for(const cell of rows) {
                    candidates.push(...cell.candidates)
                }
                for(var n = 1;n < 10;n++) {
                    if(candidates.filter(candidate => candidate === n).length === 1) {
                        for(const cell of rows) {
                            if(cell.candidates.includes(n)) {
                                cell.value = n
                                cell.removeCandidateContainer(n)
                                solvedAllHidden = false
                                break
                            }
                        }
                    }
                }
            }
        }

        hiddenContainer(this.rowArray) 
        hiddenContainer(this.columnArray)
        hiddenContainer(this.boxArray)
        // Execute function for all 27 containers
        
        if(solvedAllHidden) {
            console.log('all hidden solved')
            return this
        } else {
            return this.hiddenSingles()
        }
    }

    async hiddenSinglesVisualization() {
        let solvedAllHidden = true

        const hiddenContainer = function(container) {
            for(const rows of container) {
                let candidates = []
                for(const cell of rows) {
                    candidates.push(...cell.candidates)
                }
                for(var n = 1;n < 10;n++) {
                    if(candidates.filter(candidate => candidate === n).length === 1) {
                        for(const cell of rows) {
                            if(cell.candidates.includes(n)) {
                                cell.value = n
                                cell.removeCandidateContainer(n)
                                solvedAllHidden = false
                                break
                            }
                        }
                    }
                }
            }
        }

        hiddenContainer(this.rowArray)
        hiddenContainer(this.columnArray)
        hiddenContainer(this.boxArray)
        
        if(solvedAllHidden) {
            console.log('all hidden solved')
            return this
        } else {
            this.toHTML()
            await setDelay(250)
            await this.hiddenSinglesVisualization()
        }
    }

    nakedPairs() {
        const nakedContainer = function(container) {
                for(const rows of container) {
                let cells = []
                for(const cell of rows) {
                    if(cell.candidates.length === 2) {
                        cells.push(cell) 
                    }
                }
                if(cells.length > 1) {
                    if(cells[0].candidates[0] === cells[1].candidates[0] && cells[0].candidates[1] === cells[1].candidates[1]) { // Check if first and second candidates are the same in each cell
                        for(const cell of rows) {
                            if(cell !== cells[0] && cell !== cells[1]) { // Remove the 2 candidates from all cells other than the 2 compared cells
                                cell.removeCandidate(cells[0].candidates[0])
                                cell.removeCandidate(cells[0].candidates[1])
                            }
                        }
                    }
                }
            }
        }

        nakedContainer(this.rowArray) 
        nakedContainer(this.columnArray)
        nakedContainer(this.boxArray)
        // Execute function for all 27 containers

        this.donePairs = true
        this.nakedSingles()
    }

    async nakedPairsVisualization() {
        const nakedContainer = function(container) {
                for(const rows of container) {
                let cells = []
                for(const cell of rows) {
                    if(cell.candidates.length === 2) {
                        cells.push(cell)
                    }
                }
                if(cells.length > 1) {
                    if(cells[0].candidates[0] === cells[1].candidates[0] && cells[0].candidates[1] === cells[1].candidates[1]) {
                        for(const cell of rows) {
                            if(cell !== cells[0] && cell !== cells[1]) {
                                cell.removeCandidate(cells[0].candidates[0])
                                cell.removeCandidate(cells[0].candidates[1])
                            }
                        }
                    }
                }
            }
        }

        nakedContainer(this.rowArray)
        nakedContainer(this.columnArray)
        nakedContainer(this.boxArray)

        this.donePairs = true
        this.nakedSinglesVisualization()
    }

    show() {
        let showSudoku = ''
        showSudoku += '\n'
        for(const row of this.rowArray) {
            for (const cell of row) {
                showSudoku += cell.value + ' '
            }
            showSudoku += '\n'
        }
        return showSudoku
    }

    isSolved() {
        for(const row of this.rowArray) {
            for(const cell of row) {
                if(cell.value === 0) {
                    return false
                }
            }
        }
        return true
    }

    toHTML() { // Output current sudoku to HTML table
        let output = '<table>'
        for(const row of this.rowArray) {
            output += '<tr>'
            for(const cell of row) {
                output += '<td>' + cell.value + '</td>'
            }
            output += '</tr>'
        }
        output += '</table>'
        document.getElementById('output').innerHTML = output
    }

    toHTMLInput() {
        let output = '<table>'
        for(let y = 0;y < 9;y++) {
            output += '<tr>'
            for(let x = 0;x < 9;x++) {
                let inputValue
                if(this.rowArray[y][x].value === 0) {
                    inputValue = ''
                } else {
                    inputValue = this.rowArray[y][x].value
                }
                output += '<td><input class="sudoku-cell-input" type="number" id="' + y + x  + '" value="' + inputValue +  '"</td>'
            }
            output += '</tr>'
        }
        output += '</table>'
        document.getElementById('table').innerHTML = output
    }
}


document.getElementById('submitstring').addEventListener('click', function() {

    if(document.getElementById('stringinput').value.length == 81) {
        sudoku = new Sudoku(document.getElementById('stringinput').value)
        if(sudoku.isValid()) {
            document.getElementById('stringinput').value = ''
            document.getElementById('valid').innerHTML = ''
            sudoku.toHTMLInput()
            eventListeners()
        } else {
            sudoku.toHTMLInput()
            sudoku.showInvalid()
            return false
        }


    } else {
        document.getElementById('valid').innerHTML = 'Please enter a valid sudoku'
        return false
    }
    main()
})

document.getElementById('submitsudoku').addEventListener('click', function() {
    let sudokuString = ''
    document.querySelectorAll('.sudoku-cell-input').forEach(function(cell) {
        if(cell.value == '') {
            sudokuString += '0'
        } else {
            sudokuString += cell.value
        }
    })
    sudoku = new Sudoku(sudokuString)

    if(!sudoku.isValid()) {
        document.getElementById('valid').innerHTML = 'Please enter a valid sudoku'
        return false
    }
    document.getElementById('valid').innerHTML = ''
    main()

})

async function main() {
    visualization = document.getElementById('visualization').checked

    console.clear()
    console.log(sudoku.show())
    const timestamp = performance.now()
    sudoku.getAllCandidates()

    if(visualization) {
        await solveVisualization()
    } else {
        solve()
    }
    const totaltime = performance.now() - timestamp
    console.log(sudoku.show())
    console.log(totaltime)
    document.getElementById('speed').innerHTML = Math.round(totaltime * 100) / 100 + ' ms'
}

function solve() {
    sudoku.nakedSingles()
    if(!sudoku.isSolved()) {
        sudoku.hiddenSingles()
    }
    if(!sudoku.isSolved()) {
        sudoku.backtracking()
    }
    sudoku.toHTML()
}

async function solveVisualization() {
    sudoku.toHTML()
    await sudoku.nakedSinglesVisualization()
    if(!sudoku.isSolved()) {
        await sudoku.hiddenSinglesVisualization()
    }
    if(!sudoku.isSolved()) {
        await sudoku.backtrackingVisualization()
    }
    sudoku.toHTML()
}

function setDelay(delay){
    return new Promise((resolve) => {
        setTimeout(resolve, delay)
    })
}

// Sudokustrings
// 002603000500070140000501060037002009100000208000059710004080900605030400070096003  easy
// 000070000051340000403000018090000500000010076008027000000000005004098020005000704  hard
// 600000904030500060009700000003000100000304020020000540090000000000901700008072310  harder
// 000000000000000000000000000000000000000000000000000000000000000000000000000000000  empty
// 800000000003600000070090200000007000000045700000100030001000068008500010090000400  humanly impossible
// 000000000000003085001020000000507000004000100090000000500000073002010000000040009  backtracking 1+ hour (works with naked/hidden singles)
