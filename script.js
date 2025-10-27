// =========================================================
// 1. CONFIGURAÇÕES E CONSTANTES
// =========================================================

// Endpoint base da API REST para a rota de alunos
const API_BASE_URL = 'https://proweb.leoproti.com.br/alunos'; 

// Elementos do DOM
const tabelaAlunosBody = document.getElementById('tabelaAlunosBody');
const formAluno = document.getElementById('formAluno');
const inputId = document.getElementById('alunoId');
const btnSalvar = document.getElementById('btnSalvar');
const btnLimpar = document.getElementById('btnLimpar');

// =========================================================
// 2. READ (LISTAR ALUNOS) - GET /alunos
// =========================================================

/**
 * Busca a lista de alunos na API e exibe-os na tabela.
 */
async function carregarAlunos() {
    try {
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar alunos: ${response.statusText}`);
        }

        const alunos = await response.json(); 
        exibirAlunos(alunos); 

    } catch (error) {
        console.error("Erro na requisição GET:", error);
        tabelaAlunosBody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Não foi possível carregar os dados. Verifique a API.</td></tr>';
    }
}

/**
 * Monta e exibe a tabela de alunos na interface.
 * @param {Array} alunos - Lista de objetos aluno.
 */
function exibirAlunos(alunos) {
    tabelaAlunosBody.innerHTML = ''; 

    if (!alunos || alunos.length === 0) {
        tabelaAlunosBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum aluno cadastrado.</td></tr>';
        return;
    }

    alunos.forEach(aluno => {
        const row = tabelaAlunosBody.insertRow();
        
        // Colunas de dados
        row.insertCell(0).textContent = aluno.id; 
        row.insertCell(1).textContent = aluno.nome; 
        row.insertCell(2).textContent = aluno.turma; 
        row.insertCell(3).textContent = aluno.curso; 
        row.insertCell(4).textContent = aluno.matricula; 

        // Coluna de Ações
        const acoesCell = row.insertCell(5);
        
        // Botão de Editar
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.classList.add('btn', 'btn-sm', 'btn-warning', 'me-2');
        btnEditar.onclick = () => prepararEdicao(aluno.id); 
        acoesCell.appendChild(btnEditar);

        // Botão de Excluir
        const btnExcluir = document.createElement('button');
        btnExcluir.textContent = 'Excluir';
        btnExcluir.classList.add('btn', 'btn-sm', 'btn-danger');
        btnExcluir.onclick = () => excluirAluno(aluno.id); 
        acoesCell.appendChild(btnExcluir);
    });
}

// =========================================================
// 3. CREATE/UPDATE (SALVAR ALUNO) - POST/PUT /alunos/{id}
// =========================================================

formAluno.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    // 1. Coleta dos dados do formulário com o ID (0 se for novo)
    const alunoDataTemp = {
        id: inputId.value ? parseInt(inputId.value) : 0, 
        nome: document.getElementById('nome').value,
        turma: document.getElementById('turma').value,
        curso: document.getElementById('curso').value,
        matricula: document.getElementById('matricula').value,
    };
    
    // Simples validação dos dados
    if (!alunoDataTemp.nome || !alunoDataTemp.turma || !alunoDataTemp.curso || !alunoDataTemp.matricula) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const isUpdate = alunoDataTemp.id !== 0; 
    const url = isUpdate ? `${API_BASE_URL}/${alunoDataTemp.id}` : API_BASE_URL;
    const method = isUpdate ? 'PUT' : 'POST';

    // 2. Cria o objeto final de dados
    const alunoData = {...alunoDataTemp}; 
    
    // CORREÇÃO CRÍTICA: Se for POST (Criação), remove o ID do corpo da requisição
    if (!isUpdate) {
        delete alunoData.id; 
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            // Envia o objeto corrigido (sem 'id' no POST)
            body: JSON.stringify(alunoData), 
        });

        if (!response.ok) {
            const errorText = await response.text(); 
            throw new Error(`Erro ${response.status} ao ${isUpdate ? 'atualizar' : 'criar'} aluno: ${errorText || response.statusText}`);
        }

        alert(`Aluno ${isUpdate ? 'atualizado' : 'cadastrado'} com sucesso!`);
        formAluno.reset(); 
        inputId.value = ''; 
        btnSalvar.textContent = 'Salvar Aluno'; 
        carregarAlunos(); 
        
    } catch (error) {
        console.error(`Erro ao tentar ${method}:`, error);
        alert(`Ocorreu um erro. Detalhes: ${error.message}`);
    }
});

// Reseta o botão ao limpar o formulário manualmente
btnLimpar.addEventListener('click', () => {
    inputId.value = '';
    btnSalvar.textContent = 'Salvar Aluno';
});

// =========================================================
// 4. EDIT (BUSCAR PARA EDIÇÃO) - GET /alunos/{id}
// =========================================================

/**
 * Busca os dados de um aluno por ID e preenche o formulário para edição.
 * @param {number} id - ID do aluno a ser editado.
 */
async function prepararEdicao(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar aluno para edição: ${response.statusText}`);
        }

        const aluno = await response.json(); 
        
        // Preenche o formulário com os dados do aluno
        inputId.value = aluno.id;
        document.getElementById('nome').value = aluno.nome;
        document.getElementById('turma').value = aluno.turma;
        document.getElementById('curso').value = aluno.curso;
        document.getElementById('matricula').value = aluno.matricula;
        
        // Altera o texto do botão para indicar a operação de atualização
        btnSalvar.textContent = 'Atualizar Aluno';
        
        // Rola a tela para o formulário
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("Erro ao buscar aluno:", error);
        alert("Não foi possível carregar os dados para edição.");
    }
}

// =========================================================
// 5. DELETE (REMOVER ALUNO) - DELETE /alunos/{id}
// =========================================================

/**
 * Remove um aluno do banco de dados.
 * @param {number} id - ID do aluno a ser excluído.
 */
async function excluirAluno(id) {
    if (!confirm(`Tem certeza que deseja excluir o aluno de ID ${id}?`)) {
        return; // Sai da função se o usuário cancelar
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Erro ao excluir aluno: ${response.statusText}`);
        }

        alert(`Aluno de ID ${id} excluído com sucesso!`);
        carregarAlunos(); // Recarrega a lista

    } catch (error) {
        console.error("Erro na requisição DELETE:", error);
        alert("Ocorreu um erro ao tentar excluir o aluno.");
    }
}

// =========================================================
// 6. INICIALIZAÇÃO
// =========================================================

// Inicia o carregamento da lista de alunos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarAlunos);