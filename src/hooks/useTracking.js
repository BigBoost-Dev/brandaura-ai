import { useState, useRef, useCallback } from 'react'
import { queryAI, analyzeResponse } from '../lib/api'
import { extractSources } from '../lib/aiAnalysis'
import { AI_SEARCH_ENGINES } from '../lib/constants'
import { useResultsStore } from './useStore'

/**
 * Hook for running AI tracking based on Topic Wizard configuration
 */
export function useTracking() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0, prompt: '', engine: '' })
  const [logs, setLogs] = useState([])
  const abortRef = useRef(null)
  const { addResults } = useResultsStore()

  const addLog = useCallback((message, type = 'info') => {
    setLogs(prev => [...prev.slice(-50), { message, type, time: new Date() }])
  }, [])

  const runTracking = useCallback(async (brand, userId) => {
    if (isRunning || !brand || !userId) return
    
    // Parse settings if it's a JSON string
    let settings = brand.settings || {}
    if (typeof settings === 'string') {
      try { settings = JSON.parse(settings) } catch { settings = {} }
    }
    
    const prompts = settings.prompts || []
    const engines = settings.engines || ['chatgpt-auto', 'perplexity', 'gemini']
    const topics = settings.topics || []

    if (prompts.length === 0) {
      addLog('❌ No prompts configured. Use Topic Wizard to set up tracking.', 'error')
      return
    }

    abortRef.current = new AbortController()
    setIsRunning(true)
    setLogs([])
    
    const totalQueries = prompts.length * engines.length
    setProgress({ current: 0, total: totalQueries, percentage: 0, prompt: '', engine: '' })
    addLog(`🚀 Starting tracking for ${brand.name}`, 'info')
    addLog(`📋 ${prompts.length} prompts × ${engines.length} engines = ${totalQueries} queries`, 'info')

    const results = []
    const batchId = Date.now().toString()
    let queryIndex = 0

    for (const prompt of prompts) {
      if (abortRef.current?.signal.aborted) break

      for (const engineId of engines) {
        if (abortRef.current?.signal.aborted) break

        queryIndex++
        const engine = AI_SEARCH_ENGINES[engineId]
        
        if (!engine) {
          addLog(`⚠️ Unknown engine: ${engineId}`, 'warning')
          continue
        }

        setProgress({
          current: queryIndex,
          total: totalQueries,
          percentage: Math.round((queryIndex / totalQueries) * 100),
          prompt: prompt.text?.substring(0, 50) + '...',
          engine: engine.name
        })

        try {
          const { success, response, cost, error } = await queryAI(engine.model, prompt.text, 45000)

          if (abortRef.current?.signal.aborted) break

          if (success && response) {
            // Parse competitors if it's a JSON string
            let parsedCompetitors = brand.competitors || []
            if (typeof parsedCompetitors === 'string') {
              try { parsedCompetitors = JSON.parse(parsedCompetitors) } catch {}
            }
            parsedCompetitors = parsedCompetitors.map(c => typeof c === 'object' ? c.name : c)
            
            const analysis = analyzeResponse(response, brand.name, parsedCompetitors)
            
            // Extract sources from response
            let sources = []
            try {
              sources = extractSources(response, analysis.citedUrls || [])
            } catch (e) {
              // Ignore source extraction errors
            }
            
            // Find topic info
            const topic = topics.find(t => t.id === prompt.topicId) || {}

            results.push({
              brand_id: brand.id,
              user_id: userId,
              batch_id: batchId,
              platform_id: engineId,
              platform_name: engine.name,
              model: engine.model,
              query: prompt.text,
              query_type: prompt.type || 'general',
              topic_id: prompt.topicId || null,
              topic_name: prompt.topicName || topic.name || 'General',
              response_text: response,
              brand_mentioned: analysis.brandMention !== 'notMentioned',
              mention_type: analysis.brandMention,
              brand_position: analysis.brandPosition,
              mention_count: analysis.mentionCount,
              sentiment: analysis.sentiment,
              confidence_score: analysis.confidence,
              competitor_mentions: analysis.competitorMentions,
              cited_urls: analysis.citedUrls,
              sources: sources,
              snippet: analysis.snippet,
              word_count: analysis.wordCount,
              cost: cost || 0,
              created_at: new Date().toISOString()
            })

            const emoji = analysis.brandMention === 'leader' ? '🏆' :
                         analysis.brandMention === 'recommended' ? '✅' :
                         analysis.brandMention === 'mentioned' ? '📍' :
                         analysis.brandMention === 'notMentioned' ? '❌' : '⚠️'
            
            addLog(`${emoji} ${engine.name}: ${analysis.brandMention} (${prompt.topicName || 'General'})`, 'info')
            
            if (sources.length > 0) {
              addLog(`   📎 Sources: ${sources.map(s => s.name).join(', ')}`, 'info')
            }
          } else {
            addLog(`❌ ${engine.name}: ${error || 'No response'}`, 'error')
          }
        } catch (err) {
          if (err.name === 'AbortError') break
          addLog(`❌ ${engine.name}: ${err.message}`, 'error')
        }

        // Delay between queries
        if (!abortRef.current?.signal.aborted) {
          await new Promise(r => setTimeout(r, 2000))
        }
      }
    }

    // Save results
    if (results.length > 0) {
      try {
        await addResults(brand.id, results)
        addLog(`✅ Saved ${results.length} results`, 'success')
      } catch (err) {
        addLog(`❌ Failed to save: ${err.message}`, 'error')
      }
    }

    setIsRunning(false)
    addLog('🏁 Tracking complete', 'success')
  }, [isRunning, addLog, addResults])

  const stopTracking = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      setIsRunning(false)
      addLog('⏹️ Tracking stopped', 'warning')
    }
  }, [addLog])

  return {
    isRunning,
    progress,
    logs,
    runTracking,
    stopTracking
  }
}
