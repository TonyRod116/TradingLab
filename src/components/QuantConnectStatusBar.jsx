import React, { useState, useEffect } from 'react';
import QuantConnectService from '../services/QuantConnectService';

const QuantConnectStatusBar = ({ 
    projectId, 
    compileId, 
    backtestId, 
    onStatusChange, 
    onComplete 
}) => {
    const [currentStep, setCurrentStep] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    
    const qcService = new QuantConnectService();

    // Possible states
    const STEPS = {
        IDLE: 'idle',
        CREATING_PROJECT: 'creating_project',
        CREATING_FILE: 'creating_file',
        COMPILING: 'compiling',
        COMPILATION_WAITING: 'compilation_waiting',
        RUNNING_BACKTEST: 'running_backtest',
        BACKTEST_WAITING: 'backtest_waiting',
        COMPLETED: 'completed',
        ERROR: 'error'
    };

    // Monitor compilation
    const monitorCompilation = async () => {
        if (!projectId || !compileId) return;

        try {
            const result = await qcService.monitor('compilation', projectId, compileId);
            
            if (result.success) {
                setStatus(result.state);
                
                if (result.completed) {
                    setCurrentStep(STEPS.RUNNING_BACKTEST);
                    setProgress(50);
                    onStatusChange('compilation_completed');
                } else if (result.failed) {
                    setCurrentStep(STEPS.ERROR);
                    setError('Compilation failed');
                    onStatusChange('compilation_failed');
                } else {
                    setCurrentStep(STEPS.COMPILATION_WAITING);
                    setProgress(25);
                    onStatusChange('compilation_in_progress');
                }
            }
        } catch (error) {
            setCurrentStep(STEPS.ERROR);
            setError(error.message);
        }
    };

    // Monitor backtest
    const monitorBacktest = async () => {
        if (!projectId || !backtestId) return;

        try {
            const result = await qcService.monitor('backtest', projectId, backtestId);
            
            if (result.success) {
                setStatus(result.status);
                setProgress(50 + (result.progress / 2)); // 50-100%
                
                if (result.completed) {
                    setCurrentStep(STEPS.COMPLETED);
                    setProgress(100);
                    onStatusChange('backtest_completed');
                    onComplete && onComplete();
                } else if (result.failed) {
                    setCurrentStep(STEPS.ERROR);
                    setError('Backtest failed');
                    onStatusChange('backtest_failed');
                } else {
                    setCurrentStep(STEPS.BACKTEST_WAITING);
                    onStatusChange('backtest_in_progress');
                }
            }
        } catch (error) {
            setCurrentStep(STEPS.ERROR);
            setError(error.message);
        }
    };

    // Effect for automatic monitoring
    useEffect(() => {
        let interval;

        if (currentStep === STEPS.COMPILATION_WAITING) {
            interval = setInterval(monitorCompilation, 2000); // Every 2 seconds
        } else if (currentStep === STEPS.BACKTEST_WAITING) {
            interval = setInterval(monitorBacktest, 5000); // Every 5 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [currentStep, projectId, compileId, backtestId]);

    // Render progress bar
    const renderProgressBar = () => (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );

    // Render current step
    const renderCurrentStep = () => {
        const stepLabels = {
            [STEPS.IDLE]: 'Ready',
            [STEPS.CREATING_PROJECT]: 'Creating project...',
            [STEPS.CREATING_FILE]: 'Creating file...',
            [STEPS.COMPILING]: 'Compiling...',
            [STEPS.COMPILATION_WAITING]: 'Waiting for compilation...',
            [STEPS.RUNNING_BACKTEST]: 'Starting backtest...',
            [STEPS.BACKTEST_WAITING]: 'Running backtest...',
            [STEPS.COMPLETED]: 'Completed!',
            [STEPS.ERROR]: 'Error'
        };

        return (
            <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                    currentStep === STEPS.COMPLETED ? 'bg-green-500' :
                    currentStep === STEPS.ERROR ? 'bg-red-500' :
                    'bg-blue-500 animate-pulse'
                }`}></div>
                <span className="text-sm font-medium">
                    {stepLabels[currentStep]}
                </span>
                {status && (
                    <span className="text-xs text-gray-500">
                        ({status})
                    </span>
                )}
            </div>
        );
    };

    // Render logs
    const renderLogs = () => {
        if (logs.length === 0) return null;

        return (
            <div className="mt-2 max-h-20 overflow-y-auto">
                {logs.map((log, index) => (
                    <div key={index} className="text-xs text-gray-600">
                        {log}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
            {renderCurrentStep()}
            <div className="mt-2">
                {renderProgressBar()}
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{progress}%</span>
                    <span>{currentStep}</span>
                </div>
            </div>
            {error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}
            {renderLogs()}
        </div>
    );
};

export default QuantConnectStatusBar;
