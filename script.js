const sectors = [
  { color: '#FF6B6B', label: '-3' },
  { color: '#06D6A0', label: '4' },
  { color: '#073B4C', label: '10' },
  { color: '#FF6B6B', label: '-3' },
  { color: '#118AB2', label: '7' },
  { color: '#073B4C', label: '10' },
  { color: '#118AB2', label: '7' },
  { color: '#FFD166', label: '02' },
  { color: '#EF476F', label: '12' },
  { color: '#FFD166', label: '02' },
  { color: '#EF476F', label: '12' },
  { color: '#073B4C', label: '10' },
  { color: '#FFD166', label: '00' },
  { color: '#EF476F', label: '12' },
  { color: '#FFD166', label: '00' },
  { color: '#FF6B6B', label: '-3' },
  { color: '#06D6A0', label: '4' },
  { color: '#FFD166', label: '00' },
  { color: '#118AB2', label: '7' },
  { color: '#FFD166', label: '02' },
  { color: '#06D6A0', label: '4' },
];

const rand = (m, M) => Math.random() * (M - m) + m;

const tot = sectors.length;
const elSpin = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / tot;
const angVelMin = 0.002; // Below that number will be treated as a stop
let angVelMax = 0; // Random ang.vel. to accelerate to
let angVel = 0; // Current angular velocity
let ang = 0; // Angle rotation in radians
let isSpinning = false;
let isAccelerating = false;
let animFrame = null; // Engine's requestAnimationFrame

// Sound effects
const wheelSound = new Audio("assets/wheel_sound.wav");
const sadSound = new Audio("assets/sad_sound.wav");

// Winning message element
const winningMessage = document.createElement("div");
winningMessage.style.position = "fixed";
winningMessage.style.top = "50%";
winningMessage.style.left = "50%";
winningMessage.style.transform = "translate(-50%, -50%)";
winningMessage.style.backgroundColor = "white";
winningMessage.style.padding = "20px";
winningMessage.style.borderRadius = "10px";
winningMessage.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
winningMessage.style.fontSize = "34px";
winningMessage.style.textAlign = "center";
winningMessage.style.zIndex = "1000";
winningMessage.style.display = "none"; // Initially hidden
document.body.appendChild(winningMessage);

//* Get index of current sector */
const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

//* Draw sectors and prizes texts to canvas */
const drawSector = (sector, i) => {
  const ang = arc * i;
  ctx.save();
  // COLOR
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();
  // TEXT
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = "#000"; // Black font color
  ctx.font = "bold 24px sans-serif"; // Larger font size
  ctx.fillText(sector.label, rad - 10, 10);
  //
  ctx.restore();
};

//* CSS rotate CANVAS Element */
const rotate = () => {
  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
  elSpin.textContent = !angVel ? "SPIN" : sector.label;
  elSpin.style.background = sector.color;
};

const frame = () => {
  if (!isSpinning) return;

  if (angVel >= angVelMax) isAccelerating = false;

  // Accelerate
  if (isAccelerating) {
    angVel ||= angVelMin; // Initial velocity kick
    angVel *= 1.06; // Accelerate
  }
  // Decelerate
  else {
    isAccelerating = false;
    angVel *= friction; // Decelerate by friction

    // SPIN END:
    if (angVel < angVelMin) {
      isSpinning = false;
      angVel = 0;
      cancelAnimationFrame(animFrame);

      // Get the winning sector
      const winningSector = sectors[getIndex()];

      // Display winning message
      winningMessage.textContent = `${winningSector.label}`;
      winningMessage.style.display = "block";

      // Hide the message after 3 seconds
      setTimeout(() => {
        winningMessage.style.display = "none";
      }, 3000);

      // Play sad sound effect if the result is -3
      if (winningSector.label === "-3") {
        sadSound.play();
      }
    }
  }

  ang += angVel; // Update angle
  ang %= TAU; // Normalize angle
  rotate(); // CSS rotate!
};

const engine = () => {
  frame();
  animFrame = requestAnimationFrame(engine);
};

elSpin.addEventListener("click", () => {
  if (isSpinning) return;
  isSpinning = true;
  isAccelerating = true;

  // Set initial angular velocity
  angVelMax = rand(0.5, 0.7); // Random initial velocity
  angVel = angVelMin; // Start with minimum velocity

  // Calculate required friction to stop in 16 seconds
  const totalTime = 16000; // 16 seconds in milliseconds
  const framesPerSecond = 60; // Assuming 60 FPS
  const totalFrames = (totalTime / 1000) * framesPerSecond; // Total frames in 16 seconds
  friction = Math.pow(angVelMin / angVelMax, 1 / totalFrames); // Dynamic friction calculation

  // Play wheel sound effect
  wheelSound.play();

  engine(); // Start engine!
});

// INIT!
sectors.forEach(drawSector);
rotate(); // Initial rotation