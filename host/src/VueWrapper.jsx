import React, { useEffect, useRef } from 'react'
import * as Vue from 'vue'

export default function VueCounterWrapper() {
  const containerRef = useRef(null)
  const appInstance = useRef(null)

  useEffect(() => {
    let mounted = false

    import('vueMf/Counter').then((module) => {
      if (containerRef.current && !mounted) {
        mounted = true
        const CounterComponent = module.default

        // Создаём Vue app с компонентом
        const app = Vue.createApp(CounterComponent)
        appInstance.current = app
        app.mount(containerRef.current)
      }
    })

    return () => {
      if (appInstance.current) {
        appInstance.current.unmount()
        appInstance.current = null
      }
    }
  }, [])

  return <div ref={containerRef} />
}
