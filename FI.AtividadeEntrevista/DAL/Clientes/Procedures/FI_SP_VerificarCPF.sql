CREATE PROC FI_SP_VerificarCPFCliente
    @CPF VARCHAR(14)
AS
BEGIN
    -- Seleciona o ID do cliente onde o CPF corresponde ao fornecido
    SELECT ID
    FROM CLIENTES
    WHERE CPF = @CPF
END
