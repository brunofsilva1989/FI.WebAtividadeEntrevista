using FI.AtividadeEntrevista.DML;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace FI.AtividadeEntrevista.DAL
{
    /// <summary>
    /// Classe de acesso a dados do Beneficiario
    /// </summary>
    internal class DaoBeneficiario : AcessoDados
    {
        /// <summary>
        /// Inclui um novo cliente
        /// </summary>
        /// <param name="cliente">Objeto de cliente</param>
        internal long IncluirBeneficiario(DML.Beneficiario beneficario)
        {
            
            List<System.Data.SqlClient.SqlParameter> parametros = new List<System.Data.SqlClient.SqlParameter>();

            parametros.Add(new System.Data.SqlClient.SqlParameter("@CPF", beneficario.CPF));
            parametros.Add(new System.Data.SqlClient.SqlParameter("@Nome", beneficario.Nome));
            parametros.Add(new System.Data.SqlClient.SqlParameter("@IdCliente", beneficario.IdCliente));
            

            DataSet ds = base.Consultar("FI_SP_IncBeneficiarioV1", parametros);
            long ret = 0;
            if (ds.Tables[0].Rows.Count > 0)
                long.TryParse(ds.Tables[0].Rows[0][0].ToString(), out ret);
            return ret;
        }

        
        /// <summary>
        /// Inclui um novo cliente
        /// </summary>
        /// <param name="cliente">Objeto de Beneficiario</param>
        internal DML.Beneficiario ConsultarBeneficiario(long Id)
        {
            List<System.Data.SqlClient.SqlParameter> parametros = new List<System.Data.SqlClient.SqlParameter>();

            parametros.Add(new System.Data.SqlClient.SqlParameter("Id", Id));

            DataSet ds = base.Consultar("FI_SP_ConsBeneficiario", parametros);
            List<DML.Beneficiario> bene = ConverterBeneficiario(ds);

            return bene.FirstOrDefault();
        }

        internal bool VerificarExistencia(string CPF)
        {
            List<System.Data.SqlClient.SqlParameter> parametros = new List<System.Data.SqlClient.SqlParameter>();

            parametros.Add(new System.Data.SqlClient.SqlParameter("CPF", CPF));

            DataSet ds = base.Consultar("FI_SP_VerificarCPFBeneficiario", parametros);

            return ds.Tables[0].Rows.Count > 0;
        }

        internal List<Beneficiario> PesquisaBeneficiario(int iniciarEm, int quantidade, string campoOrdenacao, bool crescente, out int qtd)
        {
            List<System.Data.SqlClient.SqlParameter> parametros = new List<System.Data.SqlClient.SqlParameter>();

            parametros.Add(new System.Data.SqlClient.SqlParameter("iniciarEm", iniciarEm));
            parametros.Add(new System.Data.SqlClient.SqlParameter("quantidade", quantidade));
            parametros.Add(new System.Data.SqlClient.SqlParameter("campoOrdenacao", campoOrdenacao));
            parametros.Add(new System.Data.SqlClient.SqlParameter("crescente", crescente));

            DataSet ds = base.Consultar("FI_SP_PesqBeneficiario", parametros);
            List<DML.Beneficiario> cli = ConverterBeneficiario(ds);

            int iQtd = 0;

            if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                int.TryParse(ds.Tables[1].Rows[0][0].ToString(), out iQtd);

            qtd = iQtd;

            return cli;
        }

        /// <summary>
        /// Lista todos os clientes
        /// </summary>
        internal List<DML.Beneficiario> ListarBeneficiario()
        {
            List<System.Data.SqlClient.SqlParameter> parametros = new List<System.Data.SqlClient.SqlParameter>();

            parametros.Add(new System.Data.SqlClient.SqlParameter("Id", 0));

            DataSet ds = base.Consultar("FI_SP_ConsBeneficiario", parametros);
            List<DML.Beneficiario> bene = ConverterBeneficiario(ds);

            return bene;
        }

        /// <summary>
        /// Inclui um novo cliente
        /// </summary>
        /// <param name="cliente">Objeto de cliente</param>
        internal void AlterarBeneficiario(DML.Beneficiario beneficiario)
        {
            List<System.Data.SqlClient.SqlParameter> parametros = new List<System.Data.SqlClient.SqlParameter>();

            parametros.Add(new System.Data.SqlClient.SqlParameter("@CPF", beneficiario.CPF));
            parametros.Add(new System.Data.SqlClient.SqlParameter("@Nome", beneficiario.Nome));
            parametros.Add(new System.Data.SqlClient.SqlParameter("@Id", beneficiario.Id));                        

            base.Executar("FI_SP_AltBeneficiario", parametros);
        }


        /// <summary>
        /// Excluir Beneficiario
        /// </summary>
        /// <param name="beneficiario">Objeto de cliente</param>
        internal void ExcluirBeneficiario(long Id)
        {
            List<System.Data.SqlClient.SqlParameter> parametros = new List<System.Data.SqlClient.SqlParameter>();

            parametros.Add(new System.Data.SqlClient.SqlParameter("Id", Id));

            base.Executar("FI_SP_DelBeneficiario", parametros);
        }

        private List<DML.Beneficiario> ConverterBeneficiario(DataSet ds)
        {
            List<DML.Beneficiario> lista = new List<DML.Beneficiario>();
            if (ds != null && ds.Tables != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow row in ds.Tables[0].Rows)
                {
                    DML.Beneficiario bene = new DML.Beneficiario();
                    bene.Id = row.Field<long>("Id");
                    bene.CPF = row.Field<string>("CPF");
                    bene.Nome = row.Field<string>("Nome");
                    bene.IdCliente = row.Field<int>("IdCliente");                    
                    lista.Add(bene);
                }
            }

            return lista;
        }

        public bool ValidaCpfExiste(string cpf)
        {
            List<System.Data.SqlClient.SqlParameter> parametros = new List<System.Data.SqlClient.SqlParameter>();
            parametros.Add(new System.Data.SqlClient.SqlParameter("@CPF", cpf));

            DataSet ds = base.Consultar("FI_SP_VerificarCPFBeneficiario", parametros);

            // Verifica se existe algum registro com o CPF informado
            return ds.Tables[0].Rows.Count > 0;
        }

        public bool ValidarCPF(string cpf)
        {
            cpf = cpf.Replace(".", "").Replace("-", "");

            if (cpf.Length != 11 || new string(cpf[0], 11) == cpf)
                return false;

            int[] multiplicadores = { 10, 9, 8, 7, 6, 5, 4, 3, 2, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 };

            string tempCpf = cpf.Substring(0, 9);
            tempCpf += CalcularDigito(tempCpf, multiplicadores, 9);
            tempCpf += CalcularDigito(tempCpf, multiplicadores, 10);

            return cpf == tempCpf;
        }

        private string CalcularDigito(string cpf, int[] multiplicadores, int length)
        {
            int soma = 0;
            for (int i = 0; i < length; i++)
                soma += int.Parse(cpf[i].ToString()) * multiplicadores[i];

            int resto = soma % 11;
            return (resto < 2 ? 0 : 11 - resto).ToString();
        }


    }
}
