import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Reveal elements marked with [data-reveal] inside `ref` as they scroll into view.
 * - data-reveal="fade" (default): animate the element itself
 * - data-reveal="stagger": animate its direct children with a stagger
 * - data-reveal-delay="0.2": optional delay in seconds
 */
export function useScrollReveal(ref, deps = []) {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return undefined

    const ctx = gsap.context(() => {
      const scroller = root.closest('.app__main') || undefined
      gsap.utils.toArray('[data-reveal]', root).forEach((el) => {
        const mode = el.dataset.reveal || 'fade'
        const delay = Number(el.dataset.revealDelay) || 0
        const targets = mode === 'stagger' ? Array.from(el.children) : el
        if (!targets || (Array.isArray(targets) && targets.length === 0)) return

        gsap.from(targets, {
          y: 26,
          opacity: 0,
          duration: 0.55,
          delay,
          ease: 'power3.out',
          stagger: mode === 'stagger' ? 0.07 : 0,
          scrollTrigger: { trigger: el, scroller, start: 'top 85%', once: true },
        })
      })

      gsap.utils.toArray('[data-parallax]', root).forEach((el) => {
        const strength = Number(el.dataset.parallax) || 70
        gsap.fromTo(
          el,
          { y: strength },
          {
            y: -strength,
            ease: 'none',
            scrollTrigger: { trigger: el, scroller, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
          },
        )
      })
    }, root)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
