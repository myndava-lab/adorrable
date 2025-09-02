
'use client'

import { useState, useEffect } from 'react'

export default function PublicUrlDisplay() {
  const [urlInfo, setUrlInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const getUrlInfo = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/public-url')
      const data = await response.json()
      setUrlInfo(data)
    } catch (error) {
      console.error('Failed to get URL info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getUrlInfo()
  }, [])

  if (isLoading) {
    return <div className="text-white">Loading URL info...</div>
  }

  if (!urlInfo) {
    return <div className="text-red-400">Failed to load URL info</div>
  }

  return (
    <div className="p-4 border border-white/20 rounded-lg bg-white/5 backdrop-blur-lg">
      <h3 className="text-lg font-semibold text-white mb-2">Public URL Information</h3>
      
      <div className="space-y-2 text-sm">
        <div className="text-green-400">
          <strong>Public URL:</strong> 
          <a href={urlInfo.publicUrl} target="_blank" rel="noopener noreferrer" className="ml-2 underline">
            {urlInfo.publicUrl}
          </a>
        </div>
        
        <div className="text-white/80">
          <strong>Host:</strong> {urlInfo.host}
        </div>
        
        <div className="text-white/80">
          <strong>Protocol:</strong> {urlInfo.protocol}
        </div>
        
        {urlInfo.testUrls && (
          <div className="mt-4">
            <h4 className="text-white font-medium mb-2">Test Endpoints:</h4>
            <div className="space-y-1 text-xs">
              {Object.entries(urlInfo.testUrls).map(([name, url]) => (
                <div key={name} className="text-blue-300">
                  <strong>{name}:</strong> 
                  <a href={url as string} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                    {url as string}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
