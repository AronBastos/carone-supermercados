/**
 * TESTES DA ENTIDADE PRODUTO
 * 
 * Função: Garantir que as regras de negócio do produto funcionam
 */

const Produto = require('../../../../src/core/domain/entities/Produto');

describe('Entidade Produto', () => {
    describe('Criação', () => {
        test('Deve criar um produto válido', () => {
            const produto = new Produto({
                nome: 'Arroz 5kg',
                codigoBarras: '7891234567890',
                precoCusto: 18.50,
                precoVenda: 22.90,
                quantidadeEstoque: 50
            });

            expect(produto.nome).toBe('Arroz 5kg');
            expect(produto.codigoBarras).toBe('7891234567890');
            expect(produto.precoVenda).toBe(22.90);
            expect(produto.estaComEstoqueBaixo()).toBe(false);
        });

        test('Deve lançar erro se nome for muito curto', () => {
            expect(() => {
                new Produto({
                    nome: 'Ar',
                    codigoBarras: '7891234567890',
                    precoCusto: 18.50,
                    precoVenda: 22.90,
                    quantidadeEstoque: 50
                });
            }).toThrow('Produto inválido: Nome deve ter pelo menos 3 caracteres');
        });

        test('Deve lançar erro se código de barras não for numérico', () => {
            expect(() => {
                new Produto({
                    nome: 'Arroz 5kg',
                    codigoBarras: 'ABC123',
                    precoCusto: 18.50,
                    precoVenda: 22.90,
                    quantidadeEstoque: 50
                });
            }).toThrow('Código de barras deve conter apenas números');
        });

        test('Deve lançar erro se preço de venda for menor que custo', () => {
            expect(() => {
                new Produto({
                    nome: 'Arroz 5kg',
                    codigoBarras: '7891234567890',
                    precoCusto: 20.00,
                    precoVenda: 15.00,
                    quantidadeEstoque: 50
                });
            }).toThrow('Preço de venda deve ser maior que preço de custo');
        });

        test('Deve lançar erro se quantidade em estoque for negativa', () => {
            expect(() => {
                new Produto({
                    nome: 'Arroz 5kg',
                    codigoBarras: '7891234567890',
                    precoCusto: 18.50,
                    precoVenda: 22.90,
                    quantidadeEstoque: -10
                });
            }).toThrow('Quantidade em estoque não pode ser negativa');
        });
    });

    describe('Comportamentos', () => {
        let produto;

        beforeEach(() => {
            produto = new Produto({
                nome: 'Arroz 5kg',
                codigoBarras: '7891234567890',
                precoCusto: 18.50,
                precoVenda: 22.90,
                quantidadeEstoque: 50,
                quantidadeMinima: 5
            });
        });

        test('Deve atualizar preço de venda corretamente', () => {
            produto.atualizarPrecoVenda(25.90);
            expect(produto.precoVenda).toBe(25.90);
        });

        test('Deve lançar erro ao atualizar preço de venda para menor que custo', () => {
            expect(() => {
                produto.atualizarPrecoVenda(15.00);
            }).toThrow('Preço de venda deve ser maior que preço de custo');
        });

        test('Deve adicionar estoque corretamente', () => {
            produto.adicionarEstoque(10);
            expect(produto.quantidadeEstoque).toBe(60);
        });

        test('Deve lançar erro ao adicionar estoque negativo', () => {
            expect(() => {
                produto.adicionarEstoque(-5);
            }).toThrow('Quantidade deve ser positiva');
        });

        test('Deve remover estoque corretamente', () => {
            produto.removerEstoque(10);
            expect(produto.quantidadeEstoque).toBe(40);
        });

        test('Deve lançar erro ao remover mais estoque que o disponível', () => {
            expect(() => {
                produto.removerEstoque(100);
            }).toThrow('Estoque insuficiente. Disponível: 50');
        });

        test('Deve detectar estoque baixo', () => {
            produto.removerEstoque(46);
            expect(produto.quantidadeEstoque).toBe(4);
            expect(produto.estaComEstoqueBaixo()).toBe(true);
        });

        test('Deve desativar produto', () => {
            produto.desativar();
            expect(produto.ativo).toBe(false);
        });
    });
});