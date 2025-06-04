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

// Scoring Configuration
let scoringConfig = {
    firstQuestion: {
        autoPoints: true,
        pointValue: 4
    },
    middleQuestions: {
        firstPlace: 4,
        secondPlace: 2,
        thirdPlace: 2,
        otherPlace: 1
    },
    lastQuestion: {
        autoPoints: false,
        pointValue: 4
    },
    totalQuestions: 10,
    formats: {
        nextFormat: "♪⁠┌⁠|⁠∵⁠|⁠┘⁠♪ＮＥＸＴ└⁠|⁠∵⁠|⁠┐⁠♪",
        endFormat: "♪⁠┌⁠|⁠∵⁠|⁠┘⁠♪ＥＮＤ└⁠|⁠∵⁠|⁠┐⁠♪"
    }
};

// Score History Tracking
let scoreHistory = [];
let participants = {};
let currentEntries = [];
let questionNumber = 1;

// Settings Management
function saveSettings() {
    scoringConfig.firstQuestion.autoPoints = document.getElementById('firstQuestionAuto').checked;
    scoringConfig.firstQuestion.pointValue = parseInt(document.getElementById('firstQuestionPoints').value);
    
    scoringConfig.middleQuestions.firstPlace = parseInt(document.getElementById('firstPlace').value);
    scoringConfig.middleQuestions.secondPlace = parseInt(document.getElementById('secondPlace').value);
    scoringConfig.middleQuestions.thirdPlace = parseInt(document.getElementById('thirdPlace').value);
    scoringConfig.middleQuestions.otherPlace = parseInt(document.getElementById('otherPlace').value);
    
    scoringConfig.lastQuestion.autoPoints = document.getElementById('lastQuestionAuto').checked;
    scoringConfig.lastQuestion.pointValue = parseInt(document.getElementById('lastQuestionPoints').value);
    
    scoringConfig.totalQuestions = parseInt(document.getElementById('totalQuestions').value);
    
    // Save format settings
    scoringConfig.formats.nextFormat = document.getElementById('nextFormat').value;
    scoringConfig.formats.endFormat = document.getElementById('endFormat').value;
    
    // Save to localStorage
    localStorage.setItem('scoringConfig', JSON.stringify(scoringConfig));
    
    updateScoringPreview();
    updateQuestionNumber(); // Update question display immediately
    showToast('Settings saved successfully!', 'success');
}

function loadSettings() {
    const saved = localStorage.getItem('scoringConfig');
    if (saved) {
        scoringConfig = JSON.parse(saved);
        
        // Ensure formats exist for backward compatibility
        if (!scoringConfig.formats) {
            scoringConfig.formats = {
                nextFormat: "♪⁠┌⁠|⁠∵⁠|⁠┘⁠♪ＮＥＸＴ└⁠|⁠∵⁠|⁠┐⁠♪",
                endFormat: "♪⁠┌⁠|⁠∵⁠|⁠┘⁠♪ＥＮＤ└⁠|⁠∵⁠|⁠┐⁠♪"
            };
        }
    }
    
    // Update form fields
    document.getElementById('firstQuestionAuto').checked = scoringConfig.firstQuestion.autoPoints;
    document.getElementById('firstQuestionPoints').value = scoringConfig.firstQuestion.pointValue;
    
    document.getElementById('firstPlace').value = scoringConfig.middleQuestions.firstPlace;
    document.getElementById('secondPlace').value = scoringConfig.middleQuestions.secondPlace;
    document.getElementById('thirdPlace').value = scoringConfig.middleQuestions.thirdPlace;
    document.getElementById('otherPlace').value = scoringConfig.middleQuestions.otherPlace;
    
    document.getElementById('lastQuestionAuto').checked = scoringConfig.lastQuestion.autoPoints;
    document.getElementById('lastQuestionPoints').value = scoringConfig.lastQuestion.pointValue;
    
    document.getElementById('totalQuestions').value = scoringConfig.totalQuestions;
    
    // Load format settings
    if (document.getElementById('nextFormat')) {
        document.getElementById('nextFormat').value = scoringConfig.formats.nextFormat;
    }
    if (document.getElementById('endFormat')) {
        document.getElementById('endFormat').value = scoringConfig.formats.endFormat;
    }
    
    updateScoringPreview();
}

function updateScoringPreview() {
    const previewFirst = document.getElementById('previewFirst');
    const previewMiddle = document.getElementById('previewMiddle');
    const previewLast = document.getElementById('previewLast');
    
    if (previewFirst) {
        if (scoringConfig.firstQuestion.autoPoints) {
            previewFirst.textContent = `${scoringConfig.firstQuestion.pointValue} points (all participants)`;
        } else {
            previewFirst.textContent = `Normal scoring`;
        }
    }
    
    if (previewMiddle) {
        const { firstPlace, secondPlace, thirdPlace, otherPlace } = scoringConfig.middleQuestions;
        previewMiddle.textContent = `${firstPlace}-${secondPlace}-${thirdPlace}-${otherPlace} points`;
    }
    
    if (previewLast) {
        if (scoringConfig.lastQuestion.autoPoints) {
            previewLast.textContent = `${scoringConfig.lastQuestion.pointValue} points (all participants)`;
        } else {
            previewLast.textContent = `Normal scoring`;
        }
    }
}

// Question Number Management
function updateQuestionNumber() {
    const display = document.getElementById('questionNumberDisplay');
    if (display) {
        if (scoringConfig.totalQuestions > 0) {
            display.textContent = `${questionNumber} of ${scoringConfig.totalQuestions}`;
        } else {
            display.textContent = questionNumber;
        }
    }
}

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

// Enhanced Scoring Logic with Custom Settings
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
    const isFirstQuestion = questionNum === 1;
    const isLastQuestion = scoringConfig.totalQuestions > 0 && questionNum === scoringConfig.totalQuestions;
    
    // First question logic
    if (isFirstQuestion && scoringConfig.firstQuestion.autoPoints) {
        return scoringConfig.firstQuestion.pointValue;
    }
    
    // Last question logic
    if (isLastQuestion && scoringConfig.lastQuestion.autoPoints) {
        return scoringConfig.lastQuestion.pointValue;
    }
    
    // Middle questions or non-auto first/last questions
    const { firstPlace, secondPlace, thirdPlace, otherPlace } = scoringConfig.middleQuestions;
    
    if (position === 0) return firstPlace;
    if (position === 1) return secondPlace;
    if (position === 2) return thirdPlace;
    return otherPlace;
}

// Auto-assign points for special questions
function autoAssignPoints() {
    const isFirstQuestion = questionNumber === 1;
    const isLastQuestion = scoringConfig.totalQuestions > 0 && questionNumber === scoringConfig.totalQuestions;
    
    if ((isFirstQuestion && scoringConfig.firstQuestion.autoPoints) || 
        (isLastQuestion && scoringConfig.lastQuestion.autoPoints)) {
        
        const pointValue = isFirstQuestion ? 
            scoringConfig.firstQuestion.pointValue : 
            scoringConfig.lastQuestion.pointValue;
            
        Object.keys(participants).forEach(name => {
            if (!currentEntries.includes(name)) {
                scoreHistory.push({
                    name: name,
                    points: pointValue,
                    previousTotal: participants[name].total,
                    questionNumber: questionNumber
                });
                
                participants[name].scores.push(pointValue);
                participants[name].total += pointValue;
                currentEntries.push(name);
            }
        });
        
        updateTable();
        showToast(`Auto-assigned ${pointValue} points to all participants!`, 'success');
    }
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

// Enhanced Round Management
function nextQuestion() {
    // Auto-assign points if needed before moving to next question
    autoAssignPoints();
    
    currentEntries = [];
    questionNumber++;
    
    // Update question number display
    updateQuestionNumber();
    
    // Only clear the answer field, keep the topic
    document.getElementById('answerInput').value = '';
    
    // Check if this is beyond the set total questions
    if (scoringConfig.totalQuestions > 0 && questionNumber > scoringConfig.totalQuestions) {
        showToast(`Quiz completed! Total questions: ${scoringConfig.totalQuestions}`, 'success');
    } else {
        showToast(`Now recording responses for Question ${questionNumber}`, 'info');
    }
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

// Enhanced Clipboard Function with Custom Format
// Enhanced Clipboard Function with Custom Format and Total Scores
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

    // Determine if this is the last question
    const isLastQuestion = scoringConfig.totalQuestions > 0 && questionNumber >= scoringConfig.totalQuestions;
    const formatText = isLastQuestion ? scoringConfig.formats.endFormat : scoringConfig.formats.nextFormat;

    // Add total scores section if it's the last question
    let totalScoresSection = '';
    if (isLastQuestion) {
        const sortedParticipants = Object.entries(participants)
            .sort((a, b) => b[1].total - a[1].total);
        
        totalScoresSection = `\n\nFinal Scores:\n${sortedParticipants.map(([name, data], index) => {
            const rank = index + 1;
            let rankEmoji = '';
            if (rank === 1) rankEmoji = '🥇';
            else if (rank === 2) rankEmoji = '🥈';
            else if (rank === 3) rankEmoji = '🥉';
            else rankEmoji = `${rank}.`;
            
            return `${rankEmoji} ${name}: ${data.total} points`;
        }).join('\n')}`;
    }

    // Create the formatted output
    const formattedOutput = `🏐${topic}🟠
Answer: ${answer}

Tally: 

${participantRecords}${totalScoresSection}

${formatText}`;

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

// Settings Modal Event Listeners
function initializeSettingsListeners() {
    // Add event listeners for real-time preview updates
    const settingsInputs = [
        'firstQuestionAuto', 'firstQuestionPoints',
        'firstPlace', 'secondPlace', 'thirdPlace', 'otherPlace',
        'lastQuestionAuto', 'lastQuestionPoints', 'totalQuestions',
        'nextFormat', 'endFormat'
    ];
    
    settingsInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateScoringPreview);
            element.addEventListener('input', updateScoringPreview);
        }
    });
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

    // Load scoring settings
    loadSettings();
    
    // Initialize settings event listeners
    initializeSettingsListeners();
    
    // Update question number display
    updateQuestionNumber();

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
