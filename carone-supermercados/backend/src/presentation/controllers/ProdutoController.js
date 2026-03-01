/**
 * CONTROLADOR DE PRODUTOS
 * 
 * Função: Recebe requisições HTTP e coordena respostas
 * Localização: Camada de Apresentação
 * 
 * Responsabilidades:
 * - Extrair dados da requisição
 * - Chamar casos de uso apropriados
 * - Formatar respostas
 * - Tratar erros
 */

class ProdutoController {
    constructor(criarProdutoUseCase, listarProdutosUseCase, 
                atualizarProdutoUseCase, deletarProdutoUseCase) {
        // Injeção das dependências
        this.criarProdutoUseCase = criarProdutoUseCase;
        this.listarProdutosUseCase = listarProdutosUseCase;
        this.atualizarProdutoUseCase = atualizarProdutoUseCase;
        this.deletarProdutoUseCase = deletarProdutoUseCase;
    }

    /**
     * POST /api/produtos
     * Cria um novo produto
     */
    async criar(req, res, next) {
        try {
            // Extrair dados do corpo da requisição
            const produtoData = {
                nome: req.body.nome,
                codigoBarras: req.body.codigoBarras,
                categoriaId: req.body.categoriaId,
                precoCusto: req.body.precoCusto,
                precoVenda: req.body.precoVenda,
                quantidadeEstoque: req.body.quantidadeEstoque,
                quantidadeMinima: req.body.quantidadeMinima
            };

            // Executar caso de uso
            const resultado = await this.criarProdutoUseCase.execute(produtoData);

            // Retornar resposta
            res.status(201).json({
                success: true,
                data: resultado,
                message: 'Produto criado com sucesso'
            });

        } catch (error) {
            // Passar erro para o middleware de erro
            next(error);
        }
    }

    /**
     * GET /api/produtos
     * Lista todos os produtos
     */
    async listar(req, res, next) {
        try {
            // Extrair filtros da query string
            const filtros = {
                categoriaId: req.query.categoriaId,
                estoqueBaixo: req.query.estoqueBaixo === 'true'
            };

            // Executar caso de uso
            const produtos = await this.listarProdutosUseCase.execute(filtros);

            // Retornar resposta
            res.json({
                success: true,
                data: produtos,
                total: produtos.length
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/produtos/:id
     * Busca produto por ID
     */
    async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;
            
            // Aqui você implementaria um caso de uso específico
            // Por enquanto, vamos usar o listar com filtro
            const produtos = await this.listarProdutosUseCase.execute({ id });
            
            if (produtos.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Produto não encontrado'
                });
            }

            res.json({
                success: true,
                data: produtos[0]
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/produtos/:id
     * Atualiza um produto
     */
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;
            const dadosAtualizacao = {
                nome: req.body.nome,
                precoVenda: req.body.precoVenda,
                quantidadeEstoque: req.body.quantidadeEstoque
            };

            const resultado = await this.atualizarProdutoUseCase.execute(id, dadosAtualizacao);

            res.json({
                success: true,
                data: resultado,
                message: 'Produto atualizado com sucesso'
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/produtos/:id
     * Deleta (desativa) um produto
     */
    async deletar(req, res, next) {
        try {
            const { id } = req.params;

            const resultado = await this.deletarProdutoUseCase.execute(id);

            res.json({
                success: true,
                message: resultado.message,
                data: { id: resultado.id }
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProdutoController;