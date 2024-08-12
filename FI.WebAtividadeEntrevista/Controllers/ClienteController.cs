using FI.AtividadeEntrevista.BLL;
using WebAtividadeEntrevista.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using FI.AtividadeEntrevista.DML;
using FI.AtividadeEntrevista.DAL;
using System.Data;
using WebGrease.ImageAssemble;

namespace WebAtividadeEntrevista.Controllers
{
    public class ClienteController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Incluir()
        {
            return View();
        }

        /// <summary>
        /// Método para incluir cliente e beneficiários
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        /// <exception cref="Exception"></exception>
        [HttpPost]
        public JsonResult Incluir(ClienteModel model)
        {
            try
            {
                BoCliente bo = new BoCliente();

                if (bo.VerificarExistencia(model.CPF))
                {
                    Response.StatusCode = 400;
                    return Json(new { sucesso = false, mensagem = "CPF já cadastrado para outro cliente." });
                }

                if (!this.ModelState.IsValid)
                {
                    List<string> erros = (from item in ModelState.Values
                                          from error in item.Errors
                                          select error.ErrorMessage).ToList();

                    Response.StatusCode = 400;
                    return Json(new { sucesso = false, mensagem = string.Join(Environment.NewLine, erros) });
                }

                model.Id = bo.Incluir(new Cliente()
                {
                    Nome = model.Nome,
                    Sobrenome = model.Sobrenome,
                    CPF = model.CPF,
                    Nacionalidade = model.Nacionalidade,
                    CEP = model.CEP,
                    Estado = model.Estado,
                    Cidade = model.Cidade,
                    Logradouro = model.Logradouro,
                    Email = model.Email,
                    Telefone = model.Telefone
                });

                if (model.Beneficiarios != null && model.Beneficiarios.Count > 0)
                {
                    BoBeneficiario boBeneficiario = new BoBeneficiario();

                    foreach (var beneficiario in model.Beneficiarios)
                    {
                        if (bo.VerificarExistencia(beneficiario.CPF))
                        {
                            Response.StatusCode = 400;
                            return Json(new { sucesso = false, mensagem = "CPF já cadastrado para outro beneficiário deste cliente." });
                        }

                        boBeneficiario.Incluir(new Beneficiario()
                        {
                            CPF = beneficiario.CPF,
                            Nome = beneficiario.Nome,
                            IdCliente = model.Id
                        });
                    }
                }

                return Json(new { sucesso = true, mensagem = "Cadastro efetuado com sucesso" });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { sucesso = false, mensagem = ex.Message });
            }
        }


        /// <summary>
        /// Método que altera o cliente e seus beneficiários
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult Alterar(ClienteModel model)
        {
            if (!this.ModelState.IsValid)
            {
                List<string> erros = (from item in ModelState.Values
                                      from error in item.Errors
                                      select error.ErrorMessage).ToList();

                Response.StatusCode = 400;
                return Json(new { sucesso = false, mensagem = string.Join(Environment.NewLine, erros) });
            }

            // Verificação para garantir que haja beneficiários
            if (model.Beneficiarios == null || model.Beneficiarios.Count == 0)
            {
                Response.StatusCode = 400;
                return Json(new { sucesso = false, mensagem = "Nenhum beneficiário foi informado." });
            }

            try
            {
                // Prossiga com a alteração do cliente
                BoCliente bo = new BoCliente();
                bo.Alterar(new Cliente()
                {
                    Id = model.Id,
                    Nome = model.Nome,
                    Sobrenome = model.Sobrenome,
                    CPF = model.CPF,
                    Nacionalidade = model.Nacionalidade,
                    CEP = model.CEP,
                    Estado = model.Estado,
                    Cidade = model.Cidade,
                    Logradouro = model.Logradouro,
                    Email = model.Email,
                    Telefone = model.Telefone
                });

                BoBeneficiario boBeneficiario = new BoBeneficiario();
                foreach (var beneficiario in model.Beneficiarios)
                {
                    if (beneficiario.Id == 0)
                    {
                        // Inserir novo beneficiário
                        boBeneficiario.Incluir(new Beneficiario()
                        {
                            CPF = beneficiario.CPF,
                            Nome = beneficiario.Nome,
                            IdCliente = model.Id
                        });
                    }
                    else
                    {
                        // Alterar beneficiário existente
                        boBeneficiario.Alterar(new Beneficiario()
                        {
                            Id = beneficiario.Id,
                            CPF = beneficiario.CPF,
                            Nome = beneficiario.Nome,
                            IdCliente = model.Id
                        });
                    }
                }

                return Json(new { sucesso = true, mensagem = "Cadastro alterado com sucesso." });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { sucesso = false, mensagem = "Erro interno no servidor: " + ex.Message });
            }
        }


        /// <summary>
        /// Trás os dados para alteração
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet]
        public ActionResult Alterar(long id)
        {
            BoCliente bo = new BoCliente();
            Cliente cliente = bo.Consultar(id);
            Models.ClienteModel model = null;

            if (cliente != null)
            {
                model = new ClienteModel()
                {
                    Id = cliente.Id,
                    Nome = cliente.Nome,
                    Sobrenome = cliente.Sobrenome,
                    CPF = cliente.CPF,
                    Nacionalidade = cliente.Nacionalidade,
                    CEP = cliente.CEP,
                    Estado = cliente.Estado,
                    Cidade = cliente.Cidade,
                    Logradouro = cliente.Logradouro,
                    Email = cliente.Email,
                    Telefone = cliente.Telefone
                };

            }

            return View(model);
        }


        /// <summary>
        /// Método que exclui o cliente e seus beneficiários
        /// </summary>
        /// <param name="jtStartIndex"></param>
        /// <param name="jtPageSize"></param>
        /// <param name="jtSorting"></param>
        /// <returns></returns>
        [HttpPost]
        public JsonResult ClienteList(int jtStartIndex = 0, int jtPageSize = 0, string jtSorting = null)
        {
            try
            {
                int qtd = 0;
                string campo = string.Empty;
                string crescente = string.Empty;
                string[] array = jtSorting.Split(' ');

                if (array.Length > 0)
                    campo = array[0];

                if (array.Length > 1)
                    crescente = array[1];

                List<Cliente> clientes = new BoCliente().Pesquisa(jtStartIndex, jtPageSize, campo, crescente.Equals("ASC", StringComparison.InvariantCultureIgnoreCase), out qtd);

                //Return result to jTable
                return Json(new { Result = "OK", Records = clientes, TotalRecordCount = qtd });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }

    }
}