const helper = require("./helper");

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sql = require("mssql");

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0";

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
  credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('dotenv').config();

const credentials = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  server: process.env.SERVER,
  database: process.env.DATABASE,
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
};

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
      var email = corpo.email;
    } else {
      var email = "";
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
      const queryInsereCandidato = await sql.query`INSERT INTO 
        CANDIDATO(cpf,senha,nomeCompleto,email,descricaoCandidato,curriculo,idEscolaridade,idInstituicao,idCurso,idLocalizacao,areasInteresse) 
           VALUES(${cpf},${senha},${nome},${email},${descricaoCandidato},NULL,${idEscolaridade},${idInstituicao},${idCurso},${idLocalizacao},${areasInteresse})`;

      res.send("Cadastra candidato");
    }
  } else if (tipoUsuario === "empresa") {
    if (await helper.verificaEmpresaExiste(sql, corpo.cnpj))
      res.status(500).send("Empresa já cadastrada no sistema");
    else {
      let idLocalizacao = await helper.getIdLocalizacao(
        sql,
        corpo.cidade,
        corpo.uf
      );

      await sql.query`INSERT INTO EMPRESA
                      VALUES(${corpo.cnpj}, ${corpo.senha}, ${corpo.nomeEmpresa}, ${corpo.siteEmpresa}, ${corpo.descricaoEmpresa}, ${idLocalizacao})`;

      res.send("Empresa cadastrada");
    }
  }
});

app.get("/login", async (req, res) => {
  const corpo = req.query;
  const credencial = corpo.credencial;
  const senha = corpo.senha;

  try {
    if (credencial.length == 14) {
      console.log("CNPJ recebido");
  
      const queryEmpresa =
        await sql.query`SELECT * from EMPRESA WHERE cnpj=${credencial} AND senha=${senha}`;
  
      if (queryEmpresa.rowsAffected[0] == 1) {
        const idEmpresa = queryEmpresa.recordset[0].cnpj;

        const vagasEmpresa = await sql.query`SELECT *
                                               FROM VAGA
                                              WHERE cnpjEmpresa = ${idEmpresa}`;

        const localEmpresa = await sql.query`SELECT *
                                               FROM LOCALIZACAO
                                              WHERE idLocalizacao = ${queryEmpresa.recordset[0].idLocalizacao}`
  
        res.send({ tipoUsuario: "empresa", idEmpresa: idEmpresa, nomeEmpresa: queryEmpresa.recordset[0].nomeEmpresa, siteEmpresa: queryEmpresa.recordset[0].siteEmpresa,
                   descricaoEmpresa: queryEmpresa.recordset[0].descricaoEmpresa, uf: localEmpresa.recordset[0].uf, cidade: localEmpresa.recordset[0].cidade, vagasEmpresa: vagasEmpresa.recordset});
      } else {
        res.status(500).send("Empresa não encontrada");
      }
    } else if (credencial.length == 11) {
      console.log("CPF recebido");
  
      const queryCandidato =
        await sql.query`SELECT cpf, nomeCompleto, email, descricaoCandidato, curriculo, idEscolaridade, idInstituicao, idCurso, idLocalizacao, areasInteresse
                          FROM CANDIDATO
                         WHERE cpf = ${credencial}
                           AND senha = ${senha}`;
  
      if (queryCandidato.rowsAffected[0] == 1) {
        const idCandidato = queryCandidato.recordset[0].cpf;

        const localCandidato = await sql.query`SELECT *
                                                 FROM LOCALIZACAO
                                                WHERE idLocalizacao = ${queryCandidato.recordset[0].idLocalizacao}`
  
        res.send({ tipoUsuario: "candidato", idCandidato: idCandidato, nomeCompleto: queryCandidato.recordset[0].nomeCompleto,
                   email: queryCandidato.recordset[0].email, descricaoCandidato: queryCandidato.recordset[0].descricaoCandidato, curriculo: queryCandidato.recordset[0].curriculo,
                   idEscolaridade: queryCandidato.recordset[0].idEscolaridade, idInstituicao: queryCandidato.recordset[0].idInstituicao, idCurso: queryCandidato.recordset[0].idCurso,
                   uf: localCandidato.recordset[0].uf, cidade: localCandidato.recordset[0].cidade, areasInteresse: queryCandidato.recordset[0].areasInteresse});
      } else {
        res.status(500).send("Candidato não encontrado");
      }
    } else {
      res.status(500).send("Algo deu errado!");
    }
  } catch (error) {
    console.log(error)
    res.status(500).send("Algo deu errado!");
  }
});

app.post("/cadastraVaga", async (req, res) => {
  const corpo = req.body;

  const tituloVaga = corpo.tituloVaga;
  const descricaoVaga = corpo.descricaoVaga;
  const modeloTrabalho = corpo.modeloTrabalho;
  const cargaHoraria = corpo.cargaHoraria;
  const requisitos = corpo.requisitos;
  const privilegios = corpo.privilegios;
  const tags = corpo.tags;
  const bolsa = corpo.bolsa;
  const status = 1;
  const idEscolaridade = corpo.idEscolaridade;
  const idEmpresa = corpo.idEmpresa;
  const cidade = corpo.cidade;
  const uf = corpo.uf;

  let idLocalizacao = await helper.getIdLocalizacao(sql, cidade, uf);

  const query =
    await sql.query`INSERT INTO VAGA(tituloVaga,descricaoVaga,modeloTrabalho,cargaHoraria,requisitos,privilegios,tags,bolsa,status,cnpjEmpresa,idLocalizacao,idEscolaridade)
                                    VALUES(${tituloVaga},${descricaoVaga},${modeloTrabalho},${cargaHoraria},${requisitos},${privilegios},${tags},${bolsa},${status},${idEmpresa},${idLocalizacao},${idEscolaridade})`;

  if (query.rowsAffected[0] == 1) {
    res.send("Vaga cadastrada");
  } else {
    res.status(500).send("Falha ao cadastrar vaga");
  }
});

app.put("/atualizarVaga", async (req,res) => {
  const corpo = req.body;

  const idVaga = corpo.idVaga;
  const tituloVaga = corpo.tituloVaga;
  const descricaoVaga = corpo.descricaoVaga;
  const modeloTrabalho = corpo.modeloTrabalho;
  const cargaHoraria = corpo.cargaHoraria;
  const requisitos = corpo.requisitos;
  const privilegios = corpo.privilegios;
  const tags = corpo.tags;
  const bolsa = corpo.bolsa;
  const status = corpo.status;
  const idEscolaridade = corpo.idEscolaridade;
  const idEmpresa = corpo.idEmpresa;
  const cidade = corpo.cidade;
  const uf = corpo.uf;

  let idLocalizacao = await helper.getIdLocalizacao(sql, cidade, uf);

  const query =
    await sql.query`UPDATE VAGA
                       SET tituloVaga = ${tituloVaga},
                           descricaoVaga = ${descricaoVaga},
                           modeloTrabalho = ${modeloTrabalho},
                           cargaHoraria = ${cargaHoraria},
                           requisitos = ${requisitos},
                           privilegios = ${privilegios},
                           tags = ${tags},
                           bolsa = ${bolsa},
                           status = ${status},
                           cnpjEmpresa = ${idEmpresa},
                           idLocalizacao = ${idLocalizacao},
                           idEscolaridade = ${idEscolaridade}
                     WHERE idVaga = ${idVaga}`;

  if (query.rowsAffected[0] == 1) {
    res.send("Vaga atualizada!");
  } else {
    res.status(500).send("Falha ao atualizar vaga");
  }
})

//Função que recupera um candidato a partir de seu cpf
app.get("/getCandidato", async (req, res) => {
  const cpfCandidato = req.query.cpfCandidato;

  const response = await sql.query`SELECT *
                                     FROM CANDIDATO
                                    WHERE cpf = ${cpfCandidato}`;

  res.send(response.recordset);
});

// Função que candidata em uma vaga
app.post("/candidataVaga", async (req, res) => {
  const cpfCandidato = req.body.cpfCandidato;
  const idVaga = req.body.idVaga;

  if (await helper.verificaCandidaturaExiste(sql, cpfCandidato, idVaga))
      res.status(500).send("Usuário já concorrendo à vaga");
  else
  {
    var hoje = new Date();
    var dd = String(hoje.getDate()).padStart(2, "0");
    var mm = String(hoje.getMonth() + 1).padStart(2, "0"); //Janeiro é 0!
    var yyyy = hoje.getFullYear();
  
    hoje = yyyy + mm + dd;
  
    await sql.query`INSERT INTO deseja (cpfCandidato, idVaga, dataInicioDeseja)
                                VALUES (${cpfCandidato}, ${idVaga}, ${hoje})`;
  
    res.send("Candidatura realizada");
  }
});

app.get("/getVaga", async (req, res) => {
  const idVaga = req.query.idVaga;

  const response = await sql.query`SELECT *
                                     FROM VAGA
                                     WHERE idVaga = ${idVaga}`;

  res.send(response.recordset);
});

app.get("/getVagasCandidato", async (req, res) => {
  const cpfCandidato = req.query.cpfCandidato;

  const response = await sql.query`SELECT V.*
                                     FROM deseja d INNER JOIN
                                     VAGA V ON d.idVaga = V.idVaga
                                     WHERE d.cpfCandidato = ${cpfCandidato}`;

  res.send(response.recordset);
});

app.get("/getVagasEmpresa", async (req, res) => {
  const cnpjEmpresa = req.query.cnpjEmpresa;

  const response = await sql.query`SELECT *
                                     FROM VAGA
                                    WHERE cnpjEmpresa = ${cnpjEmpresa}`;

  res.send(response.recordset);
});

app.get("/getAllVagas", async (req, res) => {
  // TODO: receber filtros

  const response = await sql.query`SELECT v.idVaga, v.tituloVaga, v.descricaoVaga, v.modeloTrabalho, v.cargaHoraria, v.requisitos, v.privilegios, v. tags, v.bolsa, v.status,
                                          V.cnpjEmpresa, E.nomeEmpresa,
                                          ESC.nomeEscolaridade, L.uf, L.cidade
                                     FROM VAGA V INNER JOIN
                                          EMPRESA E ON E.cnpj = V.cnpjEmpresa INNER JOIN
                                          LOCALIZACAO L ON L.idLocalizacao = v.idLocalizacao INNER JOIN
                                          ESCOLARIDADE ESC ON ESC.idEscolaridade = V.idEscolaridade`;
  // TODO: filtrar SELECT

  res.send(response.recordset)
});

app.delete("/delVaga", async (req, res) => {
  const idVaga = req.body.idVaga;

  await sql.query`DELETE VAGA
                   WHERE idVaga = ${idVaga}`;

  res.send("Vaga Excluída");
});

app.listen(PORT, HOST, () => console.log(`Ouvindo na porta ${PORT}`)); //Informa a porta por qual o serviço está "ouvindo"
