import { useState, useCallback } from 'react';
import QuantConnectService from '../services/QuantConnectService';

export const useQuantConnect = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);
    const [status, setStatus] = useState('idle');

    const qcService = new QuantConnectService();

    const runBacktest = useCallback(async (strategyData) => {
        setIsLoading(true);
        setError(null);
        setResults(null);
        setStatus('running');

        try {
            const result = await qcService.runCompleteBacktest(strategyData);
            
            if (result.success) {
                setResults(result.results);
                setStatus('completed');
            } else {
                setError(result.error);
                setStatus('error');
            }
        } catch (err) {
            setError(err.message);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setResults(null);
        setStatus('idle');
    }, []);

    return {
        isLoading,
        error,
        results,
        status,
        runBacktest,
        reset
    };
};
