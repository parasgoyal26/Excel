for (let i = 0; i < allCells.length; i++) {
    // to save the user enetered value into db for later use
    allCells[i].addEventListener("blur", function () {              // jaise hi cell p blur event call hoga ye wala action listener chalega 
        let data = allCells[i].innerText;                           //cell se data nikala jo hum type krenge
        let address = addressInput.value;
        // console.log(address);
        // let { rid, cid } = getRIDCIDfromAddress(address);

        console.log(allCells[i]);
        let rid = allCells[i].getAttribute("rid");
        let cid = allCells[i].getAttribute("cid");
        let cellObject = sheetDB[rid][cid];                         //cell ka object nikala jo sheet db m h 
        
        if(cellObject.value == data){
            return;
        }

        if(cellObject.formula){
            removeFormula(cellObject, address);
            formulaBar.value = "";
        }

        cellObject.value = data;                                    // value se krdi cell ki object mein
        updateChildren(cellObject);                                 // jab bhi ko cell update hoga to uske childer bhi update honge ( case 2 for formula )
    })
}

function removeFormula(cellObject, myName){
    let formula = cellObject.formula;
    let formulaTokens = formula.split(" ");
    for(let i =0 ; i < formulaTokens.length ; i++){
        let ascii = formulaTokens[i].charCodeAt(0);
        if (ascii >= 65 && ascii <= 90) {
            let { rid, cid } = getRIDCIDfromAddress(formulaTokens[i]);
            let parentObj = sheetDB[rid][cid];
            let idx = parentObj.children.indexOf(myName);
            parentObj.children.splice(idx , 1);
        }
        
    }
    cellObject.formula = "";
}

formulaBar.addEventListener("keydown", function (e) {                       //formula bar p enter press krenege to 
    if (e.key == "Enter" && formulaBar.value) {
        // user input formula
        let currentFormula = formulaBar.value;
        let address = addressInput.value;
        let {rid,cid} = getRIDCIDfromAddress(address);
        let cellObject = sheetDB[rid][cid];

        //formula update
        if(currentFormula != cellObject.formula){
            removeFormula(cellObject, address);
        }
        // formula -> value get
        let value = evaluateFormula(currentFormula);
        // given for which we are setting the formula -> ui,db update 
        setCell(value, currentFormula);                                     // current cell k object mein (sheet db) value and formula set krenge and UI p bhi value update ho jaegi
        setParentCHArray(currentFormula, address);                          // current cell k children array mein childer update krenege 
        updateChildren(cellObject);
    }
})

function evaluateFormula(formula) {                                         // address bar k formula ko evaluate krne k liye
    // ( A1 + A2 )
    // split 
    // [(,A1,+,A2,)]
    // a-> z
    let formulaTokens = formula.split(" ");
    for (let i = 0; i < formulaTokens.length; i++) {
        let ascii = formulaTokens[i].charCodeAt(0);
        if (ascii >= 65 && ascii <= 90) {
            let { rid, cid } = getRIDCIDfromAddress(formulaTokens[i]);
            let value = sheetDB[rid][cid].value;
            if(value == ""){
                value = 0;
            }
            formulaTokens[i] = value;
        }
    }
    // [(,10,+,20,)]
    let evaluatedFormula = formulaTokens.join(" ");
    // ( 10 + 20 )
    // stack 
    return eval(evaluatedFormula);                          // formula ki value solve krdega ye inbuilt function
}


function setCell(value, formula) {
    let uicellElem = findUICellElement();
    uicellElem.innerText = value;
    // db update 
    let { rid, cid } = getRIDCIDfromAddress(addressInput.value);
    sheetDB[rid][cid].value = value;
    sheetDB[rid][cid].formula = formula;
}


// dom element reference that is inside address bar  
function findUICellElement() {
    let address = addressInput.value;
    let ricidObj = getRIDCIDfromAddress(address);
    let rid = ricidObj.rid;
    let cid = ricidObj.cid;
    let uiCellElement =
        document.querySelector(`.cell[rid="${rid}"][cid="${cid}"]`)
    return uiCellElement;
}
// Address (string)-> rid /cid
function getRIDCIDfromAddress(address) {
    let cid = Number(address.charCodeAt(0)) - 65;
    let rid = Number(address.slice(1)) - 1;
    return { "rid": rid, "cid": cid };
}
// register yourself as children of the parent(cells that are appearing in the formula)
function setParentCHArray(formula, chAddress) {
    let formulaTokens = formula.split(" ");
    for (let i = 0; i < formulaTokens.length; i++) {
        let ascii = formulaTokens[i].charCodeAt(0);
        if (ascii >= 65 && ascii <= 90) {
            let { rid, cid } = getRIDCIDfromAddress(formulaTokens[i]);
            let parentObj = sheetDB[rid][cid];
            parentObj.children.push(chAddress);
        }
    }
}
function updateChildren(cellObject) {
    let children = cellObject.children;
    for (let i = 0; i < children.length ; i++) {
        // children name
        let chAddress = children[i];
        let { rid, cid } = getRIDCIDfromAddress(chAddress);
        // 2d array
        let childObj = sheetDB[rid][cid];
        // get formula of children
        let chFormula = childObj.formula;
        let newValue = evaluateFormula(chFormula);
        SetChildrenCell(newValue, chFormula, rid, cid);
        updateChildren(childObj);
    }
}
function SetChildrenCell(value, formula, rid, cid) {
    // let uicellElem = findUICellElement();
    // db update 
    let uiCellElement = document.querySelector(`.cell[rid="${rid}"][cid="${cid}"]`);
    uiCellElement.innerText = value;
    sheetDB[rid][cid].value = value;
    //sheetDB[rid][cid].formula = formula;
}