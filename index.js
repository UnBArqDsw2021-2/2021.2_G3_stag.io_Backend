const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sql = require("mssql");

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";

// app.get('/', (req,res) => {
//     res.send('Hello world')
// })

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const credentials = require("./credentials");

app.get("/credentials", (req, res) => {
  res.send(credentials);
});

//Informações de conexão com o banco
sql
  .connect(credentials)
  .then((pool) => {
    console.log("Conectando ao banco");
  })
  .then((result) => {
    console.log("Conectado");
  })
  .catch((err) => {
    console.log("Erro ao se conectar com o banco de dados");
  });

const router = express.Router();
router.get("/", (req, res) => res.send("API no ar!"));
app.use("/", router);

app.get("/teste", async (req, res) => {
  const response = await sql.query`SELECT * from teste`;
  console.log(response);
  res.send(response.recordset);
});

app.listen(PORT, HOST, () => console.log(`Listening on port ${PORT}`)); //Informa a porta por qual o serviço está "ouvindo"