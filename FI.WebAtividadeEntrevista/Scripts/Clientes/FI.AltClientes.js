$(document).ready(function () {
    if (obj) {
        
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
            data: {
                "Nome": $(this).find("#Nome").val(),
                "Sobrenome": $(this).find("#Sobrenome").val(),
                "CPF": $(this).find("#CPF").val(),
                "Nacionalidade": $(this).find("#Nacionalidade").val(),
                "CEP": $(this).find("#CEP").val(),
                "Estado": $(this).find("#Estado").val(),
                "Cidade": $(this).find("#Cidade").val(),
                "Logradouro": $(this).find("#Logradouro").val(),
                "Email": $(this).find("#Email").val(),
                "Telefone": $(this).find("#Telefone").val(),
                "Beneficiarios": beneficiarios
            },
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (r) {
                if (r.sucesso) {
                    ModalDialog("Sucesso!", r.mensagem);
                    $("#formCadastro")[0].reset();
                    window.location.href = urlRetorno;
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
