const {parse} = require('./index.js'); // import the parse function
const {readFileSync} = require('fs');

async function main(){
    const file = readFileSync('./transcript.pdf');
    const data = await parse(file);
    console.log(data);
}

main()