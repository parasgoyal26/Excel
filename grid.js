let leftCol = document.querySelector(".left_col");
let topRow = document.querySelector(".top_row");
let grid = document.querySelector(".grid");
let rows = 100;
let cols = 26;

let addressInput = document.querySelector(".address-input");

let boldBtn = document.querySelector(".bold");
let underlineBtn = document.querySelector(".underline");
let italicBtn = document.querySelector(".italic");
let alignBtns = document.querySelectorAll(".align-container>*");
let fonstSizeElem = document.querySelector(".font-size");

// left_col
for (let i = 0; i < rows; i++) {
    let colBox = document.createElement("div");
    colBox.innerText = i + 1;
    colBox.setAttribute("class", "box");
    leftCol.appendChild(colBox);
}

// top_row
for (let i = 0; i < cols; i++) {
    let cell = document.createElement("div");
    cell.innerText = String.fromCharCode(65 + i);
    // setAttribute
    cell.setAttribute("class", "cell");
    topRow.appendChild(cell);
}
// grid
// ui uniqely identify -> 
for (let i = 0; i < rows; i++) {
    let row = document.createElement("div");                        // div for every row
    row.setAttribute("class", "row");
    for (let j = 0; j < cols; j++) {
        let cell = document.createElement("div");                   // div for every column (cell) of a row
        // cell.innerText=`${String.fromCharCode(65 + j)}  ${i+1}`
        cell.setAttribute("class", "cell");
        cell.setAttribute("rid", i);
        cell.setAttribute("cid", j);
        cell.setAttribute("contenteditable", "true");               // to make cells editable 
        row.appendChild(cell);                                      // append the cell to the row
    }
    grid.appendChild(row);                                          //append row to the grid
}

let btnContainer = document.querySelector(".add-sheet_btn-container");
let sheetList = document.querySelector(".sheet-list");
let firstSheet = document.querySelector(".sheet");
let formulaBar = document.querySelector(".formula-input");

let sheetArray = [];
let sheetDB;

firstSheet.addEventListener("click", makeMeActive)
firstSheet.click();

btnContainer.addEventListener("click", function () {
    // create sheet 
    let AllSheets = document.querySelectorAll(".sheet");
    let lastSheet = AllSheets[AllSheets.length - 1];
    let Lastidx = lastSheet.getAttribute("idx");
    Lastidx = Number(Lastidx);
    let Newsheet = document.createElement("div");
    Newsheet.setAttribute("class", "sheet");
    Newsheet.setAttribute("idx", `${Lastidx + 1}`);
    Newsheet.innerText = `Sheet ${Lastidx + 2}`;
    sheetList.appendChild(Newsheet);
    for (let i = 0; i < AllSheets.length; i++) {
        AllSheets[i].classList.remove("active");
    }
    Newsheet.classList.add("active");
    // new sheet create 
    createSheet();
    sheetDB = sheetArray[Lastidx+1];
    Newsheet.addEventListener("click", makeMeActive)
})

// func to make the current selected sheet active 
function makeMeActive(e) {
    // evnt listener  add 
    let sheet = e.currentTarget;
    let AllSheets = document.querySelectorAll(".sheet");
    for (let i = 0; i < AllSheets.length; i++) {
        AllSheets[i].classList.remove("active");
    }
    sheet.classList.add("active");


    let idx = sheet.getAttribute("idx");
    if(!sheetArray[idx]){
        createSheet();
    }

    sheetDB = sheetArray[idx];
    setUI();
}



function createSheet(){
    let NewDB = [];
    for(let i =0  ; i < rows ; i++){
        let row = [];
        for(let j =0 ; j  < cols ; j++){
            let cell = {
                value: "",
                formula: "",
                bold: "normal",
                italic: "normal",
                underline: "none",
                hAlign: "center",
                fontFamily: "sans-serif",
                fontSize: "16",
                color: "black",
                bColor: "none",
                children: []
            }
            let elem = document.querySelector(`.grid .cell[rid = "${i}"][cid = "${j}"]`);
            elem.innerText = "";
            row.push(cell);
        }
        NewDB.push(row);
    }
    sheetArray.push(NewDB);
}

function setUI(){
    for(let i =0 ; i < rows ; i++){
        for( let j =0 ; j < cols ; j++){
            let elem = document.querySelector(`.grid .cell[rid = "${i}"][cid= "${j}"]`);
            let value = sheetDB[i][j].value;
            elem.innerText = value;
        }
    }
}







// event listener add click;
let allCells = document.querySelectorAll(".grid .cell");                    //sare cells nikaal liye grid k
for (let i = 0; i < allCells.length; i++) {                                 
    allCells[i].addEventListener("click", function () {                     // har ek cell p event listener add krdiya
        // address get current cell
        let rid = allCells[i].getAttribute("rid");                          //rid of that cell
        let cid = allCells[i].getAttribute("cid");                          //cid of that cell
        //convert string to number
        rid = Number(rid);
        cid = Number(cid);
        let address = `${String.fromCharCode(65 + cid)}${rid + 1}`;         //rid and cid ki help se cell ka address bnaya -> A4, F23, H82
        // alert(address);
        addressInput.value = address;                                       // address-input mein value put krdi

        // imp step for 2way binding in toolbar sync
        let cellObject = sheetDB[rid][cid];
        //for bold
        if(cellObject.bold == "normal"){
            boldBtn.classList.remove("active-btn");
        }else{
            boldBtn.classList.add("active-btn");
        }

        //for italic
        if(cellObject.italic == "normal"){
            italicBtn.classList.remove("active-btn");
        }else{
            italicBtn.classList.add("active-btn");
        }
        
        //for underline
        if(cellObject.underline == "none"){
            underlineBtn.classList.remove("active-btn");
        }else{
            underlineBtn.classList.add("active-btn");
        }

        //for formula bar
        if(cellObject.formula){
            formulaBar.value = cellObject.formula;
        }else{
            formulaBar.value = "";
        }
    })
}

// formatting
//Horizontal Alignment
for(let i =0 ; i < alignBtns.length ; i++){
    alignBtns[i].addEventListener("click", function(){
        let alignment = alignBtns[i].getAttribute("class");
        let uiCellElement = findUICellElement();
        uiCellElement.style.textAlign = alignment;
    })
}

//font Size
fonstSizeElem.addEventListener("change", function(){
    let val = fonstSizeElem.value;
    let uiCellElement = findUICellElement();
    uiCellElement.style.fontSize = val + "px" ;
})

allCells[0].click();

// bold - italic - underline
boldBtn.addEventListener("click", function () {
    // Jispe cell click -> bold
    let uiCellElement = findUICellElement();
    let rid = uiCellElement.getAttribute("rid");
    let cid = uiCellElement.getAttribute("cid");
    let cellObject = sheetDB[rid][cid];
    if(cellObject.bold == "normal"){
        uiCellElement.style.fontWeight = "bold";
        boldBtn.classList.add("active-btn");
        cellObject.bold = "bold";
    }else{
        boldBtn.classList.remove("active-btn");
        uiCellElement.style.fontWeight = "normal";
        cellObject.bold = "normal";
    }
})

italicBtn.addEventListener("click", function () {
    // Jispe cell click -> italic
    let uiCellElement = findUICellElement();
    let rid = uiCellElement.getAttribute("rid");
    let cid = uiCellElement.getAttribute("cid");
    let cellObject = sheetDB[rid][cid];
    if(cellObject.italic == "normal"){
        uiCellElement.style.fontStyle = "italic";
        italicBtn.classList.add("active-btn");
        cellObject.italic = "italic";
    }else{
        italicBtn.classList.remove("active-btn");
        uiCellElement.style.fontStyle = "normal";
        cellObject.italic = "normal";
    }
})
underlineBtn.addEventListener("click", function () {
    // Jispe cell click -> bold
    let uiCellElement = findUICellElement();
    let rid = uiCellElement.getAttribute("rid");
    let cid = uiCellElement.getAttribute("cid");
    let cellObject = sheetDB[rid][cid];
    if(cellObject.underline == "none"){
        uiCellElement.style.textDecoration = "underline";
        underlineBtn.classList.add("active-btn");
        cellObject.underline = "underline";
    }else{
        underlineBtn.classList.remove("active-btn");
        uiCellElement.style.textDecoration = "underline";
        cellObject.underline = "underline";
    }
})

// text-decoration: underline|none;
// font-style: normal|italic;

///=======================================================================
//both the below functions are in formula.js

// cell element ki rid and cid calculate krke uska css selector nikalna and phir us cell ko return krna
// function findUICellElement() {
//     let address = addressInput.value;
//     let ricidObj = getRIDCIDfromAddress(address);
//     let rid = ricidObj.rid;
//     let cid = ricidObj.cid;
//     let uiCellElement = document.querySelector(`.cell[rid="${rid}"][cid="${cid}"]`)
//     return uiCellElement;
// }

// address input bar k address ko use krke current selected cell ka rid and cid return krna object ki form mein
// function getRIDCIDfromAddress(address) {
//     let cid = Number(address.charCodeAt(0)) - 65;
//     let rid = Number(address.slice(1)) - 1;
//     return { "rid": rid, "cid": cid };
// }