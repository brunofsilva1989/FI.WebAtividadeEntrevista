﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WebAtividadeEntrevista.Models
{
    /// <summary>
    /// Classe de Modelo do Beneficiario
    /// </summary>
    public class BeneficiarioModel
    {
        public long Id { get; set; }
               
        /// <summary>
        /// CPF
        /// </summary>
        [Required]
        [MaxLength(14)]
        public string CPF { get; set; }

        
        /// <summary>
        /// Nome
        /// </summary>
        [Required]
        public string Nome { get; set; }

      
        /// <summary>
        /// Id do Cliente
        /// </summary>
        public long IdCliente { get; set; }

    }    
}