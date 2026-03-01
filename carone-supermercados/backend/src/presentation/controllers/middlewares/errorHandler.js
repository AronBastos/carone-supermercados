/**
 * MIDDLEWARE DE TRATAMENTO DE ERROS
 * 
 * Função: Captura e formata todos os erros da aplicação
 * 
 * Tipos de erro tratados:
 * - Erros de domínio (regras de negócio)
 * - Erros de validação
 * - Erros de autenticação
 * - Erros internos do servidor
 */

class ErrorHandler {
    /**
     * Middleware principal de erro
     * Deve ser o último middleware a ser registrado
     */
    static handle(err, req, res, next) {
        // Log do erro (em produção, usar serviço como Sentry)
        console.error('❌ Erro:', {
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });

        // Determinar tipo de erro e responder apropriadamente
        if (err.name === 'ValidationError' || err.message.includes('validação')) {
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: err.message,
                type: 'ValidationError'
            });
        }

        if (err.message.includes('Produto') || err.message.includes('produto')) {
            return res.status(400).json({
                success: false,
                error: 'Erro de negócio',
                details: err.message,
                type: 'DomainError'
            });
        }

        if (err.message.includes('não encontrado')) {
            return res.status(404).json({
                success: false,
                error: 'Recurso não encontrado',
                details: err.message,
                type: 'NotFoundError'
            });
        }

        if (err.name === 'UnauthorizedError' || err.message.includes('autorizado')) {
            return res.status(401).json({
                success: false,
                error: 'Não autorizado',
                details: err.message,
                type: 'UnauthorizedError'
            });
        }

        // Erro interno padrão
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined,
            type: 'InternalServerError'
        });
    }

    /**
     * Middleware para rotas não encontradas (404)
     */
    static notFound(req, res) {
        res.status(404).json({
            success: false,
            error: 'Rota não encontrada',
            path: req.path,
            method: req.method
        });
    }

    /**
     * Middleware para erros de validação assíncrona
     */
    static async handleAsync(fn) {
        return (req, res, next) => {
            fn(req, res, next).catch(next);
        };
    }
}

module.exports = ErrorHandler;