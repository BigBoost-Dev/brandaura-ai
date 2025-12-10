import { useState, useRef, useCallback } from 'react'
import { queryAI, analyzeResponse } from '../lib/api'
import { extractSources } from '../lib/aiAnalysis'
import { AI_SEARCH_ENGINES } from '../lib/constants'
import { useResultsStore } from './useStore'

/**
 * Hook for running AI tracking based on Topic Wizard configuration
 * Uses brand.settings.prompts and brand.settings.engines
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
    
    console.log('Tracking config:', { prompts: prompts.length, engines: engines.length, topics: topics.length })

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
            try {
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
                console.warn('Source extraction failed:', e)
              }
              
              // Find topic info
              const topic = topics.find(t => t.id === prompt.topicId) || {}

              results.push({
                brand_id: brand.id,
                user_id: userId,
                batch_id: batchId,
                // Engine info
                platform_id: engineId,
                platform_name: engine.name,
                model: engine.model,
                // Query info
                query: prompt.text,
              query_type: prompt.type || 'branded',
              // Topic info
              topic_id: prompt.topicId,
              topic_name: prompt.topicName || topic.name,
              prompt_persona: prompt.persona,
              prompt_intent: prompt.intent,
              // Analysis
              brand_mention: analysis.brandMention,
              brand_position: analysis.brandPosition,
              sentiment: analysis.sentiment,
              confidence: analysis.confidence,
              mention_count: analysis.mentionCount,
              competitor_mentions: analysis.competitorMentions,
              snippet: analysis.snippet,
              full_response: response,
              // Source attribution (NEW!)
              cited_urls: analysis.citedUrls || [],
              sources: sources,
              // Meta
              cost: cost || 0,
              created_at: new Date().toISOString()
            })

            const emoji = analysis.brandMention === 'leader' ? '🏆' :
                         analysis.brandMention === 'recommended' ? '✅' :
                         analysis.brandMention === 'mentioned' ? '📍' :
                         analysis.brandMention === 'notMentioned' ? '❌' : '⚠️'
            
            addLog(`${emoji} ${engine.name}: ${analysis.brandMention} (${prompt.topicName || 'General'})`, 'info')
            
            // Log sources if found
            if (sources.length > 0) {
              addLog(`   📎 Sources: ${sources.map(s => s.name).join(', ')}`, 'info')
            }
            } catch (analysisErr) {
              console.error('Analysis error:', analysisErr)
              addLog(`⚠️ ${engine.name}: Response received but analysis failed`, 'warning')
            }
          } else {
            addLog(`❌ ${engine.name}: ${error || 'No response'}`, 'error')
          }
        } catch (err) {
          if (err.name === 'AbortError') break
          console.error('Query error:', err)
          addLog(`❌ ${engine.name}: ${err.message}`, 'error')
        }

        // Shorter delay between queries (2 seconds)
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

    // Calculate summary
    const mentioned = results.filter(r => r.brand_mention !== 'notMentioned').length
    const leaders = results.filter(r => r.brand_mention === 'leader').length
    const totalSources = results.reduce((sum, r) => sum + (r.sources?.length || 0), 0)
    addLog(`📊 Summary: ${mentioned}/${results.length} mentions (${leaders} top picks)`, 'success')
    addLog(`🔗 Identified ${totalSources} source citations`, 'success')

    abortRef.current = null
    setIsRunning(false)
    setProgress({ current: 0, total: 0, percentage: 0, prompt: '', engine: '' })

    return results
  }, [isRunning, addLog, addResults])

  const stopTracking = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
      setIsRunning(false)
      setProgress({ current: 0, total: 0, percentage: 0, prompt: '', engine: '' })
      addLog('⏹ Tracking stopped', 'warning')
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
