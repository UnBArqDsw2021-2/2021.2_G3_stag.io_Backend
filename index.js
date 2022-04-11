const helper = require("./helper");

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
    console.log("Conectado..");
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

app.post("/cadastro", async (req, res) => {
  const corpo = req.body;
  const tipoUsuario = corpo.tipoUsuario;

  if (tipoUsuario === "candidato") {
    const nome = corpo.nome;
    const cpf = corpo.cpf;
    const senha = corpo.senha;
    const cidade = corpo.cidade;
    const uf = corpo.uf;
    const idEscolaridade = corpo.idEscolaridade;
    const curriculo = corpo.curriculo;
    const areasInteresse = corpo.areasInteresse;
    const descricaoCandidato = corpo.descricaoCandidato;

    if (corpo.email !== undefined) {
      var email = corpo.email
    }
    else{
      var email = ''
    }

    if (corpo.nomeInstituicao !== undefined) {
      const nomeInstituicao = corpo.nomeInstituicao;
      var idInstituicao = await helper.getIdInstituicao(
        sql,
        nomeInstituicao,
        idEscolaridade
      );
    } else {
      var idInstituicao = "";
    }

    if (corpo.nomeCurso !== undefined) {
      const nomeCurso = corpo.nomeCurso;
      var idCurso = await helper.getIdCurso(sql, nomeCurso, idEscolaridade);
    } else {
      var idCurso = "";
    }

    let idLocalizacao = await helper.getIdLocalizacao(sql, cidade, uf);

    if (await helper.verificaCadidatoExiste(sql, cpf)) {
      console.log("Candidato já existe");
      res.status(500).send("Candidato já existe");
    } else {
      console.log("Cadastra candidato");
      const queryInsereCandidato =
        await sql.query`INSERT INTO 
        CANDIDATO(cpf,senha,nomeCompleto,email,descricaoCandidato,curriculo,idEscolaridade,idInstituicao,idCurso,idLocalizacao,areasInteresse) 
           VALUES(${cpf},${senha},${nome},${email},${descricaoCandidato},NULL,${idEscolaridade},${idInstituicao},${idCurso},${idLocalizacao},${areasInteresse})`;
      
      res.send("Cadastra candidato");
    }
  } else if (tipoUsuario === "empresa") {
    if (await helper.verificaEmpresaExiste(sql, corpo.cnpj))
      res.status(500).send("Empresa já cadastrada no sistema");
    else
    {
      let idLocalizacao = await helper.getIdLocalizacao(sql, corpo.cidade, corpo.uf);
  
      await sql.query `INSERT INTO EMPRESA
                      VALUES(${corpo.cnpj}, ${corpo.senha}, ${corpo.nomeEmpresa}, ${corpo.siteEmpresa}, ${corpo.descricaoEmpresa}, ${idLocalizacao})`;
  
      res.send("Empresa cadastrada");
    }
  }
});

app.get("/login", async (req, res) => {
  const corpo = req.body;
  const credencial = corpo.credencial;
  const senha = corpo.senha;

  if (credencial.length == 14) {
    console.log("CNPJ recebido");

    const query =
      await sql.query`SELECT * from EMPRESA WHERE cnpj=${credencial} AND senha=${senha}`;

    console.log(query);
  } else if (credencial.length == 11) {
    console.log("CPF recebido");
  } else {
    res.status(500).send("Algo deu errado!");
  }
});

app.listen(PORT, HOST, () => console.log(`Listening on port ${PORT}`)); //Informa a porta por qual o serviço está "ouvindo"
