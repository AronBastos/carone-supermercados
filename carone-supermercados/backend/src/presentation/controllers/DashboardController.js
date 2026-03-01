/**
 * CONTROLADOR DO DASHBOARD
 * 
 * Função: Fornece dados consolidados para o dashboard
 */

class DashboardController {
    constructor(obterDashboardUseCase) {
        this.obterDashboardUseCase = obterDashboardUseCase;
    }

    /**
     * GET /api/dashboard
     * Retorna todos os dados do dashboard
     */
    async obterDados(req, res, next) {
        try {
            const dados = await this.obterDashboardUseCase.execute();

            res.json({
                success: true,
                data: dados,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/dashboard/resumo
     * Retorna apenas o resumo (versão leve)
     */
    async obterResumo(req, res, next) {
        try {
            const dados = await this.obterDashboardUseCase.execute();
            
            res.json({
                success: true,
                data: dados.resumo,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = DashboardController;