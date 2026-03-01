/**
 * CONTAINER DE INJEÇÃO DE DEPENDÊNCIA
 * 
 * Função: Gerencia todas as dependências do sistema
 * Biblioteca: awilix
 * 
 * Princípios:
 * - Inversão de Controle (IoC)
 * - Injeção de Dependência (DI)
 * - Singleton para repositórios
 * - Transient para casos de uso
 */

const { createContainer, asClass, asFunction, asValue } = require('awilix');
const database = require('../database/config/database');

// ==================== DOMAIN ====================
// (Geralmente não são registrados, são instanciados diretamente)

// ==================== APPLICATION ====================
// Use Cases (são registrados como classes)
const CriarProdutoUseCase = require('../../core/application/use-cases/produtos/CriarProdutoUseCase');
const ListarProdutosUseCase = require('../../core/application/use-cases/produtos/ListarProdutosUseCase');
const AtualizarProdutoUseCase = require('../../core/application/use-cases/produtos/AtualizarProdutoUseCase');
const DeletarProdutoUseCase = require('../../core/application/use-cases/produtos/DeletarProdutoUseCase');
const ObterDashboardUseCase = require('../../core/application/use-cases/dashboard/ObterDashboardUseCase');

// ==================== INFRASTRUCTURE ====================
// Repositórios
const ProdutoRepository = require('../database/repositories/ProdutoRepository');

// ==================== PRESENTATION ====================
// Controllers
const ProdutoController = require('../../presentation/controllers/ProdutoController');
const DashboardController = require('../../presentation/controllers/DashboardController');

/**
 * Configura o container de DI
 */
const setupContainer = () => {
    const container = createContainer();

    // Registrar dependências
    container.register({
        // Database (singleton - uma única instância)
        db: asValue(database),

        // Repositórios (singleton - uma instância por repositório)
        produtoRepository: asClass(ProdutoRepository).singleton(),

        // Use Cases (transient - nova instância para cada uso)
        criarProdutoUseCase: asClass(CriarProdutoUseCase).transient(),
        listarProdutosUseCase: asClass(ListarProdutosUseCase).transient(),
        atualizarProdutoUseCase: asClass(AtualizarProdutoUseCase).transient(),
        deletarProdutoUseCase: asClass(DeletarProdutoUseCase).transient(),
        obterDashboardUseCase: asClass(ObterDashboardUseCase).transient(),

        // Controllers (singleton - uma instância por controller)
        produtoController: asClass(ProdutoController).singleton(),
        dashboardController: asClass(DashboardController).singleton()
    });

    return container;
};

// Exportar container configurado
module.exports = setupContainer();