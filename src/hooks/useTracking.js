import { useState, useRef, useCallback } from 'react'
import { queryAI, analyzeResponse, getAuthSession } from '../lib/api'
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
    console.log('[runTracking] CALLED with:', { brandName: brand?.name, brandId: brand?.id, userId, isRunning })
    
    if (isRunning) {
      console.log('[runTracking] BLOCKED - already running')
      return
    }
    if (!brand) {
      console.log('[runTracking] BLOCKED - no brand')
      return
    }
    if (!userId) {
      console.log('[runTracking] BLOCKED - no userId')
      return
    }
    
    console.log('[runTracking] PASSED initial checks, continuing...')
    
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

    // Get session ONCE before starting
    addLog('🔑 Getting authentication...', 'info')
    const session = await getAuthSession()
    if (!session) {
      addLog('❌ Not authenticated. Please log in again.', 'error')
      return
    }
    addLog('✅ Authenticated', 'info')

    abortRef.current = new AbortController()
    setIsRunning(true)
    setLogs(prev => prev.slice(-2)) // Keep auth logs
    
    const totalQueries = prompts.length * engines.length
    const results = []
    const batchId = Date.now().toString()
    let queryIndex = 0

    try {
      setProgress({ current: 0, total: totalQueries, percentage: 0, prompt: '', engine: '' })
      addLog(`🚀 Starting tracking for ${brand.name}`, 'info')
      addLog(`📋 ${prompts.length} prompts × ${engines.length} engines = ${totalQueries} queries`, 'info')

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

          console.log(`[Loop] ${queryIndex}/${totalQueries} - ${engine.name}`)

          setProgress({
            current: queryIndex,
            total: totalQueries,
            percentage: Math.round((queryIndex / totalQueries) * 100),
            prompt: prompt.text?.substring(0, 50) + '...',
            engine: engine.name
          })

          try {
            console.log(`[Loop] Calling queryAI...`)
            const { success, response, cost, error } = await queryAI(engine.model, prompt.text, session, 45000)
            console.log(`[Loop] queryAI returned: success=${success}`)

            if (abortRef.current?.signal.aborted) break

            if (success && response) {
              console.log(`[Loop] Response received, length: ${response?.length || 0}`)
              
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
                full_response: response,
                brand_mentioned: analysis.brandMention !== 'notMentioned',
                mention_type: analysis.brandMention,
                brand_position: analysis.brandPosition,
                mention_count: analysis.mentionCount,
                sentiment: analysis.sentiment,
                confidence_score: analysis.confidence,
                competitor_mentions: analysis.competitorMentions || {},
                cited_urls: analysis.citedUrls || [],
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

          // Delay between queries (skip on last iteration)
          if (!abortRef.current?.signal.aborted && queryIndex < totalQueries) {
            console.log(`[Loop] Waiting 2s...`)
            await new Promise(r => setTimeout(r, 2000))
            console.log(`[Loop] Continuing...`)
          }
        }
      }

      // ===== POST-LOOP: Save results =====
      console.log(`[Loop] EXITED - collected ${results.length} results`)
      
      if (results.length > 0) {
        console.log(`[Loop] Saving ${results.length} results to database...`)
        console.log(`[Loop] First result response_text length: ${results[0]?.response_text?.length || 'null'}`)
        console.log(`[Loop] First result full_response length: ${results[0]?.full_response?.length || 'null'}`)
        addLog(`💾 Saving ${results.length} results...`, 'info')
        
        // Save in batches of 10 to avoid payload size issues
        const BATCH_SIZE = 10
        let savedCount = 0
        
        for (let i = 0; i < results.length; i += BATCH_SIZE) {
          const batch = results.slice(i, i + BATCH_SIZE)
          const batchNum = Math.floor(i/BATCH_SIZE) + 1
          const totalBatches = Math.ceil(results.length/BATCH_SIZE)
          console.log(`[Loop] Saving batch ${batchNum}/${totalBatches} (${batch.length} items)`)
          
          try {
            // Add timeout wrapper for the save operation
            const savePromise = addResults(brand.id, batch)
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Save timeout after 30s')), 30000)
            )
            
            await Promise.race([savePromise, timeoutPromise])
            savedCount += batch.length
            console.log(`[Loop] Batch ${batchNum} saved successfully`)
          } catch (batchErr) {
            console.error(`[Loop] Batch ${batchNum} save error:`, batchErr)
            console.error(`[Loop] Error details:`, JSON.stringify(batchErr, null, 2))
            addLog(`⚠️ Failed to save batch ${batchNum}: ${batchErr.message}`, 'warning')
          }
        }
        
        console.log(`[Loop] Save complete: ${savedCount}/${results.length} results`)
        if (savedCount > 0) {
          addLog(`✅ Saved ${savedCount} results to database`, 'success')
        } else {
          addLog(`❌ Failed to save any results`, 'error')
        }
      } else {
        console.log(`[Loop] No results to save`)
        addLog(`⚠️ No successful responses to save`, 'warning')
      }

      console.log(`[Loop] Setting isRunning=false`)
      setProgress({ current: totalQueries, total: totalQueries, percentage: 100, prompt: 'Complete', engine: '' })
      addLog('🏁 Tracking complete!', 'success')
      
    } catch (fatalError) {
      // Catch any unexpected errors that might crash the tracking
      console.error(`[Loop] FATAL ERROR:`, fatalError)
      addLog(`❌ Unexpected error: ${fatalError.message}`, 'error')
    } finally {
      // Always cleanup
      console.log(`[Loop] FINALLY - cleanup`)
      setIsRunning(false)
      abortRef.current = null
    }
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
