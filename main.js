const { parse } = require('./parser.js');
const fs = require('fs').promises;
const { readFileSync, createReadStream } = require('fs');
const csv = require('csv-parser');
const get = require("async-get-file");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

async function parseSingle(path){
    const file = fs.readFileSync(path);
    const data = await parse(file);
}

function readCSV(path){
    return new Promise((resolve)=>{
      const results = [];
  
      createReadStream(path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          resolve(results);
        });
  
    });
}

function writeCSV(data, output){
    const csvWriter = createCsvWriter({
        path: output,
        header: [
            {id: 'id', title: 'Student ID'},
            {id: 'comp2606', title: 'COMP 2606'},
            {id: 'info2602', title: 'INFO 2602'},
            {id: 'comp2611', title: 'COMP 2611'},
            {id: 'comp2605', title: 'COMP 2605'},
            {id: 'gpa', title: 'GPA'},
        ]
    });

    return csvWriter.writeRecords(data);

}

async function* walkFiles(path) {
    const dir = await fs.opendir(path);
    for await (const dirent of dir) {
        dirent.path = path + dirent.name;
        yield dirent;
    }
}


async function batchParse(directory){
    const names = []
    for await (let {name} of walkFiles(directory)){
        names.push(name);
    }
    const promises = names.map(function(file){ return readFileSync(directory+file) } );
    const files = await Promise.all(promises);
    const par_promises = files.map(file => parse(file));
    const results = await Promise.all(par_promises);
    writeCSV(results, 'grades.csv')
}

async function download(csvfile, urlKey, directory){
    const data = await readCSV(csvfile);
    const key = Object.keys(data[0])[0];//no clue why this is necessary this is returning false when compared to idKey
   
    const promises = data.filter(row => getTranscriptURL(row[urlKey]) !== "")
                        .map( function(row){ 
                            const url = getTranscriptURL(row[urlKey]);
                            const filename = row[key]+'.pdf'
                            return get( url, { directory, filename} ); 
                        });

    await Promise.any(promises);
    console.log('Done');
}

function getTranscriptURL(string){
    const [first, ...rest] = string.split(' ').reverse();
    return first.substring(1, first.length-1);
}

// download('applicants.csv', 'Transcript', './app_transcripts');
batchParse('app_transcripts/');
