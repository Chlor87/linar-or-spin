import '../common/global.js'
import Base from '../common/Base.js'
import {vec} from '../common/V.js'
import {Circle, Line} from './shapes.js'
import Ray from './Ray.js'
import {BLACK, PRI, RED} from '../common/style.js'
import {pointV} from '../common/utils.js'
import Camera from './Camera.js'
import M from '../common/M.js'

const setKey = (map, v) => ({key}) => {
  if (map.hasOwnProperty(key)) {
    map[key] = v
  }
}

class App extends Base {
  keyMap = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    s: false,
    a: false,
    d: false
  }

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.setup()
    this.setupKeys()
  }

  setup() {
    this.setupDimensions()
    const {ctx, HW, HH} = this
    this.world = [
      new Circle(ctx, vec(300, 0), 75),
      new Circle(ctx, vec(0, 200), 50),
      new Circle(ctx, vec(-100, -300), 100),
      new Line(ctx, vec(-300, -100), vec(-200, 100)),
      new Line(ctx, vec(500, 200), vec(500.1, -200)),

      new Line(ctx, vec(-HW + 1, -HH), vec(-HW + 1.01, HH)),
      new Line(ctx, vec(-HW, HH), vec(HW, HH)),
      new Line(ctx, vec(HW - .1, HH), vec(HW, -HH)),
      new Line(ctx, vec(-HW, -HH), vec(HW, -HH))
    ]
    this.camera = new Camera({
      ctx,
      pos: vec(),
      dir: 0,
      world: this.world,
      HW,
      HH,
      fov: 90
    })
    canvas.addEventListener('mousemove', ({offsetX, offsetY}) => {
      const {HW, HH} = this
    })
  }

  setupKeys = () => {
    addEventListener('keydown', ({key}) => {
      if (key === 'm') {
        this.showMap = !this.showMap
      }
    })
    addEventListener(
      'keydown', setKey(this.keyMap, true),
      {passive: true}
    )
    addEventListener(
      'keyup', setKey(this.keyMap, false),
      {passive: true}
    )
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, W, H, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
  }

  applyKeys = () => {
    const {keyMap, camera} = this
    Object.entries(keyMap).forEach(([k, v]) => {
      if (!v) {
        return
      }
      switch (k) {
        case 'ArrowUp':
        case 'w':
          camera.applyAcc(3)
          break
        case 'ArrowDown':
        case 's':
          camera.applyAcc(-3)
          break
        case 'ArrowLeft':
        case 'a':
          camera.applyAngAcc(0.025)
          break
        case 'ArrowRight':
        case 'd':
          camera.applyAngAcc(-0.025)
          break
      }
    })
  }

  drawScene = () => {
    const {ctx, HW, HH, W, H, camera} = this,
      len = camera.rays.length,
      size = W / len

    ctx.save()
    for (let i = 0; i < len; i++) {
      const ray = camera.rays[len - i - 1]
      let [dist] = ray.march()
      dist *= cos(ray.offset)
      if (HH - dist < 0) {
        continue
      }
      const c = map(dist, 0, HW/2, 255, 0)
      ctx.fillStyle = `rgb(0, ${c}, ${c})`
      ctx.fillRect(-HW + size * i, HH - dist, size + 1, -H + 2 * dist)
    }

    ctx.restore()
  }

  draw = () => {
    const {ctx, HW, HH, W, H, world, applyKeys} = this
    ctx.fillRect(-HW, HH, W, -H)
    requestAnimationFrame(this.draw)
    applyKeys()
    if (this.showMap) {
      for (let shape of world) {
        shape.draw()
      }
      this.camera.draw()
    } else {
      this.camera.update()
      this.drawScene()
    }

    // this.ray.draw()
  }
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = (window.app = new App(document.querySelector('#canvas')))
    requestAnimationFrame(app.draw)
    addEventListener(
      'resize',
      () => {
        app.setupDimensions()
      },
      {passive: true}
    )
  })
})()
