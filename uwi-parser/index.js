const PDFParser = require("pdf2json"); //https://www.npmjs.com/package/pdf2json

/**
 * @description receives the location of a pdf file and returns a promise which resolves with the parsed json data 
 * @param {String} fileBuffer the file stored in memory 
 */
async function getPDFText(fileBuffer){
    let json = await new Promise((resolve, reject) => {
        let pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataReady", pdfData => resolve(pdfData));
        pdfParser.on("pdfParser_dataError", errData => reject(errData));
        pdfParser.parseBuffer(fileBuffer);
    });
    
    let pdfText = [];

    for(let page of json['Pages']){
        for(let text of page['Texts']){
            for(let rec of text['R']){
                let token = rec['T'];
                pdfText.push(token)
            }
        }
    }
    return pdfText;
}

/**
 * @param {String} token - Replaces uri encoding in the string given eg %2B => +
 */
function decode(token){
    token = token.replace(/\%2B/g, '+');
    token = token.replace(/\%20/g, ' ');
    return token;
}

function isUpper(str) {
    return !/[a-z]/.test(str) && /[A-Z]/.test(str);
}

function isInt(str){
    return /^[1-9]\d*$/.test(str);
}

function isPassingGrade(code){
    singleLetters =["A","B","C","P"];
    otherCodes = ["EC","EX"]; 
    return singleLetters.includes(code[0]) || otherCodes.includes(code);
 } 

 /**
  * 
  * @param {*} text - data retrieved from parsing with pdfParser and flattening with getPDFText()
  * @param {*} filename - name of file
  */
function getStudentData(text, filename){
    let inprogress = false;

    let student = {
        id:undefined,
        gpa:undefined,
        fullname: undefined,
        parsedText: undefined,
        courses: {},
    }

    if(filename)
        student.filename = filename;

    let printTable = false;

    let i = 0;
    for(let token of text){

        if(token == "R"){
            printTable = true;
        }

        if(printTable == true){
            if(isUpper(token) && token.length == 4 && isInt(text[i+1])){
                grade = decodeURI(text[i+5]).trim();
                courseNum = text[i+1];
                courseCode = token;
                
                course = courseCode + " " + courseNum;
                // passed = isPassingGrade(grade);
                
                // if(passed){
                student.courses[course] = decode(grade);
                // console.log( course +"\t"+grade);

                // }
                    
                    
            }
        }

        if(printTable == true && token == "Term%20Totals")
            printTable = false;

        
        if(token === "Record%20of%3A")
            student.fullname = decode(text[i-1])

        //reached the courses in progress section of transcript
        if(!inprogress && token === "In%20Progress%20Courses%3A"){
            inprogress = true;
        }

        if(token === "DEGREE%20GPA%20TOTALS"){
            student.gpa = text[i - 1]; 
        }

        if(token === "Record%20of%3A"){
            student.id = text[ i + 1]
        }
            
        i++;
    }

    student.parsedText = text;
    return student;
}

async function parse(file){
    const text = await getPDFText(file);
    return getStudentData(text);
}


module.exports = {parse}


