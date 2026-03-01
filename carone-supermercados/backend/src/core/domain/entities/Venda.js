/**
 * ENTIDADE VENDA
 * 
 * Função: Representa uma venda no sistema do supermercado
 * Localização: Camada de Domínio
 * 
 * Gerencia todo o ciclo de vida de uma venda:
 * - Criação
 * - Adição de itens
 * - Cálculo de totais
 * - Finalização
 */

class Venda {
    constructor({
        id,
        usuarioId,
        clienteId = null,
        numeroVenda = null,
        itens = [],
        desconto = 0,
        formaPagamento = null,
        status = 'pendente',
        observacoes = '',
        dataVenda = new Date()
    }) {
        this._id = id;
        this._usuarioId = usuarioId;
        this._clienteId = clienteId;
        this._numeroVenda = numeroVenda;
        this._itens = itens; // Array de objetos { produtoId, quantidade, precoUnitario }
        this._desconto = desconto;
        this._formaPagamento = formaPagamento;
        this._status = status;
        this._observacoes = observacoes;
        this._dataVenda = dataVenda;
        
        this._validate();
    }

    _validate() {
        if (!this._usuarioId) {
            throw new Error('Venda deve ter um usuário responsável');
        }
    }

    // Getters
    get id() { return this._id; }
    get usuarioId() { return this._usuarioId; }
    get numeroVenda() { return this._numeroVenda; }
    get itens() { return [...this._itens]; } // Retorna cópia para evitar mutação externa
    get status() { return this._status; }
    get dataVenda() { return this._dataVenda; }

    /**
     * Calcula subtotal (soma dos itens sem desconto)
     */
    calcularSubtotal() {
        return this._itens.reduce((total, item) => {
            return total + (item.quantidade * item.precoUnitario);
        }, 0);
    }

    /**
     * Calcula total final com desconto
     */
    calcularTotal() {
        const subtotal = this.calcularSubtotal();
        return subtotal - this._desconto;
    }

    /**
     * Adiciona item à venda
     * Padrão: Método modificador com validação
     */
    adicionarItem(produtoId, quantidade, precoUnitario) {
        // Validações
        if (!produtoId) throw new Error('Produto é obrigatório');
        if (quantidade <= 0) throw new Error('Quantidade deve ser positiva');
        if (precoUnitario <= 0) throw new Error('Preço unitário deve ser positivo');

        // Verificar se venda já foi finalizada
        if (this._status !== 'pendente') {
            throw new Error('Não é possível adicionar itens a uma venda finalizada');
        }

        // Verificar se produto já existe na venda
        const itemExistente = this._itens.find(item => item.produtoId === produtoId);
        
        if (itemExistente) {
            // Incrementar quantidade se já existe
            itemExistente.quantidade += quantidade;
        } else {
            // Adicionar novo item
            this._itens.push({
                produtoId,
                quantidade,
                precoUnitario,
                subtotal: quantidade * precoUnitario
            });
        }

        this._atualizarDataModificacao();
    }

    /**
     * Remove item da venda
     */
    removerItem(produtoId) {
        if (this._status !== 'pendente') {
            throw new Error('Não é possível remover itens de uma venda finalizada');
        }

        this._itens = this._itens.filter(item => item.produtoId !== produtoId);
        this._atualizarDataModificacao();
    }

    /**
     * Aplica desconto à venda
     */
    aplicarDesconto(valor) {
        if (valor < 0) throw new Error('Desconto não pode ser negativo');
        if (valor > this.calcularSubtotal()) {
            throw new Error('Desconto não pode ser maior que o subtotal');
        }

        this._desconto = valor;
        this._atualizarDataModificacao();
    }

    /**
     * Finaliza a venda
     */
    finalizar(formaPagamento) {
        if (this._itens.length === 0) {
            throw new Error('Venda não pode ser finalizada sem itens');
        }

        this._formaPagamento = formaPagamento;
        this._status = 'concluida';
        this._numeroVenda = this._gerarNumeroVenda();
        this._atualizarDataModificacao();
    }

    /**
     * Cancela a venda
     */
    cancelar() {
        if (this._status === 'concluida') {
            throw new Error('Vendas concluídas não podem ser canceladas');
        }
        this._status = 'cancelada';
        this._atualizarDataModificacao();
    }

    /**
     * Gera número único da venda (YYYYMMDD + sequencial)
     * Método privado
     */
    _gerarNumeroVenda() {
        const data = new Date();
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        
        // Sequencial aleatório (em produção, viria do banco)
        const sequencial = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        
        return `${ano}${mes}${dia}-${sequencial}`;
    }

    _atualizarDataModificacao() {
        this._dataVenda = new Date();
    }

    toJSON() {
        return {
            id: this._id,
            numeroVenda: this._numeroVenda,
            usuarioId: this._usuarioId,
            clienteId: this._clienteId,
            itens: this._itens,
            subtotal: this.calcularSubtotal(),
            desconto: this._desconto,
            total: this.calcularTotal(),
            formaPagamento: this._formaPagamento,
            status: this._status,
            observacoes: this._observacoes,
            dataVenda: this._dataVenda
        };
    }
}

module.exports = Venda;