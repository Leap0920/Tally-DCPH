// Theme Management - Fixed to target document.documentElement instead of body
function toggleTheme() {
    const html = document.documentElement;
    const lightbulb = document.querySelector('.lightbulb');
    
    if (html.getAttribute('data-theme') === 'dark') {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (lightbulb) {
            lightbulb.classList.remove('bi-moon');
            lightbulb.classList.add('bi-lightbulb');
        }
    } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (lightbulb) {
            lightbulb.classList.remove('bi-lightbulb');
            lightbulb.classList.add('bi-moon');
        }
    }
}

// Score History Tracking
let scoreHistory = [];
let participants = {};
let currentEntries = [];
let questionNumber = 1;

// Participant Management
function addParticipant() {
    const name = document.getElementById('participantInput').value.trim();
    if (!name || participants[name]) {
        if (participants[name]) {
            showToast('Participant already exists!', 'warning');
        }
        return;
    }

    participants[name] = {
        scores: [],
        total: 0
    };

    createParticipantButton(name);
    document.getElementById('participantInput').value = '';
    updateTable();
    showToast(`${name} added successfully!`, 'success');
}

function createParticipantButton(name) {
    const btn = document.createElement('button');
    btn.className = 'btn participant-btn w-100 mb-2 text-start';
    btn.innerHTML = `<i class="bi bi-person me-2"></i>${name}`;
    btn.onclick = () => addToRound(name);
    document.getElementById('participantList').appendChild(btn);
}

// Scoring Logic
function addToRound(name) {
    if (currentEntries.includes(name)) {
        showToast('This participant already answered this question!', 'warning');
        return;
    }

    const position = currentEntries.length;
    currentEntries.push(name);
    
    const points = calculatePoints(position, questionNumber);
    
    // Record score change
    scoreHistory.push({
        name: name,
        points: points,
        previousTotal: participants[name].total,
        questionNumber: questionNumber
    });
    
    participants[name].scores.push(points);
    participants[name].total += points;
    
    updateTable();
    showToast(`${name} scored ${points} points!`, 'info');
}

function calculatePoints(position, questionNum) {
    // For question 1, everyone gets 4 points
    if (questionNum === 1) {
        return 4;
    }
    
    // For question 2 onwards, use 4-2-2-1 scoring
    if (position === 0) return 4;  // First answer gets 4 points
    if (position <= 2) return 2;   // Second and third answers get 2 points
    return 1;                      // All other answers get 1 point
}

// Undo Functionality
function undoDelete() {
    if (scoreHistory.length > 0) {
        const lastAction = scoreHistory.pop();
        const participant = participants[lastAction.name];
        
        if (participant) {
            participant.total = lastAction.previousTotal;
            participant.scores.pop();
            
            if (questionNumber === lastAction.questionNumber) {
                const index = currentEntries.indexOf(lastAction.name);
                if (index > -1) currentEntries.splice(index, 1);
            }
            
            updateTable();
            showToast(`Undid ${lastAction.points} point(s) for ${lastAction.name}`, 'success');
        }
    } else {
        showToast("No score changes to undo", 'warning');
    }
}

// Round Management
function nextQuestion() {
    currentEntries = [];
    questionNumber++;
    
    // Only clear the answer field, keep the topic
    document.getElementById('answerInput').value = '';
    
    showToast(`Now recording responses for Question ${questionNumber}`, 'info');
}

// UI Updates
function updateTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    const sortedParticipants = Object.entries(participants)
        .sort((a, b) => b[1].total - a[1].total);
    
    sortedParticipants.forEach(([name, data], index) => {
        const row = document.createElement('tr');
        const rank = index + 1;
        const rankBadge = getRankBadge(rank);
        
        row.innerHTML = `
            <td>${rankBadge}</td>
            <td><strong>${name}</strong></td>
            <td><code>${data.scores.join(' + ')}</code></td>
            <td><span class="badge bg-primary fs-6">${data.total}</span></td>
        `;
        
        // Add animation for recent updates
        if (scoreHistory.length > 0 && scoreHistory[scoreHistory.length - 1].name === name) {
            row.classList.add('score-updated');
        }
        
        tbody.appendChild(row);
    });
}

function getRankBadge(rank) {
    let badgeClass = 'badge rank-badge ';
    let icon = '';
    
    switch(rank) {
        case 1:
            badgeClass += 'rank-1';
            icon = '<i class="bi bi-trophy-fill me-1"></i>';
            break;
        case 2:
            badgeClass += 'rank-2';
            icon = '<i class="bi bi-award-fill me-1"></i>';
            break;
        case 3:
            badgeClass += 'rank-3';
            icon = '<i class="bi bi-award me-1"></i>';
            break;
        default:
            badgeClass = 'badge bg-secondary';
    }
    
    return `<span class="${badgeClass}">${icon}${rank}</span>`;
}

// Toast Notifications - Fixed positioning for navbar
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        toastContainer.style.marginTop = '80px'; // Account for fixed navbar
        document.body.appendChild(toastContainer);
    }

    const toastId = 'toast-' + Date.now();
    const bgClass = {
        'success': 'bg-success',
        'warning': 'bg-warning',
        'danger': 'bg-danger',
        'info': 'bg-info'
    }[type] || 'bg-info';

    const toastHTML = `
        <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Clipboard Function with Custom Format
function copyRecords() {
    const topic = document.getElementById('topicInput')?.value.trim() || "Quiz Topic";
    const answer = document.getElementById('answerInput')?.value.trim() || "Quiz Answer";
    
    // Format participant records
    const participantRecords = Object.entries(participants)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([name, data]) => {
            const scoreBreakdown = data.scores.length > 0 ? data.scores.join('+') : '0';
            return `${name}: ${scoreBreakdown}`;
        })
        .join('\n');

    // Create the formatted output
    const formattedOutput = `🏐${topic}🟠
Answer: ${answer}

Tally: 

${participantRecords}

♪⁠┌⁠|⁠∵⁠|⁠┘⁠♪ＮＥＸＴ└⁠|⁠∵⁠|⁠┐⁠♪`;

    navigator.clipboard.writeText(formattedOutput)
        .then(() => {
            showToast('Records copied to clipboard with custom format!', 'success');
            document.getElementById('answerInput').value = '';
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            showToast('Failed to copy records', 'danger');
        });
}

// Delete Participant Function
function deleteParticipant() {
    const name = prompt("Enter participant name to delete:");
    if (name && participants[name]) {
        delete participants[name];
        
        // Remove button from participant list
        const buttons = document.querySelectorAll('.participant-btn');
        buttons.forEach(btn => {
            if (btn.textContent.trim().includes(name)) {
                btn.remove();
            }
        });
        
        updateTable();
        showToast(`${name} has been deleted`, 'success');
    } else if (name) {
        showToast('Participant not found', 'warning');
    }
}

// Navigation and Theme Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme - Fixed to use documentElement
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    const lightbulb = document.querySelector('.lightbulb');
    
    if (savedTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        if (lightbulb) {
            lightbulb.classList.remove('bi-lightbulb');
            lightbulb.classList.add('bi-moon');
        }
    }

    // Add Enter key support for participant input
    const participantInput = document.getElementById('participantInput');
    if (participantInput) {
        participantInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addParticipant();
            }
        });
    }
    
    // Set active navigation state
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === 'Tally.html' && href === 'Tally.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Ensure home button functionality
    const homeLinks = document.querySelectorAll('a[href="index.html"], .navbar-brand');
    homeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Allow normal navigation to index.html
            console.log('Navigating to home page');
        });
    });
});
