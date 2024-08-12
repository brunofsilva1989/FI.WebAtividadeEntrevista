let beneficiarios = [];

$(document).ready(function () {
    
    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        let cpf = $('#formCadastro').find("#CPF").val();

        if (!validarCPF(cpf)) {
            ModalDialog("Ocorreu um erro", "CPF inválido.");
            return;
        }
        
        $('#Beneficiarios').val(JSON.stringify(beneficiarios));

        console.log($('#Beneficiarios').val());
        
        $.ajax({
            url: urlPost, 
            method: "POST",
            data: JSON.stringify({
                "Nome": $('#formCadastro').find("#Nome").val(),
                "Sobrenome": $('#formCadastro').find("#Sobrenome").val(),
                "CPF": cpf,
                "Nacionalidade": $('#formCadastro').find("#Nacionalidade").val(),
                "CEP": $('#formCadastro').find("#CEP").val(),
                "Estado": $('#formCadastro').find("#Estado").val(),
                "Cidade": $('#formCadastro').find("#Cidade").val(),
                "Logradouro": $('#formCadastro').find("#Logradouro").val(),
                "Email": $('#formCadastro').find("#Email").val(),
                "Telefone": $('#formCadastro').find("#Telefone").val(),
                "Beneficiarios": beneficiarios
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (r) {
                if (r.sucesso) {
                    ModalDialog("Sucesso!", r.mensagem);
                    $("#formCadastro")[0].reset();
                    beneficiarios = [];
                    atualizarTabelaBeneficiarios();
                } else {
                    ModalDialog("Erro", r.mensagem);
                }
            },
            error: function (r) {
                if (r.status == 400) {
                    ModalDialog("Erro", r.responseJSON.mensagem || "Erro desconhecido.");
                } else if (r.status == 500) {
                    ModalDialog("Erro", "Ocorreu um erro interno no servidor.");
                }
            }
        });
    });

    $('#btnIncluir').click(function () {
        $('#formBeneficiario').submit();
    });

    $('#formBeneficiario').submit(function (e) {
        e.preventDefault();

        let cpf = $(this).find("#CPF").val();
        let nome = $(this).find("#Nome").val();

        if (!validarCPF(cpf)) {
            ModalDialog("Ocorreu um erro", "CPF inválido.");
            return;
        }

        beneficiarios.push({ CPF: cpf, Nome: nome });

        atualizarTabelaBeneficiarios();

        $("#formBeneficiario")[0].reset();
    });
});

function atualizarTabelaBeneficiarios() {
    let tabela = $("#tabelaBeneficiarios tbody");
    tabela.empty();

    beneficiarios.forEach((beneficiario, index) => {
        tabela.append(`
            <tr>
            <td>${beneficiario.CPF}</td>
            <td>${beneficiario.Nome}</td>
            <td style="text-align: right;">
                <button class="btn btn-primary btn-sm float-end" onclick="excluirBeneficiario(${index})" style="float: right;">Excluir</button>
                <button class="btn btn-primary btn-sm me-2" onclick="editarBeneficiario(${index})" style="margin-right: 5px; float: right;">Alterar</button>
            </td>
        </tr>
        `);
    });
}

function editarBeneficiario(index) {
    let beneficiario = beneficiarios[index];
    $('#CPF').val(beneficiario.CPF);
    $('#Nome').val(beneficiario.Nome);

    excluirBeneficiario(index);
}

function excluirBeneficiario(index) {
    beneficiarios.splice(index, 1);
    atualizarTabelaBeneficiarios();
}

function ModalDialog(titulo, texto) {
    var random = Math.random().toString().replace('.', '');
    var texto = `<div id="${random}" class="modal fade">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                                <h4 class="modal-title">${titulo}</h4>
                            </div>
                            <div class="modal-body">
                                <p>${texto}</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>
                            </div>
                        </div>
                    </div>
                 </div>`;
    $('body').append(texto);
    $('#' + random).modal('show');
}

/**
 * Valida um número de CPF.
 *
 * @param {string} cpf - O CPF que será validado.
 * @returns {boolean} Retorna `true` se o CPF for válido, caso contrário, `false`.
 */
function validarCPF(cpf) {
    
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    const calcularDigito = (base, peso) => {
        const soma = base.split('').reduce((acc, num, i) => acc + parseInt(num) * (peso - i), 0);
        const resto = (soma * 10) % 11;
        return resto === 10 || resto === 11 ? 0 : resto;
    };
    
    const digito1 = calcularDigito(cpf.substring(0, 9), 10);
    const digito2 = calcularDigito(cpf.substring(0, 10), 11);

    
    return digito1 === parseInt(cpf[9]) && digito2 === parseInt(cpf[10]);
}

