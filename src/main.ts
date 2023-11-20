interface Particle {
  x: number
  y: number
  originX: number
  originY: number
  color: string
}

const canvas = document.querySelector("canvas")!
const ctx = canvas.getContext("2d")!
const particles: Particle[] = []

const PARTICLE_DIAMETER = 10
const REPEL_RADIUS = 50
const REPEL_SPEED = 4
const RETURN_SPEED = 0.1

loadImage("dog.jpg")

let mouseX = Infinity
let mouseY = Infinity

canvas.addEventListener("mousemove", (event) => {
  mouseX = event.offsetX
  mouseY = event.offsetY
})

canvas.addEventListener("mouseleave", () => {
  mouseX = Infinity
  mouseY = Infinity
})

function loadImage(src: string) {
  const img = new Image()
  img.src = src
  img.addEventListener("load", () => initializeParticles(img))
}

function initializeParticles(img: HTMLImageElement) {
  canvas.width = img.width
  canvas.height = img.height

  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, img.width, img.height).data

  const numRows = Math.round(img.height / PARTICLE_DIAMETER)
  const numColumns = Math.round(img.width / PARTICLE_DIAMETER)

  for (let row = 0; row < numRows; row++) {
    for (let column = 0; column < numColumns; column++) {
      const pixelIndex = (row * PARTICLE_DIAMETER * img.width + column * PARTICLE_DIAMETER) * 4

      const red = imageData[pixelIndex]
      const green = imageData[pixelIndex + 1]
      const blue = imageData[pixelIndex + 2]
      const alpha = imageData[pixelIndex + 3]

      particles.push({
        x: Math.floor(Math.random() * numColumns * PARTICLE_DIAMETER),
        y: Math.floor(Math.random() * numRows * PARTICLE_DIAMETER),
        originX: column * PARTICLE_DIAMETER + PARTICLE_DIAMETER / 2,
        originY: row * PARTICLE_DIAMETER + PARTICLE_DIAMETER / 2,
        color: `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`,
      })
    }
  }

  drawParticles()
}

function drawParticles() {
  updateParticles()
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  particles.forEach((particle) => {
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, PARTICLE_DIAMETER / 2, 0, 2 * Math.PI)
    ctx.fillStyle = particle.color
    ctx.fill()
  })
  requestAnimationFrame(drawParticles)
}

function updateParticles() {
  particles.forEach((particle) => {
    applyRepelForce(particle)
    returnToOrigin(particle)
  })
}

function applyRepelForce(particle: Particle) {
  const [distanceFromMouse, angle] = calculateDistanceAndAngle(
    particle.x,
    particle.y,
    mouseX,
    mouseY,
  )

  if (distanceFromMouse < REPEL_RADIUS) {
    const force = (REPEL_RADIUS - distanceFromMouse) / REPEL_RADIUS
    particle.x -= Math.cos(angle) * force * REPEL_SPEED
    particle.y -= Math.sin(angle) * force * REPEL_SPEED
  }
}

function returnToOrigin(particle: Particle) {
  if (particle.x !== particle.originX || particle.y !== particle.originY) {
    const [distanceFromOrigin, angle] = calculateDistanceAndAngle(
      particle.x,
      particle.y,
      particle.originX,
      particle.originY,
    )
    particle.x += Math.cos(angle) * distanceFromOrigin * RETURN_SPEED
    particle.y += Math.sin(angle) * distanceFromOrigin * RETURN_SPEED
  }
}

function calculateDistanceAndAngle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): [number, number] {
  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)
  return [distance, angle]
}
