import express from "express"
import cors from "cors"
import 'dotenv/config'
import cookieParser from "cookie-parser"
import conn from "./config/mongodb.js"
import authRouter from "./routes/authRoutes.js"


const app = express()
const port = process.env.port || 4000

conn()

app.use(express.json())
app.use(cookieParser())
app.use(cors({credentials: true})) /* send cookies when response*/

// API endpoints
app.get('/', (req, res)=> res.send("API is working."))
app.use('/api/auth', authRouter)

app.listen(port, ()=> console.log(`API ทำงานที่พอร์ต:${port}`))