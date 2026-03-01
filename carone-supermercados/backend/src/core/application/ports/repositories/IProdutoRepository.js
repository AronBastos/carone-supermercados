/**
 * INTERFACE DO REPOSITÓRIO DE PRODUTOS
 * 
 * Função: Define o contrato que qualquer repositório de produtos deve seguir
 * Localização: Ports da camada de aplicação
 * 
 * Princípio da Inversão de Dependência (DIP):
 * - A camada de aplicação define a interface
 * - A camada de infraestrutura implementa
 * - O domínio não depende de detalhes de infraestrutura
 */

class IProdutoRepository {
    /**
     * Salva um novo produto
     * @param {Produto} produto - Entidade produto
     * @returns {Promise<Produto>} Produto salvo com ID
     */
    async save(produto) {
        throw new Error('Método não implementado');
    }

    /**
     * Busca todos os produtos ativos
     * @param {Object} filtros - Filtros opcionais
     * @returns {Promise<Array<Produto>>}
     */
    async findAll(filtros = {}) {
        throw new Error('Método não implementado');
    }

    /**
     * Busca produto por ID
     * @param {number} id
     * @returns {Promise<Produto|null>}
     */
    async findById(id) {
        throw new Error('Método não implementado');
    }

    /**
     * Busca produto por código de barras
     * @param {string} codigoBarras
     * @returns {Promise<Produto|null>}
     */
    async findByCodigoBarras(codigoBarras) {
        throw new Error('Método não implementado');
    }

    /**
     * Atualiza um produto existente
     * @param {number} id
     * @param {Object} dados
     * @returns {Promise<Produto|null>}
     */
    async update(id, dados) {
        throw new Error('Método não implementado');
    }

    /**
     * Remove (desativa) um produto
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        throw new Error('Método não implementado');
    }

    /**
     * Busca produtos com estoque baixo
     * @returns {Promise<Array<Produto>>}
     */
    async findEstoqueBaixo() {
        throw new Error('Método não implementado');
    }
}

module.exports = IProdutoRepository;