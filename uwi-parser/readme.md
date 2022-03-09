# UWI Transcript Parser

A simple package that parses UWI Transcripts.

## Usage

```
const {parse} = require('uwi-parser'); // import the parse function
const {readFileSync} = require('fs');

async function main(){
    const file = readFileSync('/path/to/file');
    const data = parse(file);
    console.log(data)
}


```