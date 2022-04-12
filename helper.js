async function getIdLocalizacao(sql, cidade, uf) {
  let idLocalizacao;
  const queryResgataLocalizacao =
    await sql.query`SELECT idLocalizacao FROM LOCALIZACAO WHERE cidade = ${cidade} AND uf=${uf}`;

  if (queryResgataLocalizacao.rowsAffected[0] == 0) {
    // Se localização não existir, insere e já resgata seu id
    const queryInserirLocalizacao =
      await sql.query`INSERT INTO LOCALIZACAO(cidade,uf) VALUES (${cidade},${uf})`;
    const queryResgataLocalizacao =
      await sql.query`SELECT idLocalizacao FROM LOCALIZACAO WHERE cidade = ${cidade} AND uf=${uf}`;
    idLocalizacao = queryResgataLocalizacao.recordset[0].idLocalizacao;
  } else {
    idLocalizacao = queryResgataLocalizacao.recordset[0].idLocalizacao;
  }

  return idLocalizacao;
}

async function getIdInstituicao(sql, nomeInstituicao, idEscolaridade) {
  let idInstituicao
  const queryResgataLocalizacao =
    await sql.query`SELECT idInstituicao FROM INSTITUICAO WHERE nomeInstituicao = ${nomeInstituicao}`;

  if (queryResgataLocalizacao.rowsAffected[0] == 0) {
    // Se localização não existir, insere e já resgata seu id
    const queryInserirLocalizacao =
      await sql.query`INSERT INTO INSTITUICAO(nomeInstituicao, idEscolaridade) VALUES (${nomeInstituicao},${idEscolaridade})`;
    const queryResgataLocalizacao =
      await await sql.query`SELECT idInstituicao FROM INSTITUICAO WHERE nomeInstituicao = ${nomeInstituicao}`;
    idInstituicao = queryResgataLocalizacao.recordset[0].idInstituicao;
  } else {
    idInstituicao = queryResgataLocalizacao.recordset[0].idInstituicao;
  }

  return idInstituicao;
}

async function getIdCurso(sql, nomeCurso, idEscolaridade) {
  let idCurso;
  const queryResgataLocalizacao =
    await sql.query`SELECT idCurso FROM CURSO WHERE nomeCurso = ${nomeCurso}`;

  if (queryResgataLocalizacao.rowsAffected[0] == 0) {
    // Se localização não existir, insere e já resgata seu id
    const queryInserirLocalizacao =
      await sql.query`INSERT INTO CURSO(nomeCurso,idEscolaridade) VALUES (${nomeCurso},${idEscolaridade})`;
    const queryResgataLocalizacao =
      await sql.query`SELECT idCurso FROM CURSO WHERE nomeCurso = ${nomeCurso}`;
    idCurso = queryResgataLocalizacao.recordset[0].idCurso;
  } else {
    idCurso = queryResgataLocalizacao.recordset[0].idCurso;
  }

  return idCurso;
}

async function verificaCadidatoExiste(sql, cpf) {
  const queryCandidato = await sql.query`SELECT cpf FROM CANDIDATO WHERE cpf=${cpf}`;
  console.log(queryCandidato)
  if (queryCandidato.rowsAffected[0] == 0){
    return false
  }
  
  return true
}

async function verificaCandidaturaExiste(sql, cpfCandidato, idVaga) {
	const queryCandidatura = await sql.query`SELECT 1
                                			       FROM deseja
										                        WHERE cpfCandidato = ${cpfCandidato}
										                          AND idVaga = ${idVaga}`;
	if (queryCandidatura.rowsAffected[0] == 0)
		return false;
  
	return true;
}

async function verificaEmpresaExiste(sql, cnpj) {
  const queryEmpresa = await sql.query`SELECT cnpj FROM EMPRESA WHERE cnpj=${cnpj}`;
  console.log(queryEmpresa)
  if (queryEmpresa.rowsAffected[0] == 0){
    return false
  }
  
  return true
}

module.exports = {
  getIdLocalizacao,
  getIdInstituicao,
  getIdCurso,
  verificaCadidatoExiste,
  verificaEmpresaExiste
};
