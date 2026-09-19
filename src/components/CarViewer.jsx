import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { brandColorOf } from '../store/data.js'
import { CompassIcon } from './icons.jsx'

const WHEEL_X = 0.56
const ARCH_R = 0.3

function archInto(shape, cx, cy, r = ARCH_R, segments = 22) {
  for (let i = 0; i <= segments; i++) {
    const a = Math.PI - (Math.PI * i) / segments
    shape.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
  }
}

function buildBody(hex) {
  const paint = new THREE.MeshPhysicalMaterial({
    color: hex,
    metalness: 0.55,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.1,
  })

  const shape = new THREE.Shape()
  shape.moveTo(1.0, 0.52)
  shape.lineTo(0.84, 0.62)
  shape.lineTo(0.2, 0.64)
  shape.lineTo(0.0, 0.9)
  shape.lineTo(-0.22, 0.9)
  shape.lineTo(-0.52, 0.64)
  shape.lineTo(-0.94, 0.6)
  shape.lineTo(-1.0, 0.5)
  shape.lineTo(-1.0, 0.3)
  shape.lineTo(-0.9, 0.09)
  shape.lineTo(-0.86, 0.3)
  archInto(shape, -WHEEL_X, 0.3)
  shape.lineTo(-0.24, 0.09)
  shape.lineTo(0.24, 0.09)
  shape.lineTo(0.26, 0.3)
  archInto(shape, WHEEL_X, 0.3)
  shape.lineTo(1.0, 0.3)
  shape.lineTo(1.0, 0.52)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.8,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 5,
    bevelOffset: 0,
  })
  geo.translate(0, 0, -0.45)
  const body = new THREE.Mesh(geo, paint)
  body.castShadow = true
  body.receiveShadow = true
  return body
}

function buildGreenhouse() {
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#0d2636',
    metalness: 0,
    roughness: 0.06,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
    transparent: true,
    opacity: 0.5,
    envMapIntensity: 1.6,
  })
  const shape = new THREE.Shape()
  shape.moveTo(0.2, 0.66)
  shape.lineTo(0.02, 0.9)
  shape.lineTo(-0.24, 0.9)
  shape.lineTo(-0.52, 0.66)
  shape.lineTo(0.2, 0.66)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.6,
    bevelEnabled: false,
  })
  geo.translate(0, 0, -0.3)
  const canopy = new THREE.Mesh(geo, glass)
  canopy.castShadow = true
  return canopy
}

function buildWheelMaterial() {
  const tire = new THREE.MeshStandardMaterial({ color: '#15161a', metalness: 0.05, roughness: 0.9 })
  const hub = new THREE.MeshStandardMaterial({ color: '#aab0bd', metalness: 0.85, roughness: 0.22, envMapIntensity: 1.2 })
  const spoke = new THREE.MeshStandardMaterial({ color: '#9aa2b0', metalness: 0.9, roughness: 0.18, envMapIntensity: 1.3 })
  const cap = new THREE.MeshStandardMaterial({ color: '#e6e9ef', metalness: 1, roughness: 0.12, envMapIntensity: 1.4 })
  return { tire, hub, spoke, cap }
}

function buildWheel(side, x, mats) {
  const group = new THREE.Group()
  const z = side * 0.5

  const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.19, 28), mats.tire)
  tire.rotation.x = Math.PI / 2
  tire.castShadow = true
  group.add(tire)

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.2, 18), mats.hub)
  barrel.rotation.x = Math.PI / 2
  group.add(barrel)

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.13, 0.19), mats.spoke)
    spoke.rotation.z = a
    spoke.position.set(Math.cos(a) * 0.08, Math.sin(a) * 0.08, 0)
    group.add(spoke)
  }

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 14), mats.cap)
  cap.rotation.x = Math.PI / 2
  group.add(cap)

  group.position.set(x, 0.3, z)
  return group
}

function buildDetails() {
  const group = new THREE.Group()
  const dark = new THREE.MeshStandardMaterial({ color: '#13161d', metalness: 0.7, roughness: 0.35 })
  const chrome = new THREE.MeshStandardMaterial({ color: '#cfd4dd', metalness: 1, roughness: 0.15, envMapIntensity: 1.4 })
  const head = new THREE.MeshStandardMaterial({ color: '#fff7e0', emissive: '#fff6d8', emissiveIntensity: 1.4 })
  const tail = new THREE.MeshStandardMaterial({ color: '#ff2222', emissive: '#ff2828', emissiveIntensity: 1.1 })
  const plate = new THREE.MeshStandardMaterial({ color: '#f2f4f7', emissive: '#ffffff', emissiveIntensity: 0.12, roughness: 0.5 })

  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.16, 0.56), dark)
  grille.position.set(1.02, 0.33, 0)
  group.add(grille)

  const splitter = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.62), dark)
  splitter.position.set(0.92, 0.115, 0)
  group.add(splitter)

  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.44), dark)
  diffuser.position.set(-0.94, 0.15, 0)
  group.add(diffuser)

  const headL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.045, 0.06), head)
  headL.position.set(1.045, 0.46, 0.22)
  group.add(headL)
  const headR = headL.clone()
  headR.position.z = -0.22
  group.add(headR)

  const tailBar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.05, 0.72), tail)
  tailBar.position.set(-1.06, 0.47, 0)
  group.add(tailBar)

  const plat = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.14, 0.26), plate)
  plat.position.set(-1.075, 0.42, 0)
  group.add(plat)

  for (const x of [-1, 1]) {
    const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.09, 12), chrome)
    ex.rotation.z = Math.PI / 2
    ex.position.set(-1.03, 0.2, x * 0.16)
    group.add(ex)
  }

  for (const s of [-1, 1]) {
    const mirror = new THREE.Group()
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.06), dark)
    arm.position.set(0.26, 0.66, 0.32 * s)
    mirror.add(arm)
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.08), chrome)
    face.position.set(0.26, 0.66, 0.34 * s)
    mirror.add(face)
    group.add(mirror)
  }

  return group
}

function buildWheels(mats) {
  const group = new THREE.Group()
  for (const side of [-1, 1]) {
    group.add(buildWheel(side, WHEEL_X, mats))
    group.add(buildWheel(side, -WHEEL_X, mats))
  }
  return group
}

function buildCar(hex) {
  const group = new THREE.Group()
  group.add(buildBody(hex))
  group.add(buildGreenhouse())
  group.add(buildDetails())
  const mats = buildWheelMaterial()
  group.add(buildWheels(mats))
  return group
}

function softFloor() {
  const mat = new THREE.MeshStandardMaterial({
    color: '#0b0d13',
    metalness: 0.85,
    roughness: 0.3,
    envMapIntensity: 0.8,
  })
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48), mat)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = -0.02
  mesh.receiveShadow = true
  return mesh
}

function groundBlob() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(0,0,0,0.5)')
  grad.addColorStop(0.55, 'rgba(0,0,0,0.18)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(canvas)
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), m)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = 0.011
  return { mesh, tex }
}

function disposeObject(obj) {
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose()
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((m) => {
        if (m.map) m.map.dispose()
        m.dispose()
      })
    }
  })
}

export function CarViewer({ name = 'Model', brand = '', className = '', minimal = false, ...rest }) {
  const containerRef = useRef(null)
  const [spin, setSpin] = useState(true)
  const [phase, setPhase] = useState('loading')
  const stateRef = useRef({ scene: null, controls: null, raf: 0, disposed: false })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let width = container.clientWidth || 1
    let height = container.clientHeight || 1

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
    camera.position.set(1.1, 1.7, 4.1)
    if (minimal) camera.position.set(0.95, 1.6, 3.7)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex
    scene.environmentIntensity = 0.6

    const ambient = new THREE.AmbientLight(0xffffff, 0.28)
    scene.add(ambient)

    const key = new THREE.DirectionalLight(0xfff4e0, 1.9)
    key.position.set(2.5, 5, 4)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.near = 0.5
    key.shadow.camera.far = 12
    key.shadow.camera.left = -3
    key.shadow.camera.right = 3
    key.shadow.camera.top = 3
    key.shadow.camera.bottom = -3
    key.shadow.bias = -0.0004
    key.shadow.normalBias = 0.02
    scene.add(key)

    const rim = new THREE.PointLight(0x6fb8ff, 1.2, 12)
    rim.position.set(-3.2, 3.2, -3)
    scene.add(rim)
    const warm = new THREE.PointLight(0xffb37a, 0.6, 10)
    warm.position.set(3, 1.4, 3.6)
    scene.add(warm)

    scene.add(softFloor())
    const blob = groundBlob()
    scene.add(blob.mesh)

    const hex = brandColorOf(brand)
    const car = buildCar(hex)
    car.position.y = 0.02
    scene.add(car)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 1.8
    controls.maxDistance = 6.5
    controls.maxPolarAngle = Math.PI / 2.15
    controls.target.set(0, 0.45, 0)
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.5
    if (minimal) {
      controls.enableZoom = false
      controls.enablePan = false
      controls.autoRotateSpeed = 0.7
    }

    stateRef.current = { scene, controls, raf: 0, disposed: false }
    setPhase('ready')

    const tick = () => {
      if (stateRef.current.disposed) return
      controls.update()
      renderer.render(scene, camera)
      stateRef.current.raf = requestAnimationFrame(tick)
    }
    tick()

    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect?.width || 1
      const h = entry.contentRect?.height || 1
      if (Math.abs(w - width) < 1 && Math.abs(h - height) < 1) return
      width = w
      height = h
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(container)

    return () => {
      stateRef.current.disposed = true
      cancelAnimationFrame(stateRef.current.raf)
      ro.disconnect()
      controls.dispose()
      envTex.dispose()
      pmrem.dispose()
      blob.tex.dispose()
      renderer.dispose()
      disposeObject(scene)
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      container.innerHTML = ''
    }
  }, [name, brand, minimal])

  useEffect(() => {
    const s = stateRef.current
    if (s.controls) s.controls.autoRotate = spin
  }, [spin])

  return (
    <div className={`cview ${className}`.trim()} {...rest}>
      <div ref={containerRef} className="cview__scene" />
      {phase === 'ready' ? (
        <>
          {minimal ? null : <span className="cview__badge">3D</span>}
          {minimal ? null : (
            <button
              type="button"
              className="cview__spin"
              aria-label={spin ? 'Pause rotation' : 'Resume rotation'}
              aria-pressed={spin}
              onClick={() => setSpin((s) => !s)}
            >
              <CompassIcon size={15} /> {spin ? 'Spin' : 'Paused'}
            </button>
          )}
          {minimal ? null : <span className="cview__hint">Drag to rotate · scroll to zoom</span>}
        </>
      ) : (
        <div className="cview__loading" aria-hidden="true" />
      )}
    </div>
  )
}