"use client"

import { useEffect, useRef, useState } from "react"

function CSSFallback() {
  return (
    <div className="w-full h-full absolute inset-0 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-900/30 to-transparent" />
    </div>
  )
}

export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationIdRef = useRef<number | null>(null)
  const rendererRef = useRef<unknown>(null)
  const [webglFailed, setWebglFailed] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    let cleanup: (() => void) | undefined

    // Dynamic import to avoid SSR issues and enable tree-shaking potential
    import("three").then((THREE) => {
      if (!containerRef.current) return

      try {
        const container = containerRef.current
        container.innerHTML = ""

        const camera = new THREE.Camera()
        camera.position.z = 1

        const scene = new THREE.Scene()
        const geometry = new THREE.PlaneGeometry(2, 2)

        const uniforms = {
          time: { value: 1.0 },
          resolution: { value: new THREE.Vector2() },
        }

        const vertexShader = `
          void main() {
            gl_Position = vec4( position, 1.0 );
          }
        `

        const fragmentShader = `
          precision highp float;
          uniform vec2 resolution;
          uniform float time;

          float random (in float x) {
              return fract(sin(x)*1e4);
          }

          void main(void) {
            vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

            vec2 fMosaicScal = vec2(4.0, 2.0);
            vec2 vScreenSize = vec2(256,256);
            uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
            uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

            float t = time*0.06+random(uv.x)*0.4;
            float lineWidth = 0.0008;

            vec3 color = vec3(0.0);
            for(int j = 0; j < 3; j++){
              for(int i=0; i < 5; i++){
                color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*1.0 - length(uv));
              }
            }

            gl_FragColor = vec4(color[2],color[1],color[0],1.0);
          }
        `

        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
        })

        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)

        const renderer = new THREE.WebGLRenderer()
        renderer.setPixelRatio(window.devicePixelRatio)
        container.appendChild(renderer.domElement)
        rendererRef.current = renderer

        const onWindowResize = () => {
          const rect = container.getBoundingClientRect()
          renderer.setSize(rect.width, rect.height)
          uniforms.resolution.value.x = renderer.domElement.width
          uniforms.resolution.value.y = renderer.domElement.height
        }

        onWindowResize()
        window.addEventListener("resize", onWindowResize)

        const animate = () => {
          animationIdRef.current = requestAnimationFrame(animate)
          uniforms.time.value += 0.05
          renderer.render(scene, camera)
        }

        animate()

        cleanup = () => {
          window.removeEventListener("resize", onWindowResize)
          if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
          renderer.dispose()
          geometry.dispose()
          material.dispose()
        }
      } catch {
        setWebglFailed(true)
      }
    }).catch(() => {
      setWebglFailed(true)
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  if (webglFailed) return <CSSFallback />

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0"
    />
  )
}
