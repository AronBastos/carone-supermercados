/**
 * REPOSITÓRIO DE PRODUTOS (Implementação)
 * 
 * Função: Implementa a interface IProdutoRepository usando PostgreSQL
 * Localização: Camada de Infraestrutura
 * 
 * Padrões:
 * - Repository: Abstrai acesso a dados
 * - Data Mapper: Converte entre banco e entidade
 */

const IProdutoRepository = require('../../../core/application/ports/repositories/IProdutoRepository');
const Produto = require('../../../core/domain/entities/Produto');

class ProdutoRepository extends IProdutoRepository {
    constructor(dbConnection) {
        super();
        this.db = dbConnection;
        this.tableName = 'produtos';
    }

    /**
     * Salva um novo produto
     * @override
     */
    async save(produto) {
        const client = await this.db.getClient();
        
        try {
            await client.query('BEGIN');

            const query = `
                INSERT INTO ${this.tableName} 
                (nome, codigo_barras, categoria_id, preco_custo, preco_venda, 
                 quantidade_estoque, quantidade_minima, ativo)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, created_at
            `;
            
            const values = [
                produto.nome,
                produto.codigoBarras,
                produto.categoriaId,
                produto.precoCusto,
                produto.precoVenda,
                produto.quantidadeEstoque,
                produto.quantidadeMinima,
                produto.ativo
            ];

            const result = await client.query(query, values);
            
            await client.query('COMMIT');
            
            // Retornar produto com ID gerado
            return new Produto({
                ...produto,
                id: result.rows[0].id,
                createdAt: result.rows[0].created_at
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Erro ao salvar produto: ${error.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * Busca todos os produtos ativos
     * @override
     */
    async findAll(filtros = {}) {
        try {
            let query = `SELECT * FROM ${this.tableName} WHERE ativo = true`;
            const values = [];
            let paramIndex = 1;

            // Aplicar filtros
            if (filtros.categoriaId) {
                query += ` AND categoria_id = $${paramIndex}`;
                values.push(filtros.categoriaId);
                paramIndex++;
            }

            if (filtros.estoqueBaixo) {
                query += ` AND quantidade_estoque <= quantidade_minima`;
            }

            query += ' ORDER BY nome';

            const result = await this.db.query(query, values);
            
            return result.rows.map(row => this._mapToDomain(row));

        } catch (error) {
            throw new Error(`Erro ao buscar produtos: ${error.message}`);
        }
    }

    /**
     * Busca produto por ID
     * @override
     */
    async findById(id) {
        try {
            const result = await this.db.query(
                `SELECT * FROM ${this.tableName} WHERE id = $1 AND ativo = true`,
                [id]
            );

            if (result.rows.length === 0) {
                return null;
            }

            return this._mapToDomain(result.rows[0]);

        } catch (error) {
            throw new Error(`Erro ao buscar produto por ID: ${error.message}`);
        }
    }

    /**
     * Busca produto por código de barras
     * @override
     */
    async findByCodigoBarras(codigoBarras) {
        try {
            const result = await this.db.query(
                `SELECT * FROM ${this.tableName} WHERE codigo_barras = $1 AND ativo = true`,
                [codigoBarras]
            );

            if (result.rows.length === 0) {
                return null;
            }

            return this._mapToDomain(result.rows[0]);

        } catch (error) {
            throw new Error(`Erro ao buscar produto por código de barras: ${error.message}`);
        }
    }

    /**
     * Atualiza produto existente
     * @override
     */
    async update(id, produto) {
        const client = await this.db.getClient();
        
        try {
            await client.query('BEGIN');

            const query = `
                UPDATE ${this.tableName} 
                SET nome = $1, 
                    preco_venda = $2, 
                    quantidade_estoque = $3,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $4 AND ativo = true
                RETURNING *
            `;
            
            const values = [
                produto.nome,
                produto.precoVenda,
                produto.quantidadeEstoque,
                id
            ];

            const result = await client.query(query, values);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }

            await client.query('COMMIT');
            
            return this._mapToDomain(result.rows[0]);

        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Erro ao atualizar produto: ${error.message}`);
        } finally {
            client.release();
        }
    }

    /**
     * Deleta (soft delete) produto
     * @override
     */
    async delete(id) {
        try {
            const result = await this.db.query(
                `UPDATE ${this.tableName} 
                 SET ativo = false, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $1 AND ativo = true 
                 RETURNING id`,
                [id]
            );

            return result.rows.length > 0;

        } catch (error) {
            throw new Error(`Erro ao deletar produto: ${error.message}`);
        }
    }

    /**
     * Busca produtos com estoque baixo
     * @override
     */
    async findEstoqueBaixo() {
        try {
            const result = await this.db.query(
                `SELECT * FROM ${this.tableName} 
                 WHERE ativo = true 
                 AND quantidade_estoque <= quantidade_minima 
                 ORDER BY (quantidade_estoque::float / quantidade_minima) ASC`
            );

            return result.rows.map(row => this._mapToDomain(row));

        } catch (error) {
            throw new Error(`Erro ao buscar produtos com estoque baixo: ${error.message}`);
        }
    }

    /**
     * Busca produtos com paginação
     */
    async findPaginado(offset, limit, filtros = {}) {
        try {
            let queryCount = `SELECT COUNT(*) as total FROM ${this.tableName} WHERE ativo = true`;
            let queryData = `SELECT * FROM ${this.tableName} WHERE ativo = true`;
            const values = [];
            let paramIndex = 1;

            // Aplicar filtros
            if (filtros.categoriaId) {
                const cond = ` AND categoria_id = $${paramIndex}`;
                queryCount += cond;
                queryData += cond;
                values.push(filtros.categoriaId);
                paramIndex++;
            }

            // Contar total
            const countResult = await this.db.query(queryCount, values.slice(0, paramIndex - 1));
            const total = parseInt(countResult.rows[0].total);

            // Buscar dados paginados
            queryData += ` ORDER BY nome LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            values.push(limit, offset);
            
            const dataResult = await this.db.query(queryData, values);
            
            return {
                produtos: dataResult.rows.map(row => this._mapToDomain(row)),
                total
            };

        } catch (error) {
            throw new Error(`Erro ao buscar produtos paginados: ${error.message}`);
        }
    }

    /**
     * Mapeia linha do banco para entidade de domínio
     * @private
     */
    _mapToDomain(row) {
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
}

module.exports = ProdutoRepository;