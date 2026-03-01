/**
 * CASO DE USO: OBTER DADOS DO DASHBOARD
 * 
 * Função: Agrega dados de múltiplas fontes para o dashboard
 * 
 * Padrão: Agregador
 * - Combina dados de vários repositórios
 * - Formata para visualização
 */

class ObterDashboardUseCase {
    constructor(produtoRepository, vendaRepository) {
        this.produtoRepository = produtoRepository;
        this.vendaRepository = vendaRepository;
    }

    async execute() {
        try {
            // Executar consultas em paralelo para performance
            const [
                totalProdutos,
                estoqueBaixo,
                valorEstoque,
                vendasHoje,
                ultimasVendas
            ] = await Promise.all([
                this._getTotalProdutos(),
                this._getEstoqueBaixo(),
                this._getValorEstoque(),
                this._getVendasHoje(),
                this._getUltimasVendas()
            ]);

            return {
                resumo: {
                    totalProdutos,
                    estoqueBaixo: estoqueBaixo.length,
                    produtosEmAlerta: estoqueBaixo,
                    valorEstoque,
                    vendasHoje: vendasHoje.total,
                    faturamentoHoje: vendasHoje.faturamento
                },
                ultimasVendas,
                graficos: {
                    vendasPorDia: await this._getVendasPorDia(),
                    produtosMaisVendidos: await this._getProdutosMaisVendidos()
                }
            };

        } catch (error) {
            throw new Error(`Erro ao carregar dashboard: ${error.message}`);
        }
    }

    async _getTotalProdutos() {
        const produtos = await this.produtoRepository.findAll();
        return produtos.length;
    }

    async _getEstoqueBaixo() {
        return this.produtoRepository.findEstoqueBaixo();
    }

    async _getValorEstoque() {
        const produtos = await this.produtoRepository.findAll();
        return produtos.reduce((total, p) => {
            return total + (p.quantidadeEstoque * p.precoCusto);
        }, 0);
    }

    async _getVendasHoje() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);

        const vendas = await this.vendaRepository.findByPeriodo(hoje, amanha);
        
        return {
            total: vendas.length,
            faturamento: vendas.reduce((sum, v) => sum + v.calcularTotal(), 0)
        };
    }

    async _getUltimasVendas(limite = 5) {
        return this.vendaRepository.findUltimas(limite);
    }

    async _getVendasPorDia() {
        // Implementar lógica de vendas dos últimos 7 dias
        return [];
    }

    async _getProdutosMaisVendidos(limite = 5) {
        // Implementar ranking de produtos mais vendidos
        return [];
    }
}

module.exports = ObterDashboardUseCase;