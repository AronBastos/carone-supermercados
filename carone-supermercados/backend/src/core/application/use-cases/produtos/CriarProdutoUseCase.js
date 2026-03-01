/**
 * CASO DE USO: CRIAR PRODUTO
 * 
 * Função: Orquestra a criação de um novo produto
 * Localização: Camada de Aplicação
 * 
 * Fluxo:
 * 1. Recebe dados de entrada (DTO)
 * 2. Valida regras de negócio
 * 3. Cria entidade
 * 4. Persiste via repositório
 * 5. Retorna DTO de saída
 */

const Produto = require('../../../domain/entities/Produto');

class CriarProdutoUseCase {
    /**
     * @param {IProdutoRepository} produtoRepository - Repositório injetado
     */
    constructor(produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    /**
     * Executa o caso de uso
     * @param {Object} input - DTO de entrada
     * @returns {Promise<Object>} DTO de saída
     */
    async execute(input) {
        try {
            // 1. Validar dados de entrada
            this._validarInput(input);

            // 2. Verificar duplicidade (regra de negócio)
            await this._verificarDuplicidade(input.codigoBarras);

            // 3. Criar entidade (aplicar regras de negócio)
            const produto = new Produto({
                nome: input.nome,
                codigoBarras: input.codigoBarras,
                categoriaId: input.categoriaId,
                precoCusto: input.precoCusto,
                precoVenda: input.precoVenda,
                quantidadeEstoque: input.quantidadeEstoque,
                quantidadeMinima: input.quantidadeMinima || 5
            });

            // 4. Persistir
            const produtoSalvo = await this.produtoRepository.save(produto);

            // 5. Retornar DTO
            return this._toOutputDTO(produtoSalvo);

        } catch (error) {
            // Log do erro (em produção, usar logger)
            console.error('Erro ao criar produto:', error);
            throw new Error(`Falha ao criar produto: ${error.message}`);
        }
    }

    /**
     * Validação dos dados de entrada
     * @private
     */
    _validarInput(input) {
        const camposObrigatorios = [
            'nome',
            'codigoBarras',
            'precoCusto',
            'precoVenda',
            'quantidadeEstoque'
        ];

        for (const campo of camposObrigatorios) {
            if (!input[campo] && input[campo] !== 0) {
                throw new Error(`Campo obrigatório não informado: ${campo}`);
            }
        }

        // Validações específicas
        if (input.nome.length < 3) {
            throw new Error('Nome deve ter pelo menos 3 caracteres');
        }

        if (input.precoCusto <= 0) {
            throw new Error('Preço de custo deve ser maior que zero');
        }

        if (input.precoVenda <= input.precoCusto) {
            throw new Error('Preço de venda deve ser maior que preço de custo');
        }

        if (input.quantidadeEstoque < 0) {
            throw new Error('Quantidade em estoque não pode ser negativa');
        }
    }

    /**
     * Verifica se já existe produto com mesmo código de barras
     * @private
     */
    async _verificarDuplicidade(codigoBarras) {
        const produtoExistente = await this.produtoRepository.findByCodigoBarras(codigoBarras);
        
        if (produtoExistente) {
            throw new Error('Já existe um produto com este código de barras');
        }
    }

    /**
     * Converte entidade para DTO de saída
     * @private
     */
    _toOutputDTO(produto) {
        return {
            id: produto.id,
            nome: produto.nome,
            codigoBarras: produto.codigoBarras,
            precoVenda: produto.precoVenda,
            quantidadeEstoque: produto.quantidadeEstoque,
            estoqueBaixo: produto.estaComEstoqueBaixo(),
            mensagem: 'Produto criado com sucesso'
        };
    }
}

module.exports = CriarProdutoUseCase;