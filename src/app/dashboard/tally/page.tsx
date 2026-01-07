'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Settings, Award, Users, Trophy, ChevronLeft, ChevronRight,
    Plus, Copy, Trash2, Undo2, User, Hash, Calculator,
    X, Save, Eye, Info, ListOrdered, Palette
} from 'lucide-react';
import './tally.css';

// Types
interface Participant {
    scores: number[];
    total: number;
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
        totalQuestions: 10,
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
    const [showSettings, setShowSettings] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

    // Temp settings for modal
    const [tempConfig, setTempConfig] = useState<ScoringConfig>(scoringConfig);

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

        showToast(`${name} scored ${points} points for Question ${questionNumber}!`, 'info');
    };

    // Auto-assign points for special questions
    const autoAssignPoints = () => {
        const isFirstQuestion = questionNumber === 1;
        const isLastQuestion = scoringConfig.totalQuestions > 0 && questionNumber === scoringConfig.totalQuestions;

        if ((isFirstQuestion && scoringConfig.firstQuestion.autoPoints) ||
            (isLastQuestion && scoringConfig.lastQuestion.autoPoints)) {

            const currentEntries = questionEntries[questionNumber] || [];

            Object.keys(participants).forEach(name => {
                if (!currentEntries.includes(name)) {
                    addToRound(name);
                }
            });
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

        // Remove from score history
        setScoreHistory(prev => {
            const newHistory = [...prev];
            const index = newHistory.findLastIndex(h =>
                h.questionNumber === questionNumber && h.name === lastAction.name
            );
            if (index > -1) newHistory.splice(index, 1);
            return newHistory;
        });

        // Remove from question entries
        setQuestionEntries(prev => {
            const entries = [...(prev[questionNumber] || [])];
            const index = entries.indexOf(lastAction.name);
            if (index > -1) entries.splice(index, 1);
            return { ...prev, [questionNumber]: entries };
        });

        // Revert participant score
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

            totalScoresSection = `\n\nFinal Scores:\n${sortedParticipants.map(([name, data], index) =>
                `${index + 1}. ${name}: ${data.total} points`
            ).join('\n')}`;
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
        setShowSettings(false);
        showToast('Settings saved successfully!', 'success');
    };

    // Get rank badge
    const getRankBadge = (rank: number) => {
        switch (rank) {
            case 1:
                return <span className="rank-badge rank-1">🥇 {rank}</span>;
            case 2:
                return <span className="rank-badge rank-2">🥈 {rank}</span>;
            case 3:
                return <span className="rank-badge rank-3">🥉 {rank}</span>;
            default:
                return <span className="rank-badge rank-default">{rank}</span>;
        }
    };

    // Get question mode text
    const getQuestionModeText = () => {
        const isFirstQuestion = questionNumber === 1;
        const isLastQuestion = scoringConfig.totalQuestions > 0 && questionNumber === scoringConfig.totalQuestions;

        if (isFirstQuestion && scoringConfig.firstQuestion.autoPoints) {
            return <span className="mode-badge mode-modified">Modified Mode</span>;
        } else if (isLastQuestion && scoringConfig.lastQuestion.autoPoints) {
            return <span className="mode-badge mode-modified">Modified Mode</span>;
        }
        return <span className="mode-badge mode-original">Original Mode</span>;
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
                <div className="header-content">
                    <div className="header-title">
                        <Award size={28} className="header-icon" />
                        <div>
                            <span className="header-label">Tally System</span>
                            <h1 className="header-main">Quiz <span className="text-gradient">Scoring</span></h1>
                        </div>
                    </div>
                    <button className="settings-btn" onClick={() => { setTempConfig(scoringConfig); setShowSettings(true); }}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                </div>
            </header>

            {/* Question Number Display */}
            <div className="question-display">
                <div className="question-info">
                    <Info size={18} />
                    <strong>Question <span className="question-number">{questionNumber}</span>
                        {scoringConfig.totalQuestions > 0 && <span className="question-total"> / {scoringConfig.totalQuestions}</span>}
                    </strong>
                    {getQuestionModeText()}
                </div>
            </div>

            {/* Control Panel */}
            <div className="control-panel">
                <div className="control-inputs">
                    <div className="input-group">
                        <label>Topic</label>
                        <input
                            type="text"
                            value={topicInput}
                            onChange={e => setTopicInput(e.target.value)}
                            placeholder="Enter topic"
                            className="tally-input"
                        />
                    </div>
                    <div className="input-group">
                        <label>Answer</label>
                        <input
                            type="text"
                            value={answerInput}
                            onChange={e => setAnswerInput(e.target.value)}
                            placeholder="Enter answer"
                            className="tally-input"
                        />
                    </div>
                    <div className="input-group">
                        <label>Add Participant</label>
                        <div className="input-with-button">
                            <input
                                type="text"
                                value={participantInput}
                                onChange={e => setParticipantInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addParticipant()}
                                placeholder="Enter name"
                                className="tally-input"
                            />
                            <button className="btn btn-add" onClick={addParticipant}>
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="control-buttons">
                    <button className="btn btn-secondary" onClick={previousQuestion}>
                        <ChevronLeft size={18} /> Previous
                    </button>
                    <button className="btn btn-success" onClick={nextQuestion}>
                        Next <ChevronRight size={18} />
                    </button>
                    <button className="btn btn-info" onClick={copyRecords}>
                        <Copy size={18} /> Copy
                    </button>
                    <button className="btn btn-danger" onClick={deleteParticipant}>
                        <Trash2 size={18} /> Delete
                    </button>
                    <button className="btn btn-warning" onClick={undoDelete}>
                        <Undo2 size={18} /> Undo
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Participants Panel */}
                <div className="participants-panel">
                    <div className="panel-header">
                        <Users size={20} />
                        <h3>Participants</h3>
                        <span className="count-badge">{Object.keys(participants).length}</span>
                    </div>
                    <div className="participants-list">
                        {Object.keys(participants).length === 0 ? (
                            <div className="empty-state">
                                <User size={32} />
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
                                    {name}
                                    {currentEntries.includes(name) && <span className="check">✓</span>}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Leaderboard Panel */}
                <div className="leaderboard-panel">
                    <div className="panel-header">
                        <Trophy size={20} />
                        <h3>Leaderboard</h3>
                    </div>
                    <div className="leaderboard-table-wrapper">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th><Hash size={14} /> Rank</th>
                                    <th><User size={14} /> Participant</th>
                                    <th><Calculator size={14} /> Score Breakdown</th>
                                    <th><Award size={14} /> Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedParticipants.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="empty-table">
                                            Add participants to start scoring
                                        </td>
                                    </tr>
                                ) : (
                                    sortedParticipants.map(([name, data], index) => {
                                        const maxQuestions = Math.max(
                                            questionNumber,
                                            ...Object.keys(questionEntries).map(Number)
                                        );
                                        const scoreBreakdown = [];

                                        for (let i = 1; i <= maxQuestions; i++) {
                                            const score = data.scores[i - 1];
                                            if (i === questionNumber) {
                                                scoreBreakdown.push(
                                                    <span key={i} className="score-current">{score || 0}</span>
                                                );
                                            } else if (score && score > 0) {
                                                scoreBreakdown.push(<span key={i}>{score}</span>);
                                            } else {
                                                scoreBreakdown.push(<span key={i} className="score-blank">-</span>);
                                            }
                                            if (i < maxQuestions) {
                                                scoreBreakdown.push(<span key={`sep-${i}`} className="score-sep">+</span>);
                                            }
                                        }

                                        return (
                                            <tr key={name}>
                                                <td>{getRankBadge(index + 1)}</td>
                                                <td className="participant-name">{name}</td>
                                                <td className="score-breakdown">{scoreBreakdown}</td>
                                                <td><span className="total-score">{data.total}</span></td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="modal-overlay" onClick={() => setShowSettings(false)}>
                    <div className="settings-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <Settings size={24} />
                            <h2>Scoring Configuration</h2>
                            <button className="close-btn" onClick={() => setShowSettings(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* First Question Settings */}
                            <div className="settings-card">
                                <div className="settings-card-header">
                                    <span className="card-icon">1</span>
                                    <h4>First Question Scoring Mode</h4>
                                </div>
                                <div className="settings-card-body">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={tempConfig.firstQuestion.autoPoints}
                                            onChange={e => setTempConfig(prev => ({
                                                ...prev,
                                                firstQuestion: { ...prev.firstQuestion, autoPoints: e.target.checked }
                                            }))}
                                        />
                                        <span><strong>Modified Mode:</strong> Award points to all participants</span>
                                    </label>
                                    <div className="input-row">
                                        <label>Points Value (Modified Mode)</label>
                                        <input
                                            type="number"
                                            value={tempConfig.firstQuestion.pointValue}
                                            onChange={e => setTempConfig(prev => ({
                                                ...prev,
                                                firstQuestion: { ...prev.firstQuestion, pointValue: parseInt(e.target.value) || 0 }
                                            }))}
                                            min="1"
                                            max="10"
                                            className="tally-input small"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Middle Questions Settings */}
                            <div className="settings-card">
                                <div className="settings-card-header">
                                    <span className="card-icon">2</span>
                                    <h4>Middle Questions (Standard Distribution)</h4>
                                </div>
                                <div className="settings-card-body">
                                    <div className="info-alert">
                                        <Info size={16} />
                                        <span><strong>Performance-based scoring:</strong> Points awarded based on answer speed/accuracy ranking</span>
                                    </div>
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
                                                className="tally-input small"
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
                                                className="tally-input small"
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
                                                className="tally-input small"
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
                                                className="tally-input small"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Last Question Settings */}
                            <div className="settings-card">
                                <div className="settings-card-header">
                                    <span className="card-icon">★</span>
                                    <h4>Last Question Scoring Mode</h4>
                                </div>
                                <div className="settings-card-body">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={tempConfig.lastQuestion.autoPoints}
                                            onChange={e => setTempConfig(prev => ({
                                                ...prev,
                                                lastQuestion: { ...prev.lastQuestion, autoPoints: e.target.checked }
                                            }))}
                                        />
                                        <span><strong>Modified Mode:</strong> Award points to all participants</span>
                                    </label>
                                    <div className="input-row">
                                        <label>Points Value (Modified Mode)</label>
                                        <input
                                            type="number"
                                            value={tempConfig.lastQuestion.pointValue}
                                            onChange={e => setTempConfig(prev => ({
                                                ...prev,
                                                lastQuestion: { ...prev.lastQuestion, pointValue: parseInt(e.target.value) || 0 }
                                            }))}
                                            min="1"
                                            max="10"
                                            className="tally-input small"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Quiz Configuration */}
                            <div className="settings-card">
                                <div className="settings-card-header">
                                    <ListOrdered size={18} />
                                    <h4>Quiz Configuration</h4>
                                </div>
                                <div className="settings-card-body">
                                    <div className="input-row">
                                        <label>Total Number of Questions</label>
                                        <input
                                            type="number"
                                            value={tempConfig.totalQuestions}
                                            onChange={e => setTempConfig(prev => ({
                                                ...prev,
                                                totalQuestions: parseInt(e.target.value) || 0
                                            }))}
                                            min="0"
                                            max="50"
                                            className="tally-input small"
                                        />
                                    </div>
                                    <p className="form-hint">Set to 0 for unlimited questions</p>
                                </div>
                            </div>

                            {/* Format Settings */}
                            <div className="settings-card">
                                <div className="settings-card-header">
                                    <Palette size={18} />
                                    <h4>Format Settings</h4>
                                </div>
                                <div className="settings-card-body">
                                    <div className="input-row full">
                                        <label>Next Question Format</label>
                                        <input
                                            type="text"
                                            value={tempConfig.formats.nextFormat}
                                            onChange={e => setTempConfig(prev => ({
                                                ...prev,
                                                formats: { ...prev.formats, nextFormat: e.target.value }
                                            }))}
                                            className="tally-input"
                                        />
                                    </div>
                                    <div className="input-row full">
                                        <label>End Quiz Format</label>
                                        <input
                                            type="text"
                                            value={tempConfig.formats.endFormat}
                                            onChange={e => setTempConfig(prev => ({
                                                ...prev,
                                                formats: { ...prev.formats, endFormat: e.target.value }
                                            }))}
                                            className="tally-input"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview Section */}
                            <div className="settings-card preview-card">
                                <div className="settings-card-header">
                                    <Eye size={18} />
                                    <h4>Current Scoring Configuration</h4>
                                </div>
                                <div className="settings-card-body">
                                    <div className="preview-content">
                                        <p>
                                            <strong>Question 1:</strong>{' '}
                                            {tempConfig.firstQuestion.autoPoints
                                                ? `Modified Mode: ${tempConfig.firstQuestion.pointValue} points (all participants)`
                                                : 'Original Mode: 4-2-2-1 distribution'}
                                        </p>
                                        <p>
                                            <strong>Questions 2-{tempConfig.totalQuestions - 1}:</strong>{' '}
                                            Standard: {tempConfig.middleQuestions.firstPlace}-{tempConfig.middleQuestions.secondPlace}-{tempConfig.middleQuestions.thirdPlace}-{tempConfig.middleQuestions.otherPlace} points
                                        </p>
                                        <p>
                                            <strong>Question {tempConfig.totalQuestions}:</strong>{' '}
                                            {tempConfig.lastQuestion.autoPoints
                                                ? `Modified Mode: ${tempConfig.lastQuestion.pointValue} points (all participants)`
                                                : 'Original Mode: 4-2-2-1 distribution'}
                                        </p>
                                    </div>
                                    <div className="mode-explanation">
                                        <h6>Mode Explanation:</h6>
                                        <ul>
                                            <li><strong>Original Mode:</strong> Traditional performance-based scoring (4-2-2-1)</li>
                                            <li><strong>Modified Mode:</strong> Optional questions where all participants get full points</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowSettings(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={saveSettings}>
                                <Save size={18} /> Save Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
