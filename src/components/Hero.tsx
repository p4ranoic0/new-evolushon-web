import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import droneVideo from '../assets/Video-drone.mp4'
import bannerPrincipal from '../assets/banner-principal.jpg'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Hero() {
  const { t } = useTranslation()
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const subtitleRef = useRef<HTMLParagraphElement | null>(null)
  const ctaRef = useRef<HTMLAnchorElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Animación del título con efecto de ola
    if (titleRef.current) {
      const titleText = titleRef.current.textContent || ''
      titleRef.current.innerHTML = titleText.split('').map((char, i) => 
        char === ' ' ? ' ' : `<span class="inline-block opacity-0" data-index="${i}">${char}</span>`
      ).join('')
      
      animate(titleRef.current.querySelectorAll('span'), {
        opacity: [0, 1],
        translateY: [50, 0],
        scale: [0.5, 1],
        delay: (el, i) => i * 50 + 300,
        duration: 800,
        easing: 'out-elastic(1, .8)'
      })
    }

    // Animación del subtítulo
    if (subtitleRef.current) {
      animate(subtitleRef.current, {
        opacity: [0, 1],
        translateY: [30, 0],
        delay: 1200,
        duration: 1000,
        easing: 'out-quad'
      })
    }

    // Animación del botón CTA
    if (ctaRef.current) {
      animate(ctaRef.current, {
        opacity: [0, 1],
        scale: [0.8, 1],
        delay: 1800,
        duration: 800,
        easing: 'out-back'
      })
    }

    // Animación del overlay
    if (overlayRef.current) {
      animate(overlayRef.current, {
        opacity: [0, 1],
        duration: 1500,
        easing: 'linear'
      })
    }
  }, [])

  return (
    <section className="relative overflow-hidden">
      <picture>
        <source srcSet={bannerPrincipal} media="(max-width: 640px)" />
        <video className="w-full h-[70vh] object-cover" autoPlay muted loop playsInline onError={(e) => {
          const wrapper = (e.target as HTMLVideoElement).parentElement
          if (wrapper) {
            wrapper.innerHTML = `<img src="${bannerPrincipal}" alt="Evolushon hero" class="w-full h-[70vh] object-cover"/>`
          }
        }}>
          <source src={droneVideo} type="video/mp4" />
        </video>
      </picture>
      <div ref={overlayRef} className="absolute inset-0 bg-gradient-to-b from-ocean-900/60 via-ocean-900/40 to-ocean-900/70" />
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto max-w-6xl px-4">
          <h1 ref={titleRef} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-surf drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)] [text-shadow:_0_0_40px_rgb(0_0_0_/_90%),_0_0_20px_rgb(0_0_0_/_80%)] text-white mb-2 wrap-break-word leading-tight">{t('hero.title')}</h1>
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-surf drop-shadow-[0_4px_15px_rgba(0,0,0,0.7)] text-brand-light mb-6">Surf Experience</div>
          <p ref={subtitleRef} className="mt-4 md:mt-6 text-lg sm:text-xl md:text-2xl max-w-3xl font-heading opacity-0 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] text-white">{t('hero.subtitle')}</p>
          <Link 
            ref={ctaRef} 
            to="/contacto" 
            className="mt-8 inline-flex items-center gap-2 px-8 md:px-10 py-4 md:py-5 bg-sunset hover:bg-sunset-dark text-white font-surf text-lg md:text-xl rounded-full shadow-sunset hover:shadow-[0_0_30px_rgba(255,107,53,0.6)] transition-all duration-300 transform hover:scale-110 opacity-0 border-2 border-white/20"
          >
            <span>🏄‍♂️</span>
            {t('hero.cta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
