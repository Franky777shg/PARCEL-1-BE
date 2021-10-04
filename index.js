require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bearerToken = require("express-bearer-token")

const { db } = require("./database")

const PORT = 2000

const app = express()
app.use(cors())
app.use(express.json())
app.use(bearerToken())
app.use(express.static("./public"))

db.connect((err) => {
  if (err) return console.log("Error connecting: " + err.message)

  console.log("Connected to MYSQL as ID " + db.threadId)
})

app.get("/", (req, res) => {
  res.status(200).send("<h1>Welcome to Parcel API</h1>")
})

const { AuthRouter, adminProductRouter } = require("./routers")
// ROUTER
app.use("/auth", AuthRouter)
app.use('/productAdmin', adminProductRouter)

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}/`))
