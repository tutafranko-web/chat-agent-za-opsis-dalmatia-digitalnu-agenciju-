"use client"

import { useEffect, useRef } from "react"

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

interface ShaderAnimationProps {
  stopped?: boolean
}

export function ShaderAnimation({ stopped }: ShaderAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const stoppedRef = useRef(false)

  // Stop the rAF loop immediately when stopped prop becomes true
  useEffect(() => {
    stoppedRef.current = !!stopped
    if (stopped) cancelAnimationFrame(animationRef.current)
  }, [stopped])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", { antialias: true })
    if (!gl) return

    const vertexSource = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `
    const fragmentSource = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time * 0.05;
        float lineWidth = 0.002;
        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i = 0; i < 5; i++){
            color[j] += lineWidth * float(i*i) / abs(fract(t - 0.01*float(j) + float(i)*0.01) * 5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
          }
        }
        gl_FragColor = vec4(color, 1.0);
      }
    `

    const vs = createShader(gl, gl.VERTEX_SHADER, vertexSource)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
    if (!vs || !fs) return

    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    gl.useProgram(program)

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, "position")
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const timeLoc = gl.getUniformLocation(program, "time")
    const resLoc = gl.getUniformLocation(program, "resolution")

    let time = 1.0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    resize()
    window.addEventListener("resize", resize)

    let lastFrame = 0
    const animate = (now: number) => {
      animationRef.current = requestAnimationFrame(animate)
      if (stoppedRef.current) return
      if (now - lastFrame < 33) return
      lastFrame = now
      time += 0.05
      gl.uniform1f(timeLoc, time)
      gl.uniform2f(resLoc, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", resize)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-screen"
      style={{
        background: "#000",
        overflow: "hidden",
        display: "block",
      }}
      aria-hidden="true"
      role="presentation"
    />
  )
}
