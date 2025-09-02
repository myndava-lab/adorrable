
'use client'

import { useState } from 'react'

export default function TestAllPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})

  const runTest = async (testName: string, endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) => {
    setIsLoading(prev => ({ ...prev, [testName]: true }))
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      }
      
      if (body && method === 'POST') {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(endpoint, options)
      const data = await response.json()
      
      setResults(prev => ({
        ...prev,
        [testName]: {
          success: response.ok,
          status: response.status,
          data,
          timestamp: new Date().toLocaleTimeString()
        }
      }))
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toLocaleTimeString()
        }
      }))
    } finally {
      setIsLoading(prev => ({ ...prev, [testName]: false }))
    }
  }

  const tests = [
    { name: 'Health Check', endpoint: '/api/health', method: 'GET' as const },
    { name: 'Database Test', endpoint: '/api/test', method: 'GET' as const },
    { name: 'Credits API', endpoint: '/api/credits', method: 'GET' as const },
    { name: 'AI Generation (Info)', endpoint: '/api/ai/generate', method: 'GET' as const },
    { name: 'URL Info', endpoint: '/api/url-info', method: 'GET' as const },
    { name: 'Debug Analysis', endpoint: '/api/debug', method: 'GET' as const }
  ]

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test.name, test.endpoint, test.method)
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Adorrable API Test Suite
        </h1>
        
        <div className="mb-8 text-center">
          <button
            onClick={runAllTests}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Run All Tests
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <div key={test.name} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">{test.name}</h3>
              
              <button
                onClick={() => runTest(test.name, test.endpoint, test.method)}
                disabled={isLoading[test.name]}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 mb-4"
              >
                {isLoading[test.name] ? 'Testing...' : `Test ${test.method}`}
              </button>

              {results[test.name] && (
                <div className={`p-3 rounded-lg ${
                  results[test.name].success ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={results[test.name].success ? 'text-green-400' : 'text-red-400'}>
                      {results[test.name].success ? '✅' : '❌'}
                    </span>
                    <span className="text-white text-sm">
                      {results[test.name].timestamp}
                    </span>
                  </div>
                  
                  {results[test.name].status && (
                    <p className="text-white/80 text-sm mb-2">
                      Status: {results[test.name].status}
                    </p>
                  )}

                  {results[test.name].error && (
                    <p className="text-red-300 text-sm mb-2">
                      Error: {results[test.name].error}
                    </p>
                  )}

                  <details className="text-white/70 text-xs">
                    <summary className="cursor-pointer hover:text-white">View Details</summary>
                    <pre className="mt-2 p-2 bg-black/30 rounded overflow-auto max-h-40">
                      {JSON.stringify(results[test.name].data || results[test.name], null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/test-database" 
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back to Database Test
          </a>
        </div>
      </div>
    </div>
  )
}
