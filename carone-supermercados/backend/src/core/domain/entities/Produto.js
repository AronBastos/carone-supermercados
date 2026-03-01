/**
 * ENTIDADE PRODUTO
 * 
 * Função: Representa um produto no domínio do supermercado
 * Localização: Camada de Domínio (mais interna da Clean Architecture)
 * 
 * Princípios SOLID aplicados:
 * - SRP: Esta classe tem apenas a responsabilidade de representar um produto
 * - OCP: Pode ser estendida via herança sem modificar a classe base
 * - LSP: Pode ser substituída por subtipos sem quebrar o sistema
 * 
 * Clean Code:
 * - Nomes significativos
 * - Métodos pequenos e focados
 * - Validações no construtor (objeto sempre válido)
 */

class Produto {
    constructor({
        id,
        nome,
        codigoBarras,
        categoriaId,
        precoCusto,
        precoVenda,
        quantidadeEstoque,
        quantidadeMinima = 5,
        ativo = true,
        createdAt = new Date(),
        updatedAt = new Date()
    }) {
        // Atributos privados (encapsulamento)
        this._id = id;
        this._nome = nome;
        this._codigoBarras = codigoBarras;
        this._categoriaId = categoriaId;
        this._precoCusto = precoCusto;
        this._precoVenda = precoVenda;
        this._quantidadeEstoque = quantidadeEstoque;
        this._quantidadeMinima = quantidadeMinima;
        this._ativo = ativo;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        
        // Validação do objeto no momento da criação (sempre válido)
        this._validate();
    }

    /**
     * Getters - Controlam acesso aos atributos privados
     * Permitem adicionar lógica extra se necessário
     */
    get id() { return this._id; }
    get nome() { return this._nome; }
    get codigoBarras() { return this._codigoBarras; }
    get categoriaId() { return this._categoriaId; }
    get precoCusto() { return this._precoCusto; }
    get precoVenda() { return this._precoVenda; }
    get quantidadeEstoque() { return this._quantidadeEstoque; }
    get quantidadeMinima() { return this._quantidadeMinima; }
    get ativo() { return this._ativo; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }

    /**
     * Validação interna do objeto
     * Garante que o produto nunca seja criado em estado inválido
     */
    _validate() {
        const errors = [];

        if (!this._nome || this._nome.length < 3) {
            errors.push('Nome deve ter pelo menos 3 caracteres');
        }

        if (!this._codigoBarras || !this._codigoBarras.match(/^\d+$/)) {
            errors.push('Código de barras deve conter apenas números');
        }

        if (this._precoCusto <= 0) {
            errors.push('Preço de custo deve ser maior que zero');
        }

        if (this._precoVenda <= this._precoCusto) {
            errors.push('Preço de venda deve ser maior que o preço de custo');
        }

        if (this._quantidadeEstoque < 0) {
            errors.push('Quantidade em estoque não pode ser negativa');
        }

        if (errors.length > 0) {
            throw new Error(`Produto inválido: ${errors.join(', ')}`);
        }
    }

    /**
     * Comportamentos do domínio (regras de negócio)
     * Cada método encapsula uma regra específica
     */

    // Regra: Preço de venda pode ser atualizado mas deve ser > custo
    atualizarPrecoVenda(novoPreco) {
        if (novoPreco <= this._precoCusto) {
            throw new Error('Preço de venda deve ser maior que preço de custo');
        }
        this._precoVenda = novoPreco;
        this._updatedAt = new Date();
    }

    // Regra: Adicionar estoque só com quantidade positiva
    adicionarEstoque(quantidade) {
        if (quantidade <= 0) {
            throw new Error('Quantidade deve ser positiva');
        }
        this._quantidadeEstoque += quantidade;
        this._updatedAt = new Date();
    }

    // Regra: Remover estoque verificando disponibilidade
    removerEstoque(quantidade) {
        if (quantidade <= 0) {
            throw new Error('Quantidade deve ser positiva');
        }
        if (this._quantidadeEstoque - quantidade < 0) {
            throw new Error(`Estoque insuficiente. Disponível: ${this._quantidadeEstoque}`);
        }
        this._quantidadeEstoque -= quantidade;
        this._updatedAt = new Date();
    }

    // Regra: Verificar se precisa repor estoque
    estaComEstoqueBaixo() {
        return this._quantidadeEstoque <= this._quantidadeMinima;
    }

    // Regra: Desativar produto (soft delete)
    desativar() {
        this._ativo = false;
        this._updatedAt = new Date();
    }

    // Regra: Ativar produto
    ativar() {
        this._ativo = true;
        this._updatedAt = new Date();
    }

    /**
     * Método de fábrica para criar produto a partir do banco
     * Padrão: Static Factory Method
     */
    static fromDatabase(row) {
        return new Produto({
            id: row.id,
            nome: row.nome,
            codigoBarras: row.codigo_barras,
            categoriaId: row.categoria_id,
            precoCusto: parseFloat(row.preco_custo),
            precoVenda: parseFloat(row.preco_venda),
            quantidadeEstoque: parseInt(row.quantidade_estoque),
            quantidadeMinima: parseInt(row.quantidade_minima),
            ativo: row.ativo,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }

    /**
     * Representação do objeto para JSON
     * Controla o que é exposto pela API
     */
    toJSON() {
        return {
            id: this._id,
            nome: this._nome,
            codigoBarras: this._codigoBarras,
            categoriaId: this._categoriaId,
            precoCusto: this._precoCusto,
            precoVenda: this._precoVenda,
            quantidadeEstoque: this._quantidadeEstoque,
            quantidadeMinima: this._quantidadeMinima,
            ativo: this._ativo,
            estoqueBaixo: this.estaComEstoqueBaixo(),
            createdAt: this._createdAt,
            updatedAt: this._updatedAt
        };
    }
}

module.exports = Produto;