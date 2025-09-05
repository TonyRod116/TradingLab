import React, { useState } from 'react';
import QuantConnectManager from '../components/QuantConnectManager';
import SimpleQuantConnect from '../components/SimpleQuantConnect';
import QuantConnectStatusBar from '../components/QuantConnectStatusBar';
import { useQuantConnect } from '../hooks/useQuantConnect';
import '../styles/QuantConnect.css';

/**
 * Ejemplo de integración completa de QuantConnect
 * Muestra diferentes formas de usar los componentes
 */
const QuantConnectIntegration = () => {
    const [activeTab, setActiveTab] = useState('manager');
    const [statusData, setStatusData] = useState({
        projectId: null,
        compileId: null,
        backtestId: null
    });

    // Hook personalizado para ejemplo
    const { 
        isLoading, 
        error, 
        results, 
        status, 
        runBacktest, 
        reset 
    } = useQuantConnect();

    const handleStatusChange = (status) => {
        console.log('Status changed:', status);
    };

    const handleComplete = () => {
        console.log('Backtest completed!');
    };

    const handleCustomBacktest = async () => {
        const strategyData = {
            name: 'Custom Strategy',
            code: `from AlgorithmImports import *

class CustomStrategy(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetEndDate(2024, 2, 1)
        self.SetCash(10000)
        self.AddEquity("SPY", Resolution.DAILY)
        
    def OnData(self, data):
        if not self.Portfolio.Invested:
            self.SetHoldings("SPY", 1)`
        };

        try {
            await runBacktest(strategyData);
        } catch (err) {
            console.error('Error running custom backtest:', err);
        }
    };

    const tabs = [
        { id: 'manager', label: 'Full Manager', component: QuantConnectManager },
        { id: 'simple', label: 'Simple', component: SimpleQuantConnect },
        { id: 'custom', label: 'Custom', component: null }
    ];

    const renderCustomTab = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Custom Example with Hook</h2>
            
            <div className="bg-white border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Hook State</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                        <div className={`text-lg font-bold ${
                            isLoading ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                            {isLoading ? 'Loading...' : 'Idle'}
                        </div>
                        <div className="text-sm text-gray-600">State</div>
                    </div>
                    <div className="text-center">
                        <div className={`text-lg font-bold ${
                            error ? 'text-red-600' : 'text-green-600'
                        }`}>
                            {error ? 'Error' : 'OK'}
                        </div>
                        <div className="text-sm text-gray-600">Error</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                            {results ? 'Yes' : 'No'}
                        </div>
                        <div className="text-sm text-gray-600">Results</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                            {status}
                        </div>
                        <div className="text-sm text-gray-600">Status</div>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button
                        onClick={handleCustomBacktest}
                        disabled={isLoading}
                        className="btn-quantconnect"
                    >
                        {isLoading ? 'Running...' : 'Run Custom Backtest'}
                    </button>
                    
                    <button
                        onClick={reset}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Custom Status Bar */}
            {isLoading && (
                <QuantConnectStatusBar
                    projectId={results?.project_id}
                    compileId={results?.compile_id}
                    backtestId={results?.backtest_id}
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

            {/* Results */}
            {results && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">Backtest Results</h3>
                    <pre className="text-sm text-green-700 overflow-x-auto">
                        {JSON.stringify(results, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );

    return (
        <div className="quantconnect-container">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">🚀 QuantConnect Integration Examples</h1>
                <p className="text-gray-600">
                    QuantConnect integration examples with different complexity levels
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'manager' && <QuantConnectManager />}
                {activeTab === 'simple' && <SimpleQuantConnect />}
                {activeTab === 'custom' && renderCustomTab()}
            </div>

            {/* Additional information */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Information</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Full Manager:</strong> Complete interface with form and results</li>
                    <li>• <strong>Simple:</strong> Basic component for simple cases</li>
                    <li>• <strong>Custom:</strong> Hook usage for advanced cases</li>
                </ul>
            </div>
        </div>
    );
};

export default QuantConnectIntegration;
