﻿CREATE PROC FI_SP_VerificarCPF
    @CPF VARCHAR(14)
AS
BEGIN    
    SELECT ID
    FROM BENEFICIARIOS
    WHERE CPF = @CPF
END
