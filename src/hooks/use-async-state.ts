
import { useState, useCallback, useRef, useEffect } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  lastUpdated: Date | null
}

export interface AsyncStateActions<T> {
  setData: (data: T) => void
  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
  reset: () => void
  execute: (asyncFn: () => Promise<T>) => Promise<T | null>
  retry: () => Promise<T | null>
}

export interface UseAsyncStateOptions {
  initialData?: any
  resetOnUnmount?: boolean
  retryCount?: number
  retryDelay?: number
}

export function useAsyncState<T = any>(
  options: UseAsyncStateOptions = {}
): [AsyncState<T>, AsyncStateActions<T>] {
  const {
    initialData = null,
    resetOnUnmount = false,
    retryCount = 0,
    retryDelay = 1000
  } = options

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastUpdated: null,
  })

  const lastAsyncFnRef = useRef<(() => Promise<T>) | null>(null)
  const retriesRef = useRef(0)
  const mountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (resetOnUnmount) {
        setState({
          data: initialData,
          loading: false,
          error: null,
          lastUpdated: null,
        })
      }
    }
  }, [resetOnUnmount, initialData])

  const setData = useCallback((data: T) => {
    if (!mountedRef.current) return
    setState(prev => ({
      ...prev,
      data,
      error: null,
      lastUpdated: new Date(),
    }))
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    if (!mountedRef.current) return
    setState(prev => ({ ...prev, loading }))
  }, [])

  const setError = useCallback((error: Error | null) => {
    if (!mountedRef.current) return
    setState(prev => ({
      ...prev,
      error,
      loading: false,
    }))
  }, [])

  const reset = useCallback(() => {
    if (!mountedRef.current) return
    setState({
      data: initialData,
      loading: false,
      error: null,
      lastUpdated: null,
    })
    retriesRef.current = 0
    lastAsyncFnRef.current = null
  }, [initialData])

  const executeWithRetry = useCallback(async (
    asyncFn: () => Promise<T>,
    currentRetry = 0
  ): Promise<T | null> => {
    try {
      if (!mountedRef.current) return null
      
      if (currentRetry === 0) {
        setLoading(true)
        setState(prev => ({ ...prev, error: null }))
      }

      const result = await asyncFn()
      
      if (!mountedRef.current) return null
      
      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      }))
      
      retriesRef.current = 0
      return result
    } catch (error) {
      if (!mountedRef.current) return null
      
      const errorObj = error instanceof Error ? error : new Error(String(error))
      
      if (currentRetry < retryCount) {
        console.log(`Tentative ${currentRetry + 1}/${retryCount + 1} échouée, nouvelle tentative dans ${retryDelay}ms...`)
        
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        
        if (!mountedRef.current) return null
        
        return executeWithRetry(asyncFn, currentRetry + 1)
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorObj,
      }))
      
      throw errorObj
    }
  }, [retryCount, retryDelay])

  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T | null> => {
    lastAsyncFnRef.current = asyncFn
    retriesRef.current = 0
    return executeWithRetry(asyncFn)
  }, [executeWithRetry])

  const retry = useCallback(async (): Promise<T | null> => {
    if (!lastAsyncFnRef.current) {
      console.warn('Aucune fonction async à réessayer')
      return null
    }
    
    return executeWithRetry(lastAsyncFnRef.current)
  }, [executeWithRetry])

  const actions: AsyncStateActions<T> = {
    setData,
    setLoading,
    setError,
    reset,
    execute,
    retry,
  }

  return [state, actions]
}

// Hook spécialisé pour les requêtes API
export function useApiCall<T = any>(options: UseAsyncStateOptions = {}) {
  const [state, actions] = useAsyncState<T>({
    retryCount: 2,
    retryDelay: 1000,
    ...options,
  })

  const call = useCallback(async (
    url: string,
    init?: RequestInit
  ): Promise<T | null> => {
    return actions.execute(async () => {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
        ...init,
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data as T
    })
  }, [actions])

  return {
    ...state,
    call,
    retry: actions.retry,
    reset: actions.reset,
  }
}

// Hook pour la gestion optimiste des mutations
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T, optimisticUpdate: Partial<T>) => Promise<T>
) {
  const [state, actions] = useAsyncState<T>({ initialData })
  const [originalData, setOriginalData] = useState<T>(initialData)

  const optimisticUpdate = useCallback(async (
    optimisticData: Partial<T>,
    rollbackOnError = true
  ) => {
    // Sauvegarder les données originales
    setOriginalData(state.data || initialData)
    
    // Appliquer immédiatement la mise à jour optimiste
    const updatedData = { ...(state.data || initialData), ...optimisticData }
    actions.setData(updatedData)

    try {
      // Exécuter la vraie mise à jour
      const result = await updateFn(state.data || initialData, optimisticData)
      actions.setData(result)
      return result
    } catch (error) {
      // En cas d'erreur, rollback si demandé
      if (rollbackOnError) {
        actions.setData(originalData)
      }
      actions.setError(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }, [state.data, initialData, updateFn, actions, originalData])

  return {
    ...state,
    optimisticUpdate,
    reset: actions.reset,
  }
}

export default useAsyncState
