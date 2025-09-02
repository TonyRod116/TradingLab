import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import strategyService from '../services/StrategyService';

const StrategyDetailsTest = () => {
  const { id } = useParams();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runTests();
  }, [id]);

  const runTests = async () => {
    const results = {};
    
    try {
      // Test 1: Check if service is initialized
      results.serviceInitialized = strategyService ? 'YES' : 'NO';
      results.baseURL = strategyService.baseURL;
      results.token = strategyService.getToken() ? 'Present' : 'Missing';
      
      // Test 2: Try to get strategy
      try {
        const strategy = await strategyService.getStrategy(id);
        results.strategyFetch = 'SUCCESS';
        results.strategyData = strategy;
      } catch (error) {
        results.strategyFetch = 'ERROR';
        results.strategyError = error.message;
      }
      
      // Test 3: Try to get backtests
      try {
        const backtests = await strategyService.getBacktests(id);
        results.backtestsFetch = 'SUCCESS';
        results.backtestsData = backtests;
      } catch (error) {
        results.backtestsFetch = 'ERROR';
        results.backtestsError = error.message;
      }
      
    } catch (error) {
      results.generalError = error.message;
    }
    
    setTestResults(results);
    setLoading(false);
  };

  if (loading) {
    return <div>Running tests...</div>;
  }

  return (
    <div style={{ 
      padding: '20px', 
      background: '#1a1a1a', 
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h2>Strategy Details Test Results</h2>
      <p>Strategy ID: {id}</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Service Status:</h3>
        <p>Service Initialized: {testResults.serviceInitialized}</p>
        <p>Base URL: {testResults.baseURL}</p>
        <p>Token: {testResults.token}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Strategy Fetch Test:</h3>
        <p>Status: {testResults.strategyFetch}</p>
        {testResults.strategyError && <p style={{ color: 'red' }}>Error: {testResults.strategyError}</p>}
        {testResults.strategyData && (
          <div>
            <p>Strategy Data:</p>
            <pre>{JSON.stringify(testResults.strategyData, null, 2)}</pre>
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Backtests Fetch Test:</h3>
        <p>Status: {testResults.backtestsFetch}</p>
        {testResults.backtestsError && <p style={{ color: 'red' }}>Error: {testResults.backtestsError}</p>}
        {testResults.backtestsData && (
          <div>
            <p>Backtests Data:</p>
            <pre>{JSON.stringify(testResults.backtestsData, null, 2)}</pre>
          </div>
        )}
      </div>
      
      {testResults.generalError && (
        <div style={{ color: 'red' }}>
          <h3>General Error:</h3>
          <p>{testResults.generalError}</p>
        </div>
      )}
    </div>
  );
};

export default StrategyDetailsTest;
