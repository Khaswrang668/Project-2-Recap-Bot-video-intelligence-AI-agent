import 'dotenv/config'
import { app } from "./app.js"
import fs from 'fs';

['./uploads/inputs', './uploads/outputs'].forEach(dir => {
  fs.mkdirSync(dir, { recursive: true })
})

app.listen(process.env.PORT_NO || 4000, ()=>{
    console.log(`The server is running at http://localhost:${process.env.PORT_NO}`)
})