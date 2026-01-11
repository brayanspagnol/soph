let clickCount = 0;
const maxJumps = 4;
const button = document.getElementById('yesButton');
const noButton = document.getElementById('noButton');
let isReady = false;
let jumpTimeout = null;
let originalButtonPosition = null;
let noButtonOriginalPosition = null;

// Posições fixas para os pulos (mais extremas e interessantes)
const jumpPositions = [
    { x: 0.8, y: 0.2 },   // Canto superior direito
    { x: 0.15, y: 0.8 },  // Canto inferior esquerdo
    { x: 0.75, y: 0.7 },  // Direita embaixo
    { x: 0.2, y: 0.3 }    // Esquerda em cima
];

// Garante que o botão NÃO nunca se mova
function lockNoButton() {
    if (noButton) {
        const rect = noButton.getBoundingClientRect();
        noButtonOriginalPosition = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };
        
        noButton.style.position = 'relative !important';
        noButton.style.left = '0';
        noButton.style.top = '0';
        noButton.style.transform = 'none';
    }
}

// Chama ao carregar
window.addEventListener('DOMContentLoaded', lockNoButton);

// Respostas corretas
const correctAnswers = {
    firstName: 'sophia',
    hobby: 'bonecas',
    singer: 'mitski',
    beautyLevel: 99999999999999999
};

// Dicas
const hints = {
    hobby: '💡 Dica: É algo que tu adora gastar dinheiro toda semana...',
    singer: '💡 Dica: Uma artista indie japonesa que fica caindo da parade do seu quarto'
};

// Configuração dos post-its
const postitsConfig = [
    {
        id: 'firstName',
        question: '1 - Primeiro Nome',
        color: 'yellow',
        type: 'text'
    },
    {
        id: 'hobby',
        question: '2 - Hobbie Favorito',
        color: 'pink',
        type: 'text',
        hasHint: true
    },
    {
        id: 'singer',
        question: '3 - Cantora Favorita',
        color: 'blue',
        type: 'text',
        hasHint: true
    },
    {
        id: 'beautyLevel',
        question: '4 - Nível de Boniteza',
        color: 'green',
        type: 'number'
    }
];

// Removido: não foge mais ao passar o mouse, só ao clicar

// Handler para o botão NÃO
noButton.addEventListener('click', function() {
    if (!noButton.disabled) {
        handleNoClick();
    }
});

button.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Não faz nada se o botão está se movendo
    if (button.classList.contains('jumping') || button.style.pointerEvents === 'none') {
        return;
    }
    
    if (!isReady) {
        // Botão foge ao clicar
        handleJump();
    } else {
        // Se está pronto e no estado "Quase lá!", abre o envelope
        if (clickCount === 4 && (button.textContent.includes('lá') || button.textContent.includes('Quase'))) {
            openEnvelope();
        }
    }
});

function handleNoClick() {
    // Garante que o botão NÃO não se move
    lockNoButton();
    
    // Adiciona animação de shake
    noButton.classList.add('angry');
    
    // Muda o texto do botão para incluir a mensagem
    noButton.innerHTML = 'NÃO 😠<br><span class="button-warning">Não é recusável</span>';
    noButton.disabled = true;
    
    // Remove a animação após terminar
    setTimeout(() => {
        noButton.classList.remove('angry');
        // Garante novamente que não se moveu
        lockNoButton();
    }, 500);
}

function handleJump() {
    if (clickCount < maxJumps) {
        clickCount++;
        
        // Salva a posição original no primeiro clique
        if (clickCount === 1 && !originalButtonPosition) {
            const rect = button.getBoundingClientRect();
            originalButtonPosition = {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            };
        }
        
        // No quarto clique (após 3 pulos), volta para posição original e muda texto
        if (clickCount === 4) {
            button.classList.remove('jumping', 'moving');
            
            // Volta para o container original
            const envelopeButtons = document.querySelector('.envelope-buttons');
            if (envelopeButtons && button.parentElement !== envelopeButtons) {
                envelopeButtons.insertBefore(button, envelopeButtons.firstChild);
            }
            
            // Remove todos os estilos inline
            button.style.position = '';
            button.style.left = '';
            button.style.top = '';
            button.style.transform = '';
            button.style.zIndex = '';
            button.style.width = '';
            button.style.minWidth = '';
            button.style.maxWidth = '';
            button.style.transition = '';
            button.style.pointerEvents = 'auto';
            button.style.cursor = 'pointer';
            button.style.opacity = '1';
            button.style.visibility = 'visible';
            button.style.display = '';
            
            button.textContent = 'Quase lá! 😅';
            button.removeAttribute('data-long-text');
            isReady = true;
            lockNoButton();
            return;
        }
        
        // Calcula nova posição baseada em porcentagem da viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const buttonWidth = button.offsetWidth || 100;
        const buttonHeight = button.offsetHeight || 40;
        
        // Usa posições fixas baseadas em porcentagem
        const pos = jumpPositions[clickCount - 1];
        const targetX = (viewportWidth * pos.x);
        const targetY = (viewportHeight * pos.y);
        
        // Garante que fica dentro da tela
        const margin = 20;
        const finalX = Math.max(margin, Math.min(targetX, viewportWidth - buttonWidth - margin));
        const finalY = Math.max(margin, Math.min(targetY, viewportHeight - buttonHeight - margin));
        
        // Move o botão para o body se ainda não estiver lá
        if (button.parentElement !== document.body) {
            document.body.appendChild(button);
        }
        
        // Aplica estilos de posicionamento fixo
        button.classList.add('jumping', 'moving');
        button.style.position = 'fixed';
        button.style.left = finalX + 'px';
        button.style.top = finalY + 'px';
        button.style.transform = 'none';
        button.style.zIndex = '99999';
        button.style.width = buttonWidth + 'px';
        button.style.pointerEvents = 'none';
        button.style.opacity = '1';
        button.style.visibility = 'visible';
        button.style.display = 'block';
        
        // Muda o texto APENAS no segundo clique
        if (clickCount === 2) {
            setTimeout(() => {
                button.textContent = 'SIM';
                button.setAttribute('data-long-text', 'true');
            }, 400);
        } else if (clickCount === 3) {
            // Volta para "SIM" no terceiro clique
            setTimeout(() => {
                button.textContent = 'SIM';
                button.removeAttribute('data-long-text');
            }, 400);
        }
        
        // Reabilita clique após animação
        setTimeout(() => {
            button.classList.remove('jumping');
            button.style.pointerEvents = 'auto';
            button.style.cursor = 'pointer';
            lockNoButton();
        }, 500);
    }
}

function openEnvelope() {
    const introContainer = document.getElementById('introContainer');
    const letterContainer = document.getElementById('letterContainer');
    const envelope = document.getElementById('envelope');
    
    // Adiciona classe "open" e remove "close" (estilo Valentine's Card)
    envelope.classList.add('open');
    envelope.classList.remove('close');
    
    // Esconde a pergunta e botões gradualmente
    setTimeout(() => {
        const envelopeQuestion = document.querySelector('.envelope-question');
        const envelopeButtons = document.querySelector('.envelope-buttons');
        if (envelopeQuestion) {
            envelopeQuestion.style.opacity = '0';
            envelopeQuestion.style.transition = 'opacity 0.3s ease';
        }
        if (envelopeButtons) {
            envelopeButtons.style.opacity = '0';
            envelopeButtons.style.transition = 'opacity 0.3s ease';
        }
    }, 100);
    
    // Mostra a carta com post-its (após a tampa abrir)
    setTimeout(() => {
        introContainer.style.opacity = '0';
        introContainer.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            introContainer.classList.add('hidden');
            letterContainer.classList.remove('hidden');
            
            // Cria os post-its após a carta aparecer
            setTimeout(() => {
                createPostits();
            }, 500);
        }, 300);
    }, 600);
}

function createPostits() {
    const postitsContainer = document.getElementById('postitsContainer');
    postitsContainer.innerHTML = '';
    
    postitsConfig.forEach((config, index) => {
        const postit = document.createElement('div');
        postit.className = `postit ${config.color}`;
        postit.id = `postit-${config.id}`;
        
        // Apenas o primeiro post-it começa ativo
        if (index === 0) {
            postit.classList.add('active');
        }
        
        postit.innerHTML = `
            <h3>${config.question}</h3>
            <input 
                type="${config.type}" 
                id="${config.id}" 
                name="${config.id}" 
                ${config.type === 'number' ? 'min="1"' : ''}
                ${index === 0 ? '' : 'disabled'}
                required
            />
            <span class="error-message" id="${config.id}Error"></span>
            ${config.hasHint ? `<span class="hint-message" id="${config.id}Hint"></span>` : ''}
        `;
        
        postitsContainer.appendChild(postit);
        
        // Adiciona listener para validação individual
        const input = postit.querySelector('input');
        input.addEventListener('blur', function() {
            // Só valida se o post-it estiver ativo
            if (postit.classList.contains('active')) {
                validatePostit(config.id);
            }
        });
        
        // Validação ao pressionar Enter
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && postit.classList.contains('active')) {
                validatePostit(config.id);
            }
        });
    });
    
    // Foca no primeiro input
    setTimeout(() => {
        const firstInput = document.getElementById(postitsConfig[0].id);
        if (firstInput) firstInput.focus();
    }, 100);
}

function validatePostit(postitId) {
    const input = document.getElementById(postitId);
    const postit = document.getElementById(`postit-${postitId}`);
    const errorElement = document.getElementById(`${postitId}Error`);
    const hintElement = document.getElementById(`${postitId}Hint`);
    
    let value = input.value.trim().toLowerCase();
    if (postitId === 'beautyLevel') {
        value = parseInt(value);
    }
    
    // Limpa mensagens
    if (errorElement) errorElement.textContent = '';
    if (hintElement) hintElement.textContent = '';
    input.classList.remove('error');
    
    let isCorrect = false;
    
    // Valida primeiro nome
    if (postitId === 'firstName') {
        if (value === correctAnswers.firstName) {
            isCorrect = true;
        } else {
            errorElement.textContent = 'Resposta incorreta! Tente novamente.';
            input.classList.add('error');
        }
    }
    
    // Valida hobbie
    if (postitId === 'hobby') {
        if (value === correctAnswers.hobby) {
            isCorrect = true;
        } else {
            errorElement.textContent = 'Resposta incorreta!';
            if (hintElement) hintElement.textContent = hints.hobby;
            input.classList.add('error');
        }
    }
    
    // Valida cantora
    if (postitId === 'singer') {
        if (value === correctAnswers.singer) {
            isCorrect = true;
        } else {
            errorElement.textContent = 'Resposta incorreta!';
            if (hintElement) hintElement.textContent = hints.singer;
            input.classList.add('error');
        }
    }
    
    // Valida nível de boniteza
    if (postitId === 'beautyLevel') {
        if (value === correctAnswers.beautyLevel) {
            isCorrect = true;
        } else {
            errorElement.textContent = 'Sua resposta tá errada, deixa que essa eu arrumo pra você 😊';
            input.classList.add('error');
            
            setTimeout(() => {
                input.value = correctAnswers.beautyLevel;
                errorElement.textContent = 'Pronto! Agora está correto! Você é perfeita! 💕';
                input.classList.remove('error');
                
                setTimeout(() => {
                    errorElement.textContent = '';
                    isCorrect = true;
                    removePostit(postitId);
                }, 2000);
            }, 1500);
            return; // Retorna aqui para não remover o post-it ainda
        }
    }
    
    // Se correto, remove o post-it
    if (isCorrect) {
        setTimeout(() => {
            removePostit(postitId);
        }, 500);
    }
}

function removePostit(postitId) {
    const postit = document.getElementById(`postit-${postitId}`);
    if (postit) {
        postit.classList.add('correct');
        postit.classList.remove('active');
        
        // Após a animação de saída, remove o post-it e mostra o próximo
        setTimeout(() => {
            postit.remove();
            
            // Ativa o próximo post-it na pilha
            const remainingPostits = document.querySelectorAll('.postit:not(.correct)');
            if (remainingPostits.length > 0) {
                const nextPostit = remainingPostits[0];
                nextPostit.classList.add('active');
                
                // Habilita o input do próximo post-it
                const nextInput = nextPostit.querySelector('input');
                if (nextInput) {
                    nextInput.disabled = false;
                    nextInput.focus();
                }
            } else {
                // Todos os post-its foram respondidos
                checkAllAnswered();
            }
        }, 600);
    }
}

function checkAllAnswered() {
    const remainingPostits = document.querySelectorAll('.postit').length;
    if (remainingPostits === 0) {
        setTimeout(() => {
            showBouquet();
        }, 500);
    }
}

function showBouquet() {
    const letterContainer = document.getElementById('letterContainer');
    const flowersContainer = document.getElementById('flowersContainer');

    // Esconde a carta
    letterContainer.style.opacity = '0';
    letterContainer.style.transform = 'translate(-50%, -50%) scale(0.9)';
    letterContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

    setTimeout(() => {
        letterContainer.classList.add('hidden');
        flowersContainer.classList.remove('hidden');
        
        // Transição do fundo rosa para escuro
        document.body.style.transition = 'background 2s ease';
        document.body.style.background = '#000';
        
        // Força reflow para garantir que a transição ocorra
        flowersContainer.offsetHeight; 
        flowersContainer.classList.add('show');
        
        // Ativa as animações das flores após 500ms
        setTimeout(() => {
            const flowersContainerElement = document.querySelector('.flowers-container');
            if (flowersContainerElement) {
                flowersContainerElement.classList.remove('container');
            }
            
            // Configura o botão secreto
            setupSecretButton();
        }, 500);
    }, 500); // Espera a carta sumir
}

function setupSecretButton() {
    const secretButton = document.getElementById('secretButton');
    const loveMessage = document.getElementById('loveMessage');
    
    if (!secretButton || !loveMessage) return;
    
    secretButton.addEventListener('click', function() {
        // Esconde o botão com animação
        secretButton.classList.add('hidden');
        
        // Ativa a mensagem de amor
        setTimeout(() => {
            loveMessage.classList.add('active');
        }, 500);
    });
}

function proceedToNext() {
    // Função removida - não é mais necessária
    // O fluxo agora vai direto para openEnvelope
    openEnvelope();
}

function createConfetti() {
    const colors = ['#ff1744', '#ff80ab', '#ffcccb', '#ff5722'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.animation = `fall ${2 + Math.random() * 2}s linear forwards`;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 4000);
    }
}

// Adiciona animação de queda para o confete
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
