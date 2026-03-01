/**
 * CASO DE USO: DELETAR PRODUTO
 * 
 * Função: Remove (desativa) um produto
 * 
 * Padrão: Soft Delete
 * - Não remove fisicamente do banco
 * - Apenas marca como inativo
 * - Mantém histórico
 */

class DeletarProdutoUseCase {
    constructor(produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    async execute(id) {
        try {
            // Verificar se produto existe
            const produto = await this.produtoRepository.findById(id);
            
            if (!produto) {
                throw new Error('Produto não encontrado');
            }

            // Verificar se pode ser deletado (não está em vendas pendentes, etc)
            await this._verificarPodeDeletar(id);

            // Soft delete
            const deletado = await this.produtoRepository.delete(id);

            if (!deletado) {
                throw new Error('Não foi possível deletar o produto');
            }

            return {
                success: true,
                message: 'Produto deletado com sucesso',
                id: id
            };

        } catch (error) {
            throw new Error(`Erro ao deletar produto: ${error.message}`);
        }
    }

    /**
     * Verifica regras de negócio para deleção
     * @private
     */
    async _verificarPodeDeletar(produtoId) {
        // Aqui você verificaria se o produto não está em vendas pendentes
        // ou outras regras de negócio
        
        // Exemplo:
        // const vendasPendentes = await vendaRepository.findByProdutoPendente(produtoId);
        // if (vendasPendentes.length > 0) {
        //     throw new Error('Produto não pode ser deletado pois possui vendas pendentes');
        // }
        
        return true;
    }
}

module.exports = DeletarProdutoUseCase;