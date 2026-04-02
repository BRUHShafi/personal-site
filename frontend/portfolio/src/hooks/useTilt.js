import { useRef, useCallback } from 'react'

/**
 * useTilt — applies a 3D tilt transform on mousemove.
 * Usage: const { ref, onMouseMove, onMouseLeave } = useTilt()
 * Spread { onMouseMove, onMouseLeave } onto the element and attach ref.
 */
export function useTilt(maxDeg = 10) {
  const ref = useRef(null)

  const onMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el) return

    const { left, top, width, height } = el.getBoundingClientRect()

    // Mouse position relative to card center, normalized -1 to 1
    const x = ((e.clientX - left) / width  - 0.5) * 2
    const y = ((e.clientY - top)  / height - 0.5) * 2

    // rotateY follows X axis, rotateX follows Y axis (inverted)
    const rotateY =  x * maxDeg
    const rotateX = -y * maxDeg

    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }, [maxDeg])

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}
