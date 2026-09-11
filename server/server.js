import express from "express"
import githubRouter from "./routes/githubRoutes.js"

const app = express()

const PORT = 5000

app.use(express.json())

app.get("/api/health",(req,res)=>{
  res.json({
    status : "ok"
  })
})

app.use("/api/github",githubRouter)

app.listen(PORT,()=>{
  console.log(`Server started running on port ${PORT}`)
})

