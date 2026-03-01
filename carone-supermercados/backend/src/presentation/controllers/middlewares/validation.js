/**
 * MIDDLEWARE DE VALIDAÇÃO
 * 
 * Função: Valida dados de entrada antes de chegar aos controllers
 * Biblioteca: express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

class ValidationMiddleware {
    /**
     * Valida criação de produto
     */
    static criarProduto() {
        return [
            body('nome')
                .notEmpty().withMessage('Nome é obrigatório')
                .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres')
                .trim()
                .escape(),
            
            body('codigoBarras')
                .notEmpty().withMessage('Código de barras é obrigatório')
                .matches(/^\d+$/).withMessage('Código de barras deve conter apenas números')
                .isLength({ min: 8, max: 14 }).withMessage('Código de barras deve ter entre 8 e 14 dígitos'),
            
            body('precoCusto')
                .notEmpty().withMessage('Preço de custo é obrigatório')
                .isFloat({ min: 0.01 }).withMessage('Preço de custo deve ser maior que zero'),
            
            body('precoVenda')
                .notEmpty().withMessage('Preço de venda é obrigatório')
                .isFloat({ min: 0.01 }).withMessage('Preço de venda deve ser maior que zero')
                .custom((value, { req }) => {
                    if (value <= req.body.precoCusto) {
                        throw new Error('Preço de venda deve ser maior que preço de custo');
                    }
                    return true;
                }),
            
            body('quantidadeEstoque')
                .notEmpty().withMessage('Quantidade em estoque é obrigatória')
                .isInt({ min: 0 }).withMessage('Quantidade deve ser um número inteiro não negativo'),
            
            body('quantidadeMinima')
                .optional()
                .isInt({ min: 0 }).withMessage('Quantidade mínima deve ser um número inteiro não negativo'),

            this._handleValidationResult
        ];
    }

    /**
     * Valida atualização de produto
     */
    static atualizarProduto() {
        return [
            param('id')
                .isInt().withMessage('ID deve ser um número inteiro'),
            
            body('nome')
                .optional()
                .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres')
                .trim()
                .escape(),
            
            body('precoVenda')
                .optional()
                .isFloat({ min: 0.01 }).withMessage('Preço de venda deve ser maior que zero'),
            
            body('quantidadeEstoque')
                .optional()
                .isInt({ min: 0 }).withMessage('Quantidade deve ser um número inteiro não negativo'),

            this._handleValidationResult
        ];
    }

    /**
     * Valida parâmetros de listagem
     */
    static listarProdutos() {
        return [
            query('categoriaId')
                .optional()
                .isInt().withMessage('categoriaId deve ser um número inteiro'),
            
            query('estoqueBaixo')
                .optional()
                .isBoolean().withMessage('estoqueBaixo deve ser true ou false'),

            query('page')
                .optional()
                .isInt({ min: 1 }).withMessage('page deve ser um número inteiro positivo'),
            
            query('limit')
                .optional()
                .isInt({ min: 1, max: 100 }).withMessage('limit deve ser entre 1 e 100'),

            this._handleValidationResult
        ];
    }

    /**
     * Valida ID em parâmetros
     */
    static validarId() {
        return [
            param('id')
                .isInt().withMessage('ID deve ser um número inteiro'),
            
            this._handleValidationResult
        ];
    }

    /**
     * Processa resultado da validação
     * @private
     */
    static _handleValidationResult(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Erro de validação',
                details: errors.array().map(e => ({
                    campo: e.path,
                    mensagem: e.msg
                }))
            });
        }
        next();
    }
}

module.exports = ValidationMiddleware;