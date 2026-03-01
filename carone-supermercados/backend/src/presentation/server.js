/**
 * SERVIDOR PRINCIPAL
 * 
 * Função: Configura e inicia o servidor Express
 * 
 * Configurações:
 * - Middlewares de segurança (helmet)
 * - Compressão (compression)
 * - CORS
 * - Rate limiting
 * - Rotas
 * - Tratamento de erros
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const setupContainer = require('../infrastructure/config/container');
const ErrorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

class Server {
    constructor() {
        this.app = express();
        this.container = setupContainer();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    /**
     * Configura middlewares globais
     */
    setupMiddleware() {
        // Segurança
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:"]
                }
            }
        }));

        // Compressão
        this.app.use(compression());

        // CORS
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // Parse JSON
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 100, // limite por IP
            message: {
                success: false,
                error: 'Muitas requisições deste IP, tente novamente mais tarde'
            }
        });
        this.app.use('/api/', limiter);

        // Logging de requisições (em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
            this.app.use((req, res, next) => {
                console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
                next();
            });
        }
    }

    /**
     * Configura rotas da API
     */
    setupRoutes() {
        // Health check
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0'
            });
        });

        // Rotas de produtos
        const produtoRoutes = require('./routes/ProdutoRoutes')(
            this.container.resolve('produtoController')
        );
        this.app.use('/api/produtos', produtoRoutes);

        // Rotas de dashboard
        const dashboardRoutes = require('./routes/dashboardRoutes')(
            this.container.resolve('dashboardController')
        );
        this.app.use('/api/dashboard', dashboardRoutes);

        // Rota de teste
        this.app.get('/api/teste', (req, res) => {
            res.json({ message: 'API funcionando!' });
        });
    }

    /**
     * Configura tratamento de erros
     */
    setupErrorHandling() {
        // 404 handler
        this.app.use(ErrorHandler.notFound);

        // Error handler global
        this.app.use(ErrorHandler.handle);
    }

    /**
     * Inicia o servidor
     */
    start(port) {
        const PORT = port || process.env.PORT || 3000;
        
        this.server = this.app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════════════════════╗
║     🚀 CARONE SUPERMERCADOS - BACKEND RODANDO         ║
╠════════════════════════════════════════════════════════╣
║  ● Porta: ${PORT}                                      ║
║  ● Ambiente: ${process.env.NODE_ENV || 'development'}                    ║
║  ● Health: http://localhost:${PORT}/api/health        ║
║  ● API: http://localhost:${PORT}/api                  ║
╚════════════════════════════════════════════════════════╝
            `);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
    }

    /**
     * Finaliza o servidor graciosamente
     */
    async shutdown() {
        console.log('\n🔴 Recebido sinal de término, finalizando servidor...');
        
        this.server.close(async () => {
            console.log('✅ Servidor HTTP fechado');
            
            // Fechar conexões com banco de dados
            const db = require('../infrastructure/database/config/database');
            await db.disconnect();
            
            console.log('✅ Conexões com banco de dados fechadas');
            console.log('👋 Servidor finalizado com sucesso');
            
            process.exit(0);
        });

        // Forçar fechamento após 10 segundos
        setTimeout(() => {
            console.error('❌ Forçando fechamento do servidor');
            process.exit(1);
        }, 10000);
    }
}

module.exports = Server;