/**
 * CASO DE USO: LISTAR PRODUTOS
 * 
 * Função: Recupera lista de produtos com filtros opcionais
 * 
 * Padrão: Query Object
 * - Não modifica estado
 * - Retorna dados formatados
 */

class ListarProdutosUseCase {
    constructor(produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    async execute(filtros = {}) {
        try {
            // Aplicar filtros
            const produtos = await this.produtoRepository.findAll(filtros);

            // Transformar para DTO
            return produtos.map(produto => ({
                id: produto.id,
                nome: produto.nome,
                codigoBarras: produto.codigoBarras,
                precoVenda: produto.precoVenda,
                quantidadeEstoque: produto.quantidadeEstoque,
                estoqueBaixo: produto.estaComEstoqueBaixo(),
                categoriaId: produto.categoriaId
            }));

        } catch (error) {
            throw new Error(`Erro ao listar produtos: ${error.message}`);
        }
    }

    /**
     * Versão paginada para grandes volumes
     */
    async executePaginado(page = 1, limit = 10, filtros = {}) {
        try {
            const offset = (page - 1) * limit;
            
            const { produtos, total } = await this.produtoRepository.findPaginado(
                offset,
                limit,
                filtros
            );

            return {
                data: produtos.map(p => this._toDTO(p)),
                paginacao: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            throw new Error(`Erro ao listar produtos: ${error.message}`);
        }
    }

    _toDTO(produto) {
        return {
            id: produto.id,
            nome: produto.nome,
            codigoBarras: produto.codigoBarras,
            precoVenda: produto.precoVenda,
            quantidadeEstoque: produto.quantidadeEstoque,
            estoqueBaixo: produto.estaComEstoqueBaixo()
        };
    }
}

module.exports = ListarProdutosUseCase;