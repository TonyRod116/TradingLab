import React, { useState } from 'react';
import { useQuantConnect } from '../hooks/useQuantConnect';
import QuantConnectStatusBar from './QuantConnectStatusBar';

const SimpleQuantConnect = () => {
    const [strategy, setStrategy] = useState({
        name: 'My Strategy',
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

    const { isLoading, error, results, status, runBacktest, reset } = useQuantConnect();

    const handleSubmit = (e) => {
        e.preventDefault();
        runBacktest(strategy);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">QuantConnect Backtest</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Strategy Name
                    </label>
                    <input
                        type="text"
                        value={strategy.name}
                        onChange={(e) => setStrategy({...strategy, name: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Python Code
                    </label>
                    <textarea
                        value={strategy.code}
                        onChange={(e) => setStrategy({...strategy, code: e.target.value})}
                        className="w-full border rounded px-3 py-2 h-64 font-mono text-sm"
                        required
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? 'Running...' : 'Run Backtest'}
                </button>
            </form>

            {isLoading && (
                <QuantConnectStatusBar
                    projectId={results?.project_id}
                    compileId={results?.compile_id}
                    backtestId={results?.backtest_id}
                />
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">
                    {error}
                </div>
            )}

            {results && status === 'completed' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                    <h3 className="font-semibold text-green-800">Backtest Completed!</h3>
                    <p className="text-green-600">
                        Return: {results.final_results?.statistics?.['Net Profit']}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SimpleQuantConnect;
