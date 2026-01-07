'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Settings, ChevronLeft, ChevronRight, Plus, Copy, Trash2, Undo2,
    User, Users, Trophy, X, Save, Info, Clock, Power,
    Sliders, History
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
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

    // Temp settings for modal
    const [tempConfig, setTempConfig] = useState<ScoringConfig>(scoringConfig);

    // Ref for dropdown
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        setShowPreferencesModal(false);
        showToast('Settings saved successfully!', 'success');
    };

    // End session
    const endSession = () => {
        if (confirm('Are you sure you want to end the session? This will clear all data.')) {
            setParticipants({});
            setQuestionEntries({});
            setQuestionAnswers({});
            setScoreHistory([]);
            setQuestionNumber(1);
            setTopicInput('');
            setAnswerInput('');
            showToast('Session ended. All data cleared.', 'info');
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
                            <button onClick={() => { showToast('Session history feature coming soon!', 'info'); setShowSettingsDropdown(false); }}>
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
                <div className="modal-overlay" onClick={() => setShowPreferencesModal(false)}>
                    <div className="preferences-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <Sliders size={24} />
                            <h2>Scoring Preferences</h2>
                            <button className="close-btn" onClick={() => setShowPreferencesModal(false)}>
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
                            <button className="btn btn-secondary" onClick={() => setShowPreferencesModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={saveSettings}>
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
