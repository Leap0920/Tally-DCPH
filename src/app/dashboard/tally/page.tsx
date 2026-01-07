'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Settings, ChevronLeft, ChevronRight, Plus, Copy, Trash2, Undo2,
    User, Users, Trophy, X, Save, Info, Clock, Power,
    Sliders, History, Loader2, Play, RotateCcw
} from 'lucide-react';
import './tally.css';

// Types
interface Participant {
    scores: number[];
    total: number;
    avatar?: string;
}

interface ScoreHistoryItem {
    name: string;
    points: number;
    previousTotal: number;
    questionNumber: number;
    position: number;
}

interface ScoringConfig {
    firstQuestion: {
        autoPoints: boolean;
        pointValue: number;
    };
    middleQuestions: {
        firstPlace: number;
        secondPlace: number;
        thirdPlace: number;
        otherPlace: number;
    };
    lastQuestion: {
        autoPoints: boolean;
        pointValue: number;
    };
    totalQuestions: number;
    formats: {
        nextFormat: string;
        endFormat: string;
    };
}

interface SessionHistoryItem {
    _id: string;
    topic: string;
    totalQuestions: number;
    participantCount: number;
    winner: string;
    winnerScore: number;
    createdAt: string;
    endedAt: string;
}

export default function TallyPage() {
    // Scoring Configuration
    const [scoringConfig, setScoringConfig] = useState<ScoringConfig>({
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
        totalQuestions: 20,
        formats: {
            nextFormat: "♪⁠┌⁠|⁠∵⁠|⁠┘⁠♪ＮＥＸＴ└⁠|⁠∵⁠|⁠┐⁠♪",
            endFormat: "♪⁠┌⁠|⁠∵⁠|⁠┘⁠♪ＥＮＤ└⁠|⁠∵⁠|⁠┐⁠♪"
        }
    });

    // State
    const [participants, setParticipants] = useState<Record<string, Participant>>({});
    const [questionEntries, setQuestionEntries] = useState<Record<number, string[]>>({});
    const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
    const [scoreHistory, setScoreHistory] = useState<ScoreHistoryItem[]>([]);
    const [questionNumber, setQuestionNumber] = useState(1);
    const [participantInput, setParticipantInput] = useState('');
    const [topicInput, setTopicInput] = useState('');
    const [answerInput, setAnswerInput] = useState('');
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
    const [showStartModal, setShowStartModal] = useState(true);
    const [hasActiveSession, setHasActiveSession] = useState(false);
    const [openedFromStart, setOpenedFromStart] = useState(false);

    // Temp settings for modal
    const [tempConfig, setTempConfig] = useState<ScoringConfig>(scoringConfig);

    // Ref for dropdown and save debounce
    const dropdownRef = useRef<HTMLDivElement>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isInitialLoadRef = useRef(true);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSettingsDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load data from database on mount
    useEffect(() => {
        const loadGameState = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/tally/game');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data._id) {
                        const hasData = Object.keys(data.participants || {}).length > 0 ||
                            (data.questionNumber && data.questionNumber > 1);
                        setHasActiveSession(hasData);
                        setParticipants(data.participants || {});
                        setQuestionEntries(data.questionEntries || {});
                        setQuestionAnswers(data.questionAnswers || {});
                        setScoreHistory(data.scoreHistory || []);
                        setQuestionNumber(data.questionNumber || 1);
                        setTopicInput(data.topic || '');
                        if (data.config) {
                            setScoringConfig(prev => ({ ...prev, ...data.config }));
                            setTempConfig(prev => ({ ...prev, ...data.config }));
                        }
                    }
                }
                // Load session history for start modal
                await loadSessionHistory();
            } catch (error) {
                console.error('Failed to load game state:', error);
            } finally {
                setIsLoading(false);
                isInitialLoadRef.current = false;
            }
        };
        loadGameState();
    }, []);

    // Auto-save to database when state changes
    const saveToDatabase = useCallback(async () => {
        if (isInitialLoadRef.current) return;

        try {
            setIsSaving(true);
            await fetch('/api/tally/game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config: scoringConfig,
                    questionNumber,
                    topic: topicInput,
                    participants,
                    questionEntries,
                    questionAnswers,
                    scoreHistory
                })
            });
        } catch (error) {
            console.error('Failed to save game state:', error);
        } finally {
            setIsSaving(false);
        }
    }, [scoringConfig, questionNumber, topicInput, participants, questionEntries, questionAnswers, scoreHistory]);

    // Debounced save effect
    useEffect(() => {
        if (isInitialLoadRef.current) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveToDatabase();
        }, 1000); // Save after 1 second of inactivity

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [participants, questionEntries, questionAnswers, scoreHistory, questionNumber, topicInput, saveToDatabase]);

    // Load settings from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('scoringConfig');
        if (saved) {
            const parsed = JSON.parse(saved);
            setScoringConfig(parsed);
            setTempConfig(parsed);
        }
    }, []);

    // Initialize question data
    const initializeQuestionData = useCallback(() => {
        setQuestionEntries(prev => {
            if (!prev[questionNumber]) {
                return { ...prev, [questionNumber]: [] };
            }
            return prev;
        });
        setQuestionAnswers(prev => {
            if (!prev[questionNumber]) {
                return { ...prev, [questionNumber]: '' };
            }
            return prev;
        });
    }, [questionNumber]);

    useEffect(() => {
        initializeQuestionData();
    }, [initializeQuestionData]);

    // Show toast notification
    const showToast = (message: string, type: string = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Calculate points based on position and question
    const calculatePoints = (position: number, questionNum: number): number => {
        const isFirstQuestion = questionNum === 1;
        const isLastQuestion = scoringConfig.totalQuestions > 0 && questionNum === scoringConfig.totalQuestions;

        if (isFirstQuestion && scoringConfig.firstQuestion.autoPoints) {
            return scoringConfig.firstQuestion.pointValue;
        }

        if (isLastQuestion && scoringConfig.lastQuestion.autoPoints) {
            return scoringConfig.lastQuestion.pointValue;
        }

        const { firstPlace, secondPlace, thirdPlace, otherPlace } = scoringConfig.middleQuestions;

        if (position === 0) return firstPlace;
        if (position === 1) return secondPlace;
        if (position === 2) return thirdPlace;
        return otherPlace;
    };

    // Add participant
    const addParticipant = () => {
        const name = participantInput.trim();
        if (!name || participants[name]) {
            if (participants[name]) {
                showToast(`${name} is already a participant!`, 'warning');
            }
            return;
        }

        setParticipants(prev => ({
            ...prev,
            [name]: { scores: [], total: 0 }
        }));
        setParticipantInput('');
        showToast(`${name} added successfully!`, 'success');
    };

    // Add to round (when clicking participant button)
    const addToRound = (name: string) => {
        const currentEntries = questionEntries[questionNumber] || [];

        if (currentEntries.includes(name)) {
            showToast('This participant already answered this question!', 'warning');
            return;
        }

        const position = currentEntries.length;
        const points = calculatePoints(position, questionNumber);

        // Update question entries
        setQuestionEntries(prev => ({
            ...prev,
            [questionNumber]: [...(prev[questionNumber] || []), name]
        }));

        // Update score history
        setScoreHistory(prev => [...prev, {
            name,
            points,
            previousTotal: participants[name]?.total || 0,
            questionNumber,
            position
        }]);

        // Update participant scores
        setParticipants(prev => {
            const participant = prev[name];
            const newScores = [...participant.scores];

            while (newScores.length < questionNumber) {
                newScores.push(0);
            }

            const previousQuestionScore = newScores[questionNumber - 1] || 0;
            newScores[questionNumber - 1] = points;

            return {
                ...prev,
                [name]: {
                    scores: newScores,
                    total: participant.total - previousQuestionScore + points
                }
            };
        });

        showToast(`${name} scored ${points} points!`, 'info');
    };

    // Auto-assign points for special questions
    const autoAssignPoints = () => {
        const isFirstQuestion = questionNumber === 1;
        const isLastQuestion = scoringConfig.totalQuestions > 0 && questionNumber === scoringConfig.totalQuestions;

        if ((isFirstQuestion && scoringConfig.firstQuestion.autoPoints) ||
            (isLastQuestion && scoringConfig.lastQuestion.autoPoints)) {

            const currentEntries = questionEntries[questionNumber] || [];
            const pointValue = isFirstQuestion
                ? scoringConfig.firstQuestion.pointValue
                : scoringConfig.lastQuestion.pointValue;

            const participantsToAssign = Object.keys(participants).filter(name => !currentEntries.includes(name));

            if (participantsToAssign.length === 0) return;

            setQuestionEntries(prev => ({
                ...prev,
                [questionNumber]: [...(prev[questionNumber] || []), ...participantsToAssign]
            }));

            setScoreHistory(prev => [
                ...prev,
                ...participantsToAssign.map(name => ({
                    name,
                    points: pointValue,
                    previousTotal: participants[name]?.total || 0,
                    questionNumber,
                    position: currentEntries.length + participantsToAssign.indexOf(name)
                }))
            ]);

            setParticipants(prev => {
                const updated = { ...prev };
                participantsToAssign.forEach(name => {
                    const participant = updated[name];
                    const newScores = [...participant.scores];

                    while (newScores.length < questionNumber) {
                        newScores.push(0);
                    }

                    newScores[questionNumber - 1] = pointValue;

                    updated[name] = {
                        scores: newScores,
                        total: participant.total + pointValue
                    };
                });
                return updated;
            });

            showToast(`Auto-assigned ${pointValue} points to ${participantsToAssign.length} participant(s)!`, 'success');
        }
    };

    // Previous question
    const previousQuestion = () => {
        if (questionNumber <= 1) {
            showToast('Already at the first question!', 'warning');
            return;
        }

        setQuestionAnswers(prev => ({
            ...prev,
            [questionNumber]: answerInput
        }));

        setQuestionNumber(prev => prev - 1);
        setAnswerInput(questionAnswers[questionNumber - 1] || '');
        showToast(`Moved to Question ${questionNumber - 1}`, 'info');
    };

    // Next question
    const nextQuestion = () => {
        autoAssignPoints();

        setQuestionAnswers(prev => ({
            ...prev,
            [questionNumber]: answerInput
        }));

        setQuestionNumber(prev => prev + 1);
        setAnswerInput(questionAnswers[questionNumber + 1] || '');

        if (scoringConfig.totalQuestions > 0 && questionNumber >= scoringConfig.totalQuestions) {
            showToast(`Quiz completed! Total questions: ${scoringConfig.totalQuestions}`, 'success');
        } else {
            showToast(`Now recording responses for Question ${questionNumber + 1}`, 'info');
        }
    };

    // Undo last action
    const undoDelete = () => {
        const historyForQuestion = scoreHistory.filter(h => h.questionNumber === questionNumber);

        if (historyForQuestion.length === 0) {
            showToast('No score changes to undo for this question', 'warning');
            return;
        }

        const lastAction = historyForQuestion[historyForQuestion.length - 1];

        setScoreHistory(prev => {
            const newHistory = [...prev];
            const index = newHistory.findLastIndex(h =>
                h.questionNumber === questionNumber && h.name === lastAction.name
            );
            if (index > -1) newHistory.splice(index, 1);
            return newHistory;
        });

        setQuestionEntries(prev => {
            const entries = [...(prev[questionNumber] || [])];
            const index = entries.indexOf(lastAction.name);
            if (index > -1) entries.splice(index, 1);
            return { ...prev, [questionNumber]: entries };
        });

        setParticipants(prev => {
            const participant = prev[lastAction.name];
            if (!participant) return prev;

            const newScores = [...participant.scores];
            newScores[questionNumber - 1] = 0;

            return {
                ...prev,
                [lastAction.name]: {
                    scores: newScores,
                    total: lastAction.previousTotal
                }
            };
        });

        showToast(`Undid ${lastAction.name}'s score for Question ${questionNumber}`, 'warning');
    };

    // Copy records to clipboard
    const copyRecords = () => {
        const topic = topicInput || "Quiz Topic";
        const answer = answerInput || "Quiz Answer";

        const participantRecords = Object.entries(participants)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([name, data]) => {
                const filteredScores = data.scores.filter(score => score !== 0 && score !== undefined);
                const scoreBreakdown = filteredScores.length > 0 ? filteredScores.join('+') : '0';
                return `${name}: ${scoreBreakdown}`;
            })
            .join('\n');

        const isLastQuestion = scoringConfig.totalQuestions > 0 && questionNumber >= scoringConfig.totalQuestions;
        const formatText = isLastQuestion ? scoringConfig.formats.endFormat : scoringConfig.formats.nextFormat;

        let totalScoresSection = '';
        if (isLastQuestion) {
            const sortedParticipants = Object.entries(participants)
                .sort((a, b) => b[1].total - a[1].total);

            totalScoresSection = `\n\nFinal Scores:\n${sortedParticipants.map(([name, data], index) => {
                let rankEmoji = '';
                if (index === 0) rankEmoji = '🥇';
                else if (index === 1) rankEmoji = '🥈';
                else if (index === 2) rankEmoji = '🥉';
                else rankEmoji = `${index + 1}.`;
                return `${rankEmoji} ${name}: ${data.total} points`;
            }).join('\n')}`;
        }

        const formattedOutput = `${topic}
Answer: ${answer}

Tally: 

${participantRecords}${totalScoresSection}

${formatText}`;

        navigator.clipboard.writeText(formattedOutput)
            .then(() => {
                showToast('Records copied to clipboard!', 'success');
                setAnswerInput('');
            })
            .catch(() => showToast('Failed to copy records', 'danger'));
    };

    // Delete participant
    const deleteParticipant = () => {
        const name = prompt("Enter participant name to delete:");
        if (name && participants[name]) {
            setParticipants(prev => {
                const newParticipants = { ...prev };
                delete newParticipants[name];
                return newParticipants;
            });

            setQuestionEntries(prev => {
                const newEntries = { ...prev };
                Object.keys(newEntries).forEach(qNum => {
                    const entries = newEntries[parseInt(qNum)];
                    const index = entries.indexOf(name);
                    if (index > -1) entries.splice(index, 1);
                });
                return newEntries;
            });

            showToast(`${name} has been deleted`, 'warning');
        } else if (name) {
            showToast(`${name} not found`, 'danger');
        }
    };

    // Save settings
    const saveSettings = () => {
        setScoringConfig(tempConfig);
        localStorage.setItem('scoringConfig', JSON.stringify(tempConfig));
        closePreferencesModal();
        showToast('Settings saved successfully!', 'success');
    };

    // Close preferences modal (return to start if needed)
    const closePreferencesModal = () => {
        setShowPreferencesModal(false);
        if (openedFromStart) {
            setShowStartModal(true);
            setOpenedFromStart(false);
        }
    };

    // Close history modal (return to start if needed)
    const closeHistoryModal = () => {
        setShowHistoryModal(false);
        if (openedFromStart) {
            setShowStartModal(true);
            setOpenedFromStart(false);
        }
    };

    // Load session history
    const loadSessionHistory = async () => {
        try {
            const response = await fetch('/api/tally/history');
            if (response.ok) {
                const data = await response.json();
                setSessionHistory(data);
            }
        } catch (error) {
            console.error('Failed to load session history:', error);
            showToast('Failed to load session history', 'danger');
        }
    };

    // Open session history modal
    const openSessionHistory = () => {
        setShowSettingsDropdown(false);
        loadSessionHistory();
        setShowHistoryModal(true);
    };

    // Load a historical session
    const loadHistoricalSession = async (sessionId: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/tally/history/${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                // Load the historical data into current state
                setParticipants(data.participants || {});
                setQuestionEntries(data.questionEntries || {});
                setQuestionAnswers(data.questionAnswers || {});
                setScoreHistory(data.scoreHistory || []);
                setQuestionNumber(data.questionNumber || 1);
                setTopicInput(data.topic || '');
                if (data.config) {
                    setScoringConfig(prev => ({ ...prev, ...data.config }));
                    setTempConfig(prev => ({ ...prev, ...data.config }));
                }
                setHasActiveSession(true);
                setShowHistoryModal(false);
                setShowStartModal(false);
                showToast('Session loaded successfully!', 'success');

                // Save loaded data as new active session
                await fetch('/api/tally/game', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        config: data.config || scoringConfig,
                        questionNumber: data.questionNumber || 1,
                        topic: data.topic || '',
                        participants: data.participants || {},
                        questionEntries: data.questionEntries || {},
                        questionAnswers: data.questionAnswers || {},
                        scoreHistory: data.scoreHistory || []
                    })
                });
            }
        } catch (error) {
            console.error('Failed to load historical session:', error);
            showToast('Failed to load session', 'danger');
        } finally {
            setIsLoading(false);
        }
    };

    // Start new session
    const startNewSession = async () => {
        try {
            // End any existing session first
            await fetch('/api/tally/game', { method: 'DELETE' });

            // Reset local state
            setParticipants({});
            setQuestionEntries({});
            setQuestionAnswers({});
            setScoreHistory([]);
            setQuestionNumber(1);
            setTopicInput('');
            setAnswerInput('');
            setHasActiveSession(true);
            setShowStartModal(false);

            showToast('New session started!', 'success');
        } catch (error) {
            console.error('Failed to start new session:', error);
        }
    };

    // Continue current session
    const continueSession = () => {
        setShowStartModal(false);
    };

    // End session
    const endSession = async () => {
        if (confirm('Are you sure you want to end the session? This will save the session to history and start a new one.')) {
            try {
                // End current session in database
                await fetch('/api/tally/game', { method: 'DELETE' });

                // Reset local state
                setParticipants({});
                setQuestionEntries({});
                setQuestionAnswers({});
                setScoreHistory([]);
                setQuestionNumber(1);
                setTopicInput('');
                setAnswerInput('');
                setHasActiveSession(false);

                // Reload history and show start modal
                await loadSessionHistory();
                setShowStartModal(true);

                showToast('Session ended and saved to history.', 'success');
            } catch (error) {
                console.error('Failed to end session:', error);
                showToast('Failed to end session', 'danger');
            }
        }
    };

    // Sorted participants for display
    const sortedParticipants = Object.entries(participants)
        .sort((a, b) => b[1].total - a[1].total);

    const currentEntries = questionEntries[questionNumber] || [];

    return (
        <div className="tally-container">
            {/* Toast Notification */}
            {toast && (
                <div className={`tally-toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <header className="tally-header">
                <div className="header-left">
                    <span className="header-label">TALLY SYSTEM</span>
                    <h1 className="header-title">DC <span className="text-gradient">Class</span></h1>
                </div>
                <div className="header-right" ref={dropdownRef}>
                    <button
                        className="settings-btn"
                        onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                    >
                        <Settings size={18} />
                        <span>Settings</span>
                    </button>
                    {showSettingsDropdown && (
                        <div className="settings-dropdown">
                            <button onClick={() => { setShowPreferencesModal(true); setShowSettingsDropdown(false); setTempConfig(scoringConfig); }}>
                                <Sliders size={16} />
                                <span>Preferences</span>
                            </button>
                            <button onClick={openSessionHistory}>
                                <History size={16} />
                                <span>Session History</span>
                            </button>
                            <button className="danger" onClick={() => { endSession(); setShowSettingsDropdown(false); }}>
                                <Power size={16} />
                                <span>End Session</span>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Question Number Display */}
            <div className="question-display">
                <Info size={18} />
                <span>Question <strong>{questionNumber}</strong> <span className="question-total">/ {scoringConfig.totalQuestions}</span></span>
            </div>

            {/* Control Panel */}
            <div className="control-panel">
                <div className="control-inputs">
                    <div className="input-group">
                        <label>TOPIC</label>
                        <input
                            type="text"
                            value={topicInput}
                            onChange={e => setTopicInput(e.target.value)}
                            placeholder="Enter topic"
                            className="tally-input"
                        />
                    </div>
                    <div className="input-group">
                        <label>ANSWER</label>
                        <input
                            type="text"
                            value={answerInput}
                            onChange={e => setAnswerInput(e.target.value)}
                            placeholder="Enter answer"
                            className="tally-input"
                        />
                    </div>
                    <div className="input-group">
                        <label>ADD PARTICIPANT</label>
                        <div className="input-with-button">
                            <input
                                type="text"
                                value={participantInput}
                                onChange={e => setParticipantInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addParticipant()}
                                placeholder="Enter name"
                                className="tally-input"
                            />
                            <button className="btn-add" onClick={addParticipant}>
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="control-buttons">
                    <button className="btn btn-secondary" onClick={previousQuestion}>
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <button className="btn btn-primary" onClick={nextQuestion}>
                        Next <ChevronRight size={16} />
                    </button>
                    <button className="btn btn-info" onClick={copyRecords}>
                        <Copy size={16} /> Copy
                    </button>
                    <button className="btn btn-danger" onClick={deleteParticipant}>
                        <Trash2 size={16} /> Delete
                    </button>
                    <button className="btn btn-warning" onClick={undoDelete}>
                        <Undo2 size={16} /> Undo
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Participants Panel */}
                <div className="participants-panel">
                    <div className="panel-header">
                        <Users size={18} />
                        <span>Participants</span>
                        <span className="count-badge">{Object.keys(participants).length}</span>
                    </div>
                    <div className="participants-list">
                        {Object.keys(participants).length === 0 ? (
                            <div className="empty-state">
                                <User size={40} className="empty-icon" />
                                <p>No participants yet</p>
                            </div>
                        ) : (
                            Object.keys(participants).map(name => (
                                <button
                                    key={name}
                                    className={`participant-btn ${currentEntries.includes(name) ? 'answered' : ''}`}
                                    onClick={() => addToRound(name)}
                                >
                                    <User size={16} />
                                    <span>{name}</span>
                                    {currentEntries.includes(name) && <span className="check">✓</span>}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Leaderboard Panel */}
                <div className="leaderboard-panel">
                    <div className="panel-header leaderboard-header">
                        <Trophy size={18} />
                        <span>Leaderboard</span>
                    </div>
                    <div className="leaderboard-content">
                        {sortedParticipants.length === 0 ? (
                            <div className="empty-state">
                                <Trophy size={40} className="empty-icon" />
                                <p>Add participants to start scoring</p>
                            </div>
                        ) : (
                            <table className="leaderboard-table">
                                <thead>
                                    <tr>
                                        <th># RANK</th>
                                        <th><User size={12} /> PARTICIPANT</th>
                                        <th><Clock size={12} /> SCORE BREAKDOWN</th>
                                        <th><Trophy size={12} /> TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedParticipants.map(([name, data], index) => {
                                        const maxQuestions = Math.max(
                                            questionNumber,
                                            ...Object.keys(questionEntries).map(Number)
                                        );

                                        // Build score badges
                                        const scoreBadges = [];
                                        for (let i = 1; i <= maxQuestions; i++) {
                                            const score = data.scores[i - 1];
                                            if (score && score > 0) {
                                                const isPositive = score > 0;
                                                scoreBadges.push(
                                                    <span
                                                        key={i}
                                                        className={`score-badge ${isPositive ? 'positive' : 'negative'}`}
                                                    >
                                                        {isPositive ? '+' : ''}{score}
                                                    </span>
                                                );
                                            }
                                        }

                                        const rank = index + 1;
                                        const rankClass = rank <= 3 ? `rank-${rank}` : '';

                                        return (
                                            <tr key={name}>
                                                <td className="rank-cell">
                                                    <span className={`rank-number ${rankClass}`}>{rank}</span>
                                                </td>
                                                <td>
                                                    <div className="participant-cell">
                                                        <div className="participant-avatar">
                                                            <User size={16} />
                                                        </div>
                                                        <span className="participant-name">{name}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="score-breakdown-cell">
                                                        {scoreBadges.length > 0 ? scoreBadges : <span className="no-scores">-</span>}
                                                    </div>
                                                </td>
                                                <td className="total-cell">
                                                    <span className={`total-score ${index === 0 ? 'first' : ''}`}>{data.total}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="tally-footer">
                © 2023 Detective Conan PH Tally System. All rights reserved.
            </footer>

            {/* Preferences Modal */}
            {showPreferencesModal && (
                <div className="modal-overlay" onClick={closePreferencesModal}>
                    <div className="preferences-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <Sliders size={24} />
                            <h2>Scoring Preferences</h2>
                            <button className="close-btn" onClick={closePreferencesModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* First Question Settings */}
                            <div className="settings-section">
                                <h3>First Question Scoring</h3>
                                <label className="checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={tempConfig.firstQuestion.autoPoints}
                                        onChange={e => setTempConfig(prev => ({
                                            ...prev,
                                            firstQuestion: { ...prev.firstQuestion, autoPoints: e.target.checked }
                                        }))}
                                    />
                                    <span>Auto-assign points to all participants</span>
                                </label>
                                <div className="input-row">
                                    <label>Points Value</label>
                                    <input
                                        type="number"
                                        value={tempConfig.firstQuestion.pointValue}
                                        onChange={e => setTempConfig(prev => ({
                                            ...prev,
                                            firstQuestion: { ...prev.firstQuestion, pointValue: parseInt(e.target.value) || 0 }
                                        }))}
                                        min="1"
                                        max="10"
                                    />
                                </div>
                            </div>

                            {/* Middle Questions Settings */}
                            <div className="settings-section">
                                <h3>Standard Point Distribution</h3>
                                <div className="points-grid">
                                    <div className="input-row">
                                        <label>1st Place</label>
                                        <input
                                            type="number"
                                            value={tempConfig.middleQuestions.firstPlace}
                                            onChange={e => setTempConfig(prev => ({
                                                ...prev,
                                                middleQuestions: { ...prev.middleQuestions, firstPlace: parseInt(e.target.value) || 0 }
                                            }))}
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                    <div className="input-row">
                                        <label>2nd Place</label>
                                        <input
                                            type="number"
                                            value={tempConfig.middleQuestions.secondPlace}
                                            onChange={e => setTempConfig(prev => ({
                                                ...prev,
                                                middleQuestions: { ...prev.middleQuestions, secondPlace: parseInt(e.target.value) || 0 }
                                            }))}
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                    <div className="input-row">
                                        <label>3rd Place</label>
                                        <input
                                            type="number"
                                            value={tempConfig.middleQuestions.thirdPlace}
                                            onChange={e => setTempConfig(prev => ({
                                                ...prev,
                                                middleQuestions: { ...prev.middleQuestions, thirdPlace: parseInt(e.target.value) || 0 }
                                            }))}
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                    <div className="input-row">
                                        <label>Others</label>
                                        <input
                                            type="number"
                                            value={tempConfig.middleQuestions.otherPlace}
                                            onChange={e => setTempConfig(prev => ({
                                                ...prev,
                                                middleQuestions: { ...prev.middleQuestions, otherPlace: parseInt(e.target.value) || 0 }
                                            }))}
                                            min="1"
                                            max="10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Last Question Settings */}
                            <div className="settings-section">
                                <h3>Last Question Scoring</h3>
                                <label className="checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={tempConfig.lastQuestion.autoPoints}
                                        onChange={e => setTempConfig(prev => ({
                                            ...prev,
                                            lastQuestion: { ...prev.lastQuestion, autoPoints: e.target.checked }
                                        }))}
                                    />
                                    <span>Auto-assign points to all participants</span>
                                </label>
                                <div className="input-row">
                                    <label>Points Value</label>
                                    <input
                                        type="number"
                                        value={tempConfig.lastQuestion.pointValue}
                                        onChange={e => setTempConfig(prev => ({
                                            ...prev,
                                            lastQuestion: { ...prev.lastQuestion, pointValue: parseInt(e.target.value) || 0 }
                                        }))}
                                        min="1"
                                        max="10"
                                    />
                                </div>
                            </div>

                            {/* Quiz Configuration */}
                            <div className="settings-section">
                                <h3>Quiz Configuration</h3>
                                <div className="input-row">
                                    <label>Total Questions</label>
                                    <input
                                        type="number"
                                        value={tempConfig.totalQuestions}
                                        onChange={e => setTempConfig(prev => ({
                                            ...prev,
                                            totalQuestions: parseInt(e.target.value) || 0
                                        }))}
                                        min="0"
                                        max="50"
                                    />
                                </div>
                            </div>

                            {/* Format Settings */}
                            <div className="settings-section">
                                <h3>Copy Format</h3>
                                <div className="input-row full">
                                    <label>Next Question Text</label>
                                    <input
                                        type="text"
                                        value={tempConfig.formats.nextFormat}
                                        onChange={e => setTempConfig(prev => ({
                                            ...prev,
                                            formats: { ...prev.formats, nextFormat: e.target.value }
                                        }))}
                                    />
                                </div>
                                <div className="input-row full">
                                    <label>End Quiz Text</label>
                                    <input
                                        type="text"
                                        value={tempConfig.formats.endFormat}
                                        onChange={e => setTempConfig(prev => ({
                                            ...prev,
                                            formats: { ...prev.formats, endFormat: e.target.value }
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closePreferencesModal}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={saveSettings}>
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Session History Modal */}
            {showHistoryModal && (
                <div className="modal-overlay" onClick={closeHistoryModal}>
                    <div className="history-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <History size={24} />
                            <h2>Session History</h2>
                            <button className="close-btn" onClick={closeHistoryModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {sessionHistory.length === 0 ? (
                                <div className="empty-history">
                                    <History size={48} />
                                    <p>No previous sessions found</p>
                                </div>
                            ) : (
                                <div className="history-list">
                                    {sessionHistory.map((session) => (
                                        <div key={session._id} className="history-item" onClick={() => loadHistoricalSession(session._id)}>
                                            <div className="history-item-header">
                                                <h3>{session.topic || 'Quiz Session'}</h3>
                                                <span className="history-date">
                                                    {new Date(session.endedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="history-item-stats">
                                                <div className="stat">
                                                    <Users size={14} />
                                                    <span>{session.participantCount} players</span>
                                                </div>
                                                <div className="stat">
                                                    <Info size={14} />
                                                    <span>{session.totalQuestions} questions</span>
                                                </div>
                                                <div className="stat winner">
                                                    <Trophy size={14} />
                                                    <span>{session.winner} ({session.winnerScore} pts)</span>
                                                </div>
                                            </div>
                                            <div className="history-item-action">
                                                <RotateCcw size={14} />
                                                <span>Click to restore this session</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeHistoryModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Start Modal */}
            {showStartModal && !isLoading && (
                <div className="modal-overlay">
                    <div className="start-modal">
                        <div className="start-modal-header">
                            <Trophy size={48} className="start-icon" />
                            <h1>DC Class Tally System</h1>
                            <p>Quiz scoring made easy</p>
                        </div>
                        <div className="start-modal-body">
                            {hasActiveSession && (
                                <button className="start-option continue" onClick={continueSession}>
                                    <div className="option-icon">
                                        <Play size={24} />
                                    </div>
                                    <div className="option-content">
                                        <h3>Continue Session</h3>
                                        <p>Resume your current session in progress</p>
                                    </div>
                                    <ChevronRight size={20} />
                                </button>
                            )}
                            <button className="start-option new" onClick={startNewSession}>
                                <div className="option-icon">
                                    <Plus size={24} />
                                </div>
                                <div className="option-content">
                                    <h3>Start New Session</h3>
                                    <p>Begin a fresh quiz session</p>
                                </div>
                                <ChevronRight size={20} />
                            </button>
                            <button className="start-option history" onClick={() => { setOpenedFromStart(true); setShowStartModal(false); setShowHistoryModal(true); }}>
                                <div className="option-icon">
                                    <History size={24} />
                                </div>
                                <div className="option-content">
                                    <h3>Session History</h3>
                                    <p>View or restore previous sessions ({sessionHistory.length})</p>
                                </div>
                                <ChevronRight size={20} />
                            </button>
                            <button className="start-option settings" onClick={() => { setOpenedFromStart(true); setShowStartModal(false); setShowPreferencesModal(true); setTempConfig(scoringConfig); }}>
                                <div className="option-icon">
                                    <Sliders size={24} />
                                </div>
                                <div className="option-content">
                                    <h3>Preferences</h3>
                                    <p>Configure scoring rules and formats</p>
                                </div>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <Loader2 size={48} className="spin" />
                        <p>Loading session...</p>
                    </div>
                </div>
            )}

            {/* Saving Indicator */}
            {isSaving && (
                <div className="saving-indicator">
                    <Loader2 size={16} className="spin" />
                    <span>Saving...</span>
                </div>
            )}
        </div>
    );
}
