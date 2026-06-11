import { app } from "./app.js"

app.listen(process.env.PORT_NO || 4000, ()=>{
    console.log(`The server is running at http://localhost:${process.env.PORT_NO}`)
})