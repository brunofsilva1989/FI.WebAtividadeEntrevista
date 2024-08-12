
$(document).ready(function () {
    console.log('Forms.cshtml carregado');

    $('#btnIncluir').click(function () {
        // Intercepta a submissão do formulário de beneficiário
        $('#formBeneficiario').submit();
    });

    $('#formBeneficiario').submit(function (e) {
        console.log("Submissão interceptada"); // Adicione este log
        e.preventDefault();

        let cpf = $(this).find("#CPF").val();
        let nome = $(this).find("#Nome").val();

        console.log(`CPF: ${cpf}, Nome: ${nome}`);

        if (!validarCPF(cpf)) {
            ModalDialog("Ocorreu um erro", "CPF inválido.");
            return;
        }

        console.log("CPF válido, prosseguindo com a inclusão");

        // Verifica se o CPF já existe na lista de beneficiários
        if (beneficiarios.some(b => b.CPF === cpf)) {
            ModalDialog("Ocorreu um erro", "Este CPF já foi adicionado para outro beneficiário.");
            return;
        }

        // Adiciona o beneficiário à lista de beneficiários temporários
        beneficiarios.push({ CPF: cpf, Nome: nome });

        // Atualiza a tabela de beneficiários no modal
        atualizarTabelaBeneficiarios();

        // Limpa o formulário do modal
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
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editarBeneficiario(${index})">Alterar</button>
                    <button class="btn btn-primary btn-sm" onclick="excluirBeneficiario(${index})">Excluir</button>
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
    const regexFormato = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!regexFormato.test(cpf)) return false;

    const cpfNumeros = cpf.replace(/[.\-]/g, '');

    if (/^(\d)\1+$/.test(cpfNumeros)) return false;

    const calcularDigito = (base, peso) => {
        const soma = base.split('').reduce((acc, num, i) => acc + parseInt(num) * (peso - i), 0);
        const resto = (soma * 10) % 11;
        return resto === 10 || resto === 11 ? 0 : resto;
    };

    const digito1 = calcularDigito(cpfNumeros.substring(0, 9), 10);
    const digito2 = calcularDigito(cpfNumeros.substring(0, 10), 11);

    return digito1 === parseInt(cpfNumeros[9]) && digito2 === parseInt(cpfNumeros[10]);
}
