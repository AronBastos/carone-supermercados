/**
 * ROTAS DE PRODUTOS
 * 
 * Função: Define os endpoints relacionados a produtos
 * 
 * Endpoints:
 * POST   /api/produtos     - Criar produto
 * GET    /api/produtos     - Listar produtos
 * GET    /api/produtos/:id - Buscar produto por ID
 * PUT    /api/produtos/:id - Atualizar produto
 * DELETE /api/produtos/:id - Deletar produto
 */

const express = require('express');
const ValidationMiddleware = require('../middlewares/validation');

module.exports = (produtoController) => {
    const router = express.Router();

    /**
     * @route POST /api/produtos
     * @desc  Cria um novo produto
     * @body  { nome, codigoBarras, categoriaId, precoCusto, precoVenda, quantidadeEstoque }
     */
    router.post(
        '/',
        ValidationMiddleware.criarProduto(),
        (req, res, next) => produtoController.criar(req, res, next)
    );

    /**
     * @route GET /api/produtos
     * @desc  Lista todos os produtos (com filtros opcionais)
     * @query { categoriaId, estoqueBaixo, page, limit }
     */
    router.get(
        '/',
        ValidationMiddleware.listarProdutos(),
        (req, res, next) => produtoController.listar(req, res, next)
    );

    /**
     * @route GET /api/produtos/:id
     * @desc  Busca um produto por ID
     */
    router.get(
        '/:id',
        ValidationMiddleware.validarId(),
        (req, res, next) => produtoController.buscarPorId(req, res, next)
    );

    /**
     * @route PUT /api/produtos/:id
     * @desc  Atualiza um produto existente
     */
    router.put(
        '/:id',
        ValidationMiddleware.atualizarProduto(),
        (req, res, next) => produtoController.atualizar(req, res, next)
    );

    /**
     * @route DELETE /api/produtos/:id
     * @desc  Remove (desativa) um produto
     */
    router.delete(
        '/:id',
        ValidationMiddleware.validarId(),
        (req, res, next) => produtoController.deletar(req, res, next)
    );

    return router;
};