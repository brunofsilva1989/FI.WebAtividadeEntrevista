$(document).ready(function () {
    if (obj) {
        console.log("Carregando dados do cliente para alteração.");

        $('#formCadastro #Nome').val(obj.Nome);
        $('#formCadastro #Sobrenome').val(obj.Sobrenome);
        $('#formCadastro #CPF').val(obj.CPF);
        $('#formCadastro #Nacionalidade').val(obj.Nacionalidade);
        $('#formCadastro #CEP').val(obj.CEP);
        $('#formCadastro #Estado').val(obj.Estado);
        $('#formCadastro #Cidade').val(obj.Cidade);
        $('#formCadastro #Logradouro').val(obj.Logradouro);
        $('#formCadastro #Email').val(obj.Email);
        $('#formCadastro #Telefone').val(obj.Telefone);

        if (obj.Beneficiarios && obj.Beneficiarios.length > 0) {
            obj.Beneficiarios.forEach((beneficiario, index) => {
                adicionarBeneficiarioNaTabela(beneficiario, index);
            });
        }
    }

    $('#formCadastro').submit(function (e) {
        e.preventDefault();

        console.log("Iniciando submissão do formulário de alteração.");

        if ($('#tabelaBeneficiarios tbody tr').length === 0 && !$('#formCadastro #Id').val()) {
            ModalDialog("Erro", "Nenhum beneficiário foi informado.");
            return;
        }

        let beneficiarios = [];
        $('#tabelaBeneficiarios tbody tr').each(function () {
            let cpf = $(this).find('td:eq(0)').text();
            let nome = $(this).find('td:eq(1)').text();
            beneficiarios.push({ CPF: cpf, Nome: nome });
        });

        $.ajax({
            url: urlPost,
            method: "POST",
            data: JSON.stringify({
                "Id": $('#formCadastro').find("#Id").val(),
                "Nome": $('#formCadastro').find("#Nome").val(),
                "Sobrenome": $('#formCadastro').find("#Sobrenome").val(),
                "CPF": $('#formCadastro').find("#CPF").val(),
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
                console.log("Resposta do servidor recebida:", r);

                if (r.sucesso) {
                    ModalDialog("Sucesso!", r.mensagem);
                    $("#formCadastro")[0].reset();
                    beneficiarios = [];
                    atualizarTabelaBeneficiarios();
                } else {
                    ModalDialog("Erro", r.mensagem || "Erro ao processar o cadastro.");
                }
            },

            error: function (r) {
                console.error("Erro ao enviar os dados:", r);

                if (r.status == 400) {
                    ModalDialog("Erro", r.responseJSON.mensagem || "Erro desconhecido.");
                } else if (r.status == 500) {
                    ModalDialog("Erro", "Ocorreu um erro interno no servidor.");
                }
            }
        });
    });

    function adicionarBeneficiarioNaTabela(beneficiario, index) {
        $('#tabelaBeneficiarios tbody').append(`
            <tr>
                <td>${beneficiario.CPF}</td>
                <td>${beneficiario.Nome}</td>
                <td style="text-align: right;">
                    <button class="btn btn-primary btn-sm float-end" onclick="excluirBeneficiario(${index})">Excluir</button>
                    <button class="btn btn-primary btn-sm me-2" onclick="editarBeneficiario(${index})" style="margin-right: 5px; float: right;">Alterar</button>
                </td>
            </tr>
        `);
    }

    function excluirBeneficiario(index) {
        $('#tabelaBeneficiarios tbody tr').eq(index).remove();
    }

    function editarBeneficiario(index) {
        let beneficiario = beneficiarios[index];
        $('#CPF').val(beneficiario.CPF);
        $('#Nome').val(beneficiario.Nome);

        excluirBeneficiario(index);
    }

    function ModalDialog(titulo, texto) {
        var random = Math.random().toString().replace('.', '');
        var texto = '<div id="' + random + '" class="modal fade">                                                               ' +
            '        <div class="modal-dialog">                                                                                 ' +
            '            <div class="modal-content">                                                                            ' +
            '                <div class="modal-header">                                                                         ' +
            '                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>         ' +
            '                    <h4 class="modal-title">' + titulo + '</h4>                                                    ' +
            '                </div>                                                                                             ' +
            '                <div class="modal-body">                                                                           ' +
            '                    <p>' + texto + '</p>                                                                           ' +
            '                </div>                                                                                             ' +
            '                <div class="modal-footer">                                                                         ' +
            '                    <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>             ' +
            '                                                                                                                   ' +
            '                </div>                                                                                             ' +
            '            </div><!-- /.modal-content -->                                                                         ' +
            '  </div><!-- /.modal-dialog -->                                                                                    ' +
            '</div> <!-- /.modal -->                                                                                        ';

        $('body').append(texto);
        $('#' + random).modal('show');
    }
});
