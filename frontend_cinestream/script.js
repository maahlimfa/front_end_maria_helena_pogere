const API_URL = 'http://localhost:3000'; // ajuste se sua porta for diferente

// Elementos do DOM
const usuarioSelect = document.getElementById('usuarioSelect');
const filmesContainer = document.getElementById('filmes-container');
const favoritosContainer = document.getElementById('favoritos-container');
const formFilme = document.getElementById('form-filme');

let usuarioLogadoId = null;

// ========== INICIALIZAÇÃO ==========
async function carregarUsuarios() {
  const res = await fetch(`${API_URL}/usuarios`);
  const usuarios = await res.json();
  usuarioSelect.innerHTML = usuarios.map(u =>
    `<option value="${u.id}">${u.nome} (${u.plano})</option>`
  ).join('');
  // Define o primeiro usuário como logado
  usuarioLogadoId = usuarios[0]?.id;
  carregarFilmes();
  carregarFavoritos();
}

// ========== FILMES ==========
async function carregarFilmes() {
  const res = await fetch(`${API_URL}/filmes`);
  const filmes = await res.json();
  filmesContainer.innerHTML = filmes.map(f =>
    `<div class="filme-card">
      <div>
        <strong>${f.titulo}</strong> (${f.ano_lancamento})<br>
        <small>${f.genero}</small>
      </div>
      <div>
        <button onclick="adicionarFavorito(${f.id})">❤️ Favoritar</button>
        <button onclick="deletarFilme(${f.id})">🗑️</button>
      </div>
    </div>`
  ).join('');
}

async function adicionarFilme(e) {
  e.preventDefault();
  const titulo = document.getElementById('titulo').value;
  const genero = document.getElementById('genero').value;
  const ano = parseInt(document.getElementById('ano').value);

  await fetch(`${API_URL}/filmes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, genero, ano_lancamento: ano })
  });
  formFilme.reset();
  carregarFilmes();
}

async function deletarFilme(id) {
  await fetch(`${API_URL}/filmes/${id}`, { method: 'DELETE' });
  carregarFilmes();
  carregarFavoritos(); // pois favoritos podem ser removidos em cascata
}

// ========== FAVORITOS ==========
async function adicionarFavorito(idFilme) {
  if (!usuarioLogadoId) return alert('Nenhum usuário selecionado!');
  await fetch(`${API_URL}/favoritos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_usuario: usuarioLogadoId, id_filme: idFilme })
  });
  carregarFavoritos();
}

async function carregarFavoritos() {
  if (!usuarioLogadoId) return;
  const res = await fetch(`${API_URL}/favoritos/usuario/${usuarioLogadoId}`);
  const data = await res.json();
  favoritosContainer.innerHTML = data.favoritos.map(f =>
    `<div class="favorito-card">
      <strong>${f.titulo}</strong> (${f.ano_lancamento}) - ${f.genero}
    </div>`
  ).join('');
}

// ========== EVENTOS ==========
usuarioSelect.addEventListener('change', (e) => {
  usuarioLogadoId = parseInt(e.target.value);
  carregarFavoritos();
});
formFilme.addEventListener('submit', adicionarFilme);

// Inicializa tudo
carregarUsuarios();