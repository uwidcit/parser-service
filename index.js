const express = require('express')
const path = require('path')
const multer  = require('multer')
const cors = require('cors')
const upload = multer({storage: multer.memoryStorage()})
const { parse } = require('./uwi-parser');
const PORT = process.env.PORT || 5001

express()
  .use(cors())
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/parseForm', upload.single('file'), async (req, res)=>{
    const { parsedText, ...data} = await parse(req.file.buffer);
    console.log(Object.keys(data));
    res.render('pages/result', {data, parsedText});
    //res.send(data);
  })
  .post('/parse', upload.single('file'), async (req, res)=>{
    if(!('file' in req))
      res.send({message:'file not found'})
    const data = await parse(req.file.buffer);
    res.send(data);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
