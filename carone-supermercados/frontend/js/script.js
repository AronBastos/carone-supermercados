const API_URL = 'http://localhost:3000/api';

// Estado da aplicação
let currentPage = 'dashboard';
let produtos = [];
let categorias = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadPage('dashboard');
    checkHealth();
});

// Health check
async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        if (data.status === 'ok') {
            console.log('✅ Sistema operacional');
        } else {
            showAlert('Problemas de conexão com o servidor', 'warning');
        }
    } catch (error) {
        showAlert('Servidor indisponível', 'danger');
    }
}

// Carregar páginas
async function loadPage(page) {
    currentPage = page;
    
    // Atualizar menu ativo
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick')?.includes(page)) {
            link.classList.add('active');
        }
    });
    
    // Mostrar loading
    showLoading();
    
    switch(page) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'produtos':
            await loadProdutos();
            break;
        case 'vendas':
            await loadVendas();
            break;
        case 'relatorios':
            await loadRelatorios();
            break;
    }
}

function showLoading() {
    document.getElementById('content').innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
            <div class="spinner"></div>
        </div>
    `;
}

// Dashboard
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/dashboard`);
        const data = await response.json();
        
        document.getElementById('content').innerHTML = `
            <h2 style="color: white; margin-bottom: 2rem;"><i class="fas fa-chart-line"></i> Dashboard</h2>
            
            <div class="card-container">
                <div class="card">
                    <i class="fas fa-box"></i>
                    <h3>Total de Produtos</h3>
                    <div class="value">${data.total_produtos}</div>
                    <div class="subtitle">Produtos cadastrados</div>
                </div>
                
                <div class="card">
                    <i class="fas fa-exclamation-triangle" style="color: ${data.estoque_baixo > 0 ? '#dc3545' : '#28a745'}"></i>
                    <h3>Estoque Baixo</h3>
                    <div class="value" style="color: ${data.estoque_baixo > 0 ? '#dc3545' : '#28a745'}">
                        ${data.estoque_baixo}
                    </div>
                    <div class="subtitle">Produtos abaixo do mínimo</div>
                </div>
                
                <div class="card">
                    <i class="fas fa-dollar-sign"></i>
                    <h3>Valor em Estoque</h3>
                    <div class="value">R$ ${formatMoney(data.valor_estoque)}</div>
                    <div class="subtitle">Custo total</div>
                </div>
                
                <div class="card">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Vendas Hoje</h3>
                    <div class="value">${data.vendas_hoje || 0}</div>
                    <div class="subtitle">Faturamento: R$ ${formatMoney(data.faturamento_hoje)}</div>
                </div>
            </div>
            
            ${data.alertasEstoque?.length > 0 ? `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-circle"></i>
                    <strong>Atenção!</strong> ${data.alertasEstoque.length} produtos com estoque baixo
                </div>
            ` : ''}
            
            <div class="table-container">
                <h3><i class="fas fa-history"></i> Últimas Vendas</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Data</th>
                            <th>Total</th>
                            <th>Pagamento</th>
                            <th>Vendedor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.ultimasVendas?.map(venda => `
                            <tr>
                                <td>#${venda.id}</td>
                                <td>${formatDate(venda.data_venda)}</td>
                                <td><strong>R$ ${formatMoney(venda.total)}</strong></td>
                                <td><span class="badge badge-info">${venda.forma_pagamento || 'N/A'}</span></td>
                                <td>${venda.usuario_nome || 'N/A'}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="5" style="text-align: center;">Nenhuma venda recente</td></tr>'}
                    </tbody>
                </table>
            </div>
            
            ${data.alertasEstoque?.length > 0 ? `
                <div class="table-container">
                    <h3><i class="fas fa-exclamation-triangle"></i> Produtos com Estoque Baixo</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Produto</th>
                                <th>Estoque Atual</th>
                                <th>Mínimo</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.alertasEstoque.map(prod => `
                                <tr>
                                    <td>${prod.codigo_barras}</td>
                                    <td>${prod.nome}</td>
                                    <td style="color: #dc3545; font-weight: bold;">${prod.quantidade_estoque}</td>
                                    <td>${prod.quantidade_minima}</td>
                                    <td>
                                        <button class="btn btn-primary" onclick="abrirReposicao(${prod.id})">
                                            <i class="fas fa-plus"></i> Repor
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
        `;
    } catch (error) {
        console.error(error);
        showAlert('Erro ao carregar dashboard', 'danger');
        document.getElementById('content').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                Erro ao carregar dashboard. Tente novamente.
            </div>
        `;
    }
}

// Produtos
async function loadProdutos() {
    try {
        const [produtosRes, categoriasRes] = await Promise.all([
            fetch(`${API_URL}/produtos`),
            fetch(`${API_URL}/categorias`)
        ]);
        
        produtos = await produtosRes.json();
        categorias = await categoriasRes.json();
        
        document.getElementById('content').innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="color: white;"><i class="fas fa-box"></i> Produtos</h2>
                <button class="btn btn-success" onclick="showFormProduto()">
                    <i class="fas fa-plus"></i> Novo Produto
                </button>
            </div>
            
            <div id="produto-form" style="display: none;" class="form-container">
                <h3><i class="fas fa-plus-circle"></i> Novo Produto</h3>
                <form onsubmit="saveProduto(event)">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Nome do Produto *</label>
                            <input type="text" id="nome" required placeholder="Ex: Arroz 5kg">
                        </div>
                        
                        <div class="form-group">
                            <label>Código de Barras *</label>
                            <input type="text" id="codigo_barras" required placeholder="789100001">
                        </div>
                        
                        <div class="form-group">
                            <label>Categoria *</label>
                            <input type="text" id="categoria" list="categorias" required placeholder="Ex: Alimentos">
                            <datalist id="categorias">
                                ${categorias.map(cat => `<option value="${cat}">`).join('')}
                            </datalist>
                        </div>
                        
                        <div class="form-group">
                            <label>Preço de Custo (R$) *</label>
                            <input type="number" step="0.01" id="preco_custo" required placeholder="0.00">
                        </div>
                        
                        <div class="form-group">
                            <label>Preço de Venda (R$) *</label>
                            <input type="number" step="0.01" id="preco_venda" required placeholder="0.00">
                        </div>
                        
                        <div class="form-group">
                            <label>Quantidade Inicial *</label>
                            <input type="number" id="quantidade_estoque" required placeholder="0">
                        </div>
                        
                        <div class="form-group">
                            <label>Estoque Mínimo</label>
                            <input type="number" id="quantidade_minima" value="5" placeholder="5">
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button type="submit" class="btn btn-success">
                            <i class="fas fa-save"></i> Salvar
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="hideFormProduto()">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </form>
            </div>
            
            <div class="table-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3><i class="fas fa-list"></i> Lista de Produtos</h3>
                    <div>
                        <input type="text" id="searchProduto" placeholder="Buscar produto..." 
                               style="padding: 0.5rem; border: 2px solid #e1e1e1; border-radius: 8px; width: 250px;">
                    </div>
                </div>
                
                <table id="produtosTable">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nome</th>
                            <th>Categoria</th>
                            <th>Preço Custo</th>
                            <th>Preço Venda</th>
                            <th>Margem</th>
                            <th>Estoque</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${produtos.map(produto => {
                            const margem = ((produto.preco_venda - produto.preco_custo) / produto.preco_custo * 100).toFixed(1);
                            return `
                            <tr>
                                <td>${produto.codigo_barras}</td>
                                <td><strong>${produto.nome}</strong></td>
                                <td><span class="badge badge-info">${produto.categoria}</span></td>
                                <td>R$ ${formatMoney(produto.preco_custo)}</td>
                                <td>R$ ${formatMoney(produto.preco_venda)}</td>
                                <td style="color: ${margem > 30 ? '#28a745' : '#ffc107'}">${margem}%</td>
                                <td>
                                    <span style="color: ${produto.quantidade_estoque <= produto.quantidade_minima ? '#dc3545' : '#28a745'}; font-weight: bold;">
                                        ${produto.quantidade_estoque} un
                                    </span>
                                    ${produto.quantidade_estoque <= produto.quantidade_minima ? 
                                        '<i class="fas fa-exclamation-triangle" style="color: #dc3545; margin-left: 5px;"></i>' : ''}
                                </td>
                                <td>
                                    <button class="btn btn-primary" onclick="editarProduto(${produto.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger" onclick="confirmarExclusao(${produto.id}, '${produto.nome}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Adicionar filtro de busca
        document.getElementById('searchProduto')?.addEventListener('keyup', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#produtosTable tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
        
    } catch (error) {
        console.error(error);
        showAlert('Erro ao carregar produtos', 'danger');
    }
}

// Funções auxiliares
function formatMoney(value) {
    return parseFloat(value || 0).toFixed(2).replace('.', ',');
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showFormProduto() {
    document.getElementById('produto-form').style.display = 'block';
    document.getElementById('produto-form').scrollIntoView({ behavior: 'smooth' });
}

function hideFormProduto() {
    document.getElementById('produto-form').style.display = 'none';
}

async function saveProduto(event) {
    event.preventDefault();
    
    const produto = {
        nome: document.getElementById('nome').value,
        codigo_barras: document.getElementById('codigo_barras').value,
        categoria: document.getElementById('categoria').value,
        preco_custo: parseFloat(document.getElementById('preco_custo').value),
        preco_venda: parseFloat(document.getElementById('preco_venda').value),
        quantidade_estoque: parseInt(document.getElementById('quantidade_estoque').value),
        quantidade_minima: parseInt(document.getElementById('quantidade_minima').value) || 5
    };
    
    try {
        const response = await fetch(`${API_URL}/produtos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });
        
        if (response.ok) {
            showAlert('✅ Produto cadastrado com sucesso!', 'success');
            hideFormProduto();
            event.target.reset();
            loadProdutos();
        } else {
            const error = await response.json();
            showAlert('Erro: ' + error.error, 'danger');
        }
    } catch (error) {
        console.error(error);
        showAlert('Erro ao cadastrar produto', 'danger');
    }
}

function confirmarExclusao(id, nome) {
    showModal(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir o produto "${nome}"?`,
        async () => {
            await excluirProduto(id);
        }
    );
}

async function excluirProduto(id) {
    try {
        const response = await fetch(`${API_URL}/produtos/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showAlert('✅ Produto excluído com sucesso!', 'success');
            closeModal();
            loadProdutos();
        } else {
            showAlert('Erro ao excluir produto', 'danger');
        }
    } catch (error) {
        console.error(error);
        showAlert('Erro ao excluir produto', 'danger');
    }
}

// Modal functions
function showModal(title, message, onConfirm) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('modalConfirmBtn').onclick = onConfirm;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Alert function
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    const content = document.getElementById('content');
    content.insertBefore(alertDiv, content.firstChild);
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, 5000);
}

// Fechar modal clicando fora
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
};