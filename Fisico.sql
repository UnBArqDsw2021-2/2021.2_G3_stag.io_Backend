-- -------- <<  Stag.io >> ----------
--
--                    SCRIPT DE CRIACAO (DDL)
--
-- Data Criacao ...........: 07/04/2022
-- Autor(es) ..............: Italo Guimaraes e Alvaro Guimaraes
-- Banco de Dados .........: SQL Server
-- Base de Dados (nome) ...: stagio
--
-- Ultimas Alteracoes
--   07/04/2021 => Criacao das tabelas
--   09/04/2021 => Alteração das tabelas
--   14/04/2021 => Correção das tabelas
--
-- PROJETO => 01 Base de Dados
--         => 8 tabelas
--
-- ---------------------------------------------------------

USE stagio;

CREATE TABLE LOCALIZACAO (
	idLocalizacao INT NOT NULL IDENTITY(1,1),
	cidade VARCHAR(50) NOT NULL,
	uf CHAR(2) NOT NULL,
	CONSTRAINT LOCALIZACAO_PK PRIMARY KEY (idLocalizacao)
);

CREATE TABLE ESCOLARIDADE (
	idEscolaridade INT NOT NULL IDENTITY(1,1),
	nomeEscolaridade VARCHAR(100) NOT NULL,
	CONSTRAINT ESCOLARIDADE_PK PRIMARY KEY (idEscolaridade)
);

CREATE TABLE INSTITUICAO (
	idInstituicao INT  NOT NULL IDENTITY(1,1),
	nomeInstituicao VARCHAR(100) NOT NULL,
	idEscolaridade INT NOT NULL,
	CONSTRAINT INSTITUICAO_PK PRIMARY KEY (idInstituicao),
	CONSTRAINT INSTITUICAO_ESCOLARIDADE_FK FOREIGN KEY (idEscolaridade) REFERENCES ESCOLARIDADE(idEscolaridade)
);

CREATE TABLE CURSO (
	idCurso INT NOT NULL IDENTITY(1,1),
	nomeCurso VARCHAR(100) NOT NULL,
	idEscolaridade INT NOT NULL,
	CONSTRAINT CURSO_PK PRIMARY KEY (idCurso),
	CONSTRAINT CURSO_ESCOLARIDADE_FK FOREIGN KEY (idEscolaridade) REFERENCES ESCOLARIDADE(idEscolaridade)
);

CREATE TABLE EMPRESA (
    cnpj BIGINT NOT NULL,
	senha VARCHAR(1000) NOT NULL, -- Incremento
    nomeEmpresa VARCHAR(100) NOT NULL,
    siteEmpresa VARCHAR(50) NOT NULL,
    descricaoEmpresa VARCHAR(500) NOT NULL,
	idLocalizacao INT NOT NULL,
    CONSTRAINT ENDERECO_PK PRIMARY KEY (cnpj),
	CONSTRAINT EMPRESA_ENDERECO_FK FOREIGN KEY (idLocalizacao) REFERENCES LOCALIZACAO(idLocalizacao)
);

CREATE TABLE CANDIDATO (
	cpf BIGINT NOT NULL,
	senha VARCHAR(1000) NOT NULL, -- Incremento
	nomeCompleto VARCHAR(100),
	email VARCHAR(100),
	descricaoCandidato VARCHAR(500),
	curriculo VARBINARY(MAX),
	idEscolaridade INT NOT NULL,
	idInstituicao INT,
	idCurso INT,
	idLocalizacao INT NOT NULL,
	areasInteresse VARCHAR(500) NOT NULL,
	CONSTRAINT CPF_PK PRIMARY KEY (cpf),
	CONSTRAINT CANDIDATO_ESCOLARIDADE_FK FOREIGN KEY (idEscolaridade) REFERENCES ESCOLARIDADE(idEscolaridade),
	CONSTRAINT CANDIDATO_INSTITUICAO_FK FOREIGN KEY (idInstituicao) REFERENCES INSTITUICAO(idInstituicao),
	CONSTRAINT CANDIDATO_CURSO_FK FOREIGN KEY (idCurso) REFERENCES CURSO(idCurso),
	CONSTRAINT CANDIDATO_LOCALIZACAO_FK FOREIGN KEY (idLocalizacao) REFERENCES LOCALIZACAO(idLocalizacao),
);

CREATE TABLE VAGA (
	idVaga INT NOT NULL IDENTITY(1,1),
	tituloVaga VARCHAR(50) NOT NULL,
	descricaoVaga VARCHAR(2000) NOT NULL,
	modeloTrabalho CHAR(1) NOT NULL,
	cargaHoraria INT NOT NULL,
	requisitos VARCHAR(1000) NOT NULL,
	privilegios VARCHAR(1000) NOT NULL,
	tags VARCHAR(1000) NOT NULL, -- Incremento
	bolsa MONEY NOT NULL,
	status BIT NOT NULL,
	cnpjEmpresa BIGINT NOT NULL,
	idLocalizacao INT NOT NULL,
	idEscolaridade INT NOT NULL,
	CONSTRAINT VAGA_PK PRIMARY KEY (idVaga),
	CONSTRAINT VAGA_ESCOLARIDADE_FK FOREIGN KEY (idEscolaridade) REFERENCES ESCOLARIDADE(idEscolaridade),
	CONSTRAINT VAGA_EMPRESA_FK FOREIGN KEY (cnpjEmpresa) REFERENCES EMPRESA(cnpj),
	CONSTRAINT VAGA_LOCALIZACAO_FK FOREIGN KEY (idLocalizacao) REFERENCES LOCALIZACAO(idLocalizacao),
);

CREATE TABLE deseja (
	cpfCandidato BIGINT NOT NULL,
	idVaga INT NOT NULL,
	dataInicioDeseja DATE NOT NULL,
	dataFimDeseja DATE NOT NULL,
	CONSTRAINT deseja_CANDIDATO_FK FOREIGN KEY (cpfCandidato) REFERENCES CANDIDATO(cpf),
	CONSTRAINT deseja_VAGA_FK FOREIGN KEY (idVaga) REFERENCES VAGA(idVaga)
);

INSERT INTO [dbo].[ESCOLARIDADE]
           ([nomeEscolaridade])
     VALUES
           ('Ensino médio'),
		   ('Ensino Superior'),
		   ('Técnico')