import xlsx  from 'node-xlsx';
import { appendFileSync, readFileSync, writeFileSync } from "fs";

export const csvFileToArray = (path: string)=> {
    const text = readFileSync(path, 'utf-8');
    const currentSheet: string[][] = [];
    const rows = text.split('\r\n')
    for(let r = 0; r<rows.length; r++){
        const noDbleQuotes = rows[r].replace(/""/g, '-|-');
        const regX = new RegExp('("[^"]+"|[^,]+)*', 'g');
        const newRow = noDbleQuotes.split(regX);
        const fixedRow = newRow.map(rl=>{
            if(rl==null){
                return ""
            }
            return rl.replace(/\-\|\-/g, '"')
        });
        const fixedRow3 = fixedRow.map(rl=>{
            let string = rl;
            if(string.startsWith('"')){
                string = string.substring(1)
            }
            let endString = string;
            if(endString.endsWith('"')){
                endString = endString.substring(0, endString.length-1);
            }
            return endString
        })
        const dataRow = [...fixedRow3]
        if(dataRow[0]===""){
            dataRow.shift();
        }
        if(dataRow[dataRow.length-1]===""){
            dataRow.pop();
        }
        const noCommaCells = dataRow.filter(dr=>{
            return dr.trim()!==','
        })
        const fixUndefined = noCommaCells.map(dr=>{
            if(dr!=null) return dr
            return ""
        })
        currentSheet.push(fixUndefined)
    } 
    const setFinder = (headerName: string)=>{
        const headerPosition = currentSheet[0].map(heads=>{
            return heads.trim().toLowerCase()
        }).indexOf(headerName.toLowerCase());
        return headerPosition
        
    }
    const getVal = (row: number, col: string) => {
        const colNum = setFinder(col);
        if(colNum==null||colNum===-1){
            return ''
        }
        const val = currentSheet[row][colNum]==null?'':currentSheet[row][colNum]
        return val;
    }
    
    const changeColVal = (row: string[], col: string, newVal: string)=>{
            const colNum = setFinder(col);
            if(colNum==null||colNum===-1){
                console.log('NO COLUMN FOUND')
                return row
            }
            else{
                const beforeVal = [...row].splice(0, colNum);
                const afterVal = [...row].splice(colNum+1);
                const newRow = [...beforeVal, newVal,...afterVal]
                return newRow;
            }
            
    }
    return {currentSheet, getVal, changeColVal}
}


export const xlsxFileToArray = async (path: string, sheet: number|string, headerRow?: number)=> {
    try{
        const data = readFileSync(path);
        const file = await xlsx.parse(data);
        let currentSheet: string[][] = []
        if(typeof(sheet)==='string'){
            const sheetFinder = file.find(f=>`${f.name}`.toLowerCase().includes(sheet.toLowerCase()));
            if(sheetFinder!=null){
                currentSheet = sheetFinder.data
            }
        }
        else{
            currentSheet= file[sheet].data;

        }
        const headers = currentSheet[headerRow!=null?headerRow:0];
        console.log({headers})

        const setFinder = (headerName: string)=>{
            const headerPosition = currentSheet[headerRow!=null?headerRow:0].map(heads=>{
                return `${heads}`.trim().toLowerCase()
            }).indexOf(headerName.toLowerCase());
            return headerPosition
            
        }
        const getVal = (row: number, col: string) => {
            const colNum = setFinder(col);
            if(colNum==null||colNum===-1){
                return ''
            }
            const val = currentSheet[row][colNum]==null?'':currentSheet[row][colNum]
            return val;
        }
        
        const changeColVal = (row: string[], col: string, newVal: string)=>{
                const colNum = setFinder(col);
                if(colNum==null||colNum===-1){
                    console.log('NO COLUMN FOUND')
                    return row
                }
                else{
                    const beforeVal = [...row].splice(0, colNum);
                    const afterVal = [...row].splice(colNum+1);
                    const newRow = [...beforeVal, newVal,...afterVal]
                    return newRow;
                }
                
        }
        return {currentSheet, getVal, changeColVal}
    }
    catch(err: any){
        console.log({err})

    }
}


export const arrayToCsv = (data: string[][], path?: string) => {
    const fileString = data.map(row =>{
        return row
        .map(v=>`${v}`)
        .map(v=> v.replace(/\|\-\|/g, ',').replace(/\"/g, '""'))
        .map(v=>`"${v}"`)
        .join(',')
    }).join('\r\n');

    if(path!=null){
        writeFileSync(path, fileString, 'utf-8');
        return 'saved'
    }

    return fileString

}

export const rowToCsvRowString = (row: string[]) => {
    const dataString = row
        .map(v=>`${v}`)
        .map(v=> v.replace(/\|\-\|/g, ',').replace(/\"/g, '""'))
        .map(v=>`"${v}"`)
        .join(',')
    return `${dataString}\r\n`
}

export const addRow = (path: string, row: string[]) => {
    const dataString = row
        .map(v=>`${v}`)
        .map(v=> v.replace(/\|\-\|/g, ',').replace(/\"/g, '""'))
        .map(v=>`"${v}"`)
        .join(',')
    const rowString =  `${dataString}\r\n`;
    appendFileSync(path, rowString);
}
