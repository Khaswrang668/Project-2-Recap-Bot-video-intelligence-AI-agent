import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'; //for parsing cookies to extract jwt tokens

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//Import the routes here from route folder
//Link them to api/v1/{domain_name}

app.get('/',(req,res)=>{
    res.send('The server is working')
})

export {app}