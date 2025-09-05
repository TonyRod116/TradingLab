import React, { useState } from 'react';
import QuantConnectService from '../services/QuantConnectService';
import QuantConnectStatusBar from './QuantConnectStatusBar';

const QuantConnectManager = () => {
    const [strategy, setStrategy] = useState({
        name: '',
        code: `from AlgorithmImports import *

class MyStrategy(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetEndDate(2024, 2, 1)
        self.SetCash(10000)
        self.AddEquity("SPY", Resolution.DAILY)
        
    def OnData(self, data):
        if not self.Portfolio.Invested:
            self.SetHoldings("SPY", 1)`
    });
    
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [statusData, setStatusData] = useState({
        projectId: null,
        compileId: null,
        backtestId: null
    });

    const qcService = new QuantConnectService();

    // Run complete backtest
    const handleRunBacktest = async () => {
        if (!strategy.name || !strategy.code) {
            setError('Please complete the strategy name and code');
            return;
        }

        setIsRunning(true);
        setError(null);
        setResults(null);
        setStatusData({ projectId: null, compileId: null, backtestId: null });

        try {
            const result = await qcService.runCompleteBacktest(strategy);
            
            if (result.success) {
                setResults(result.results);
                setStatusData({
                    projectId: result.results.project_id,
                    compileId: result.results.compile_id,
                    backtestId: result.results.backtest_id
                });
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsRunning(false);
        }
    };

    // Handle status changes
    const handleStatusChange = (status) => {
        console.log('Status changed:', status);
        // You can add additional logic here to handle status changes
    };

    // Handle completion
    const handleComplete = () => {
        console.log('Backtest completed!');
        setIsRunning(false);
    };

    // Render results
    const renderResults = () => {
        if (!results || !results.final_results) return null;

        const stats = results.final_results.statistics;
        
        return (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Backtest Results</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {stats['Net Profit']}
                        </div>
                        <div className="text-sm text-gray-600">Total Return</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {stats['Sharpe Ratio']}
                        </div>
                        <div className="text-sm text-gray-600">Sharpe Ratio</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                            {stats['Drawdown']}
                        </div>
                        <div className="text-sm text-gray-600">Max Drawdown</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {stats['Total Orders']}
                        </div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">QuantConnect Backtest Manager</h1>
            
            {/* Strategy form */}
            <div className="bg-white border rounded-lg p-6 mb-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Strategy Name
                    </label>
                    <input
                        type="text"
                        value={strategy.name}
                        onChange={(e) => setStrategy({...strategy, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="My SPY Strategy"
                    />
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Python Code
                    </label>
                    <textarea
                        value={strategy.code}
                        onChange={(e) => setStrategy({...strategy, code: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 h-64 font-mono text-sm"
                        placeholder="QuantConnect Python code..."
                    />
                </div>
                
                <button
                    onClick={handleRunBacktest}
                    disabled={isRunning}
                    className={`px-6 py-2 rounded-md font-medium ${
                        isRunning 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                >
                    {isRunning ? 'Running...' : 'Run Backtest'}
                </button>
            </div>

            {/* Status Bar */}
            {isRunning && (
                <QuantConnectStatusBar
                    projectId={statusData.projectId}
                    compileId={statusData.compileId}
                    backtestId={statusData.backtestId}
                    onStatusChange={handleStatusChange}
                    onComplete={handleComplete}
                />
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="text-red-800 font-medium">Error:</div>
                    <div className="text-red-600">{error}</div>
                </div>
            )}

            {/* Resultados */}
            {renderResults()}
        </div>
    );
};

export default QuantConnectManager;
