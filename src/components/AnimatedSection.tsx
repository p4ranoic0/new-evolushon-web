import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useInView } from 'react-intersection-observer'
import { animate } from 'animejs'

interface AnimatedSectionProps {
  children: ReactNode
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'zoom-in'
  delay?: number
  className?: string
}

export default function AnimatedSection({ 
  children, 
  animation = 'fade-up', 
  delay = 0,
  className = ''
}: Readonly<AnimatedSectionProps>) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const setRefs = (node: HTMLDivElement) => {
    sectionRef.current = node
    inViewRef(node)
  }

  useEffect(() => {
    if (inView && sectionRef.current) {
      const animations: Record<string, any> = {
        'fade-up': {
          opacity: [0, 1],
          translateY: [50, 0],
        },
        'fade-in': {
          opacity: [0, 1],
        },
        'slide-left': {
          opacity: [0, 1],
          translateX: [100, 0],
        },
        'slide-right': {
          opacity: [0, 1],
          translateX: [-100, 0],
        },
        'zoom-in': {
          opacity: [0, 1],
          scale: [0.8, 1],
        }
      }

      animate(sectionRef.current, {
        ...animations[animation],
        delay,
        duration: 1000,
        easing: 'out-quad'
      })
    }
  }, [inView, animation, delay])

  return (
    <div ref={setRefs} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
