/**
 * CASO DE USO: ATUALIZAR PRODUTO
 * 
 * Função: Atualiza dados de um produto existente
 * 
 * Fluxo:
 * 1. Buscar produto existente
 * 2. Aplicar mudanças na entidade
 * 3. Persistir alterações
 */

class AtualizarProdutoUseCase {
    constructor(produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    async execute(id, dadosAtualizacao) {
        try {
            // 1. Buscar produto existente
            const produtoExistente = await this.produtoRepository.findById(id);
            
            if (!produtoExistente) {
                throw new Error('Produto não encontrado');
            }

            // 2. Aplicar mudanças na entidade (regras de negócio)
            if (dadosAtualizacao.nome) {
                // Validar nome
                if (dadosAtualizacao.nome.length < 3) {
                    throw new Error('Nome deve ter pelo menos 3 caracteres');
                }
                produtoExistente._nome = dadosAtualizacao.nome;
            }

            if (dadosAtualizacao.precoVenda) {
                produtoExistente.atualizarPrecoVenda(dadosAtualizacao.precoVenda);
            }

            if (dadosAtualizacao.quantidadeEstoque !== undefined) {
                // Lógica de atualização de estoque
                const diferenca = dadosAtualizacao.quantidadeEstoque - produtoExistente.quantidadeEstoque;
                
                if (diferenca > 0) {
                    produtoExistente.adicionarEstoque(diferenca);
                } else if (diferenca < 0) {
                    produtoExistente.removerEstoque(Math.abs(diferenca));
                }
            }

            // 3. Persistir
            const produtoAtualizado = await this.produtoRepository.update(id, produtoExistente);

            // 4. Retornar DTO
            return {
                id: produtoAtualizado.id,
                nome: produtoAtualizado.nome,
                precoVenda: produtoAtualizado.precoVenda,
                quantidadeEstoque: produtoAtualizado.quantidadeEstoque,
                mensagem: 'Produto atualizado com sucesso'
            };

        } catch (error) {
            throw new Error(`Erro ao atualizar produto: ${error.message}`);
        }
    }
}

module.exports = AtualizarProdutoUseCase;