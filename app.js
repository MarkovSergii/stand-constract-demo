const express = require('express');
const cors = require('cors');
const app = express();

const PORT = 3232;

app.use(cors());
app.use(express.static(__dirname+'/public'));


app.listen(PORT,()=>{
    console.log('Server started at '+PORT+' port')

})