/**
 * 2D Physics Engine & Terrain Generator
 * Hill Climb Racing style spring-damper suspension + chassis physics
 * Multi-vehicle catalog: Cars, Bikes, Buses, Trucks
 * Smooth, easy-to-handle physics & Rocket Boost propulsion for climbing steep hills
 */

const VEHICLE_DEFS = {
  // --- CARS ---
  buggy: {
    id: 'buggy',
    name: 'Hill Buggy',
    category: 'car',
    cost: 0,
    description: 'The iconic classic. Lightweight and agile on all hills.',
    wheelRadius: 22,
    rearWheelRadius: 22,
    frontWheelRadius: 22,
    wheelBaseHalf: 46,
    suspensionRestLength: 32,
    mass: 900,
    width: 100,
    height: 34,
    headOffset: { x: -4, y: -36 },
    headRadius: 11,
    driveForceMul: 1.15,
    maxSpeedMul: 1.05,
    springKMul: 1.0,
    airRotationMul: 1.1,
    weightSagFactor: 1.0,
    stats: { speed: 65, power: 75, suspension: 80, stability: 75 }
  },
  muscle: {
    id: 'muscle',
    name: 'V8 Hot Rod',
    category: 'car',
    cost: 12000,
    description: 'Roaring V8 muscle with supercharger blower & fat rear slicks.',
    wheelRadius: 23,
    rearWheelRadius: 25,
    frontWheelRadius: 19,
    wheelBaseHalf: 52,
    suspensionRestLength: 28,
    mass: 1100,
    width: 112,
    height: 32,
    headOffset: { x: -10, y: -33 },
    headRadius: 11,
    driveForceMul: 1.35,
    maxSpeedMul: 1.25,
    springKMul: 1.15,
    airRotationMul: 1.0,
    weightSagFactor: 1.15,
    stats: { speed: 90, power: 88, suspension: 70, stability: 80 }
  },
  rally: {
    id: 'rally',
    name: 'Turbo Rally',
    category: 'car',
    cost: 30000,
    description: 'Aerodynamic rear wing, turbo all-wheel drive, and sharp cornering.',
    wheelRadius: 22,
    rearWheelRadius: 22,
    frontWheelRadius: 22,
    wheelBaseHalf: 48,
    suspensionRestLength: 30,
    mass: 960,
    width: 106,
    height: 33,
    headOffset: { x: -8, y: -35 },
    headRadius: 11,
    driveForceMul: 1.45,
    maxSpeedMul: 1.35,
    springKMul: 1.25,
    airRotationMul: 1.15,
    weightSagFactor: 1.0,
    stats: { speed: 95, power: 92, suspension: 88, stability: 90 }
  },

  // --- BIKES ---
  dirtbike: {
    id: 'dirtbike',
    name: 'Motocross 250',
    category: 'bike',
    cost: 8000,
    description: 'Ultra-light stunt bike. Crazy air flips, huge jumps, and extreme agility!',
    isBike: true,
    wheelRadius: 21,
    rearWheelRadius: 21,
    frontWheelRadius: 21,
    wheelBaseHalf: 36,
    suspensionRestLength: 36,
    mass: 550,
    width: 82,
    height: 42,
    headOffset: { x: 2, y: -44 },
    headRadius: 11,
    driveForceMul: 1.25,
    maxSpeedMul: 1.15,
    springKMul: 1.2,
    airRotationMul: 1.6, // Extreme air flip stunts
    weightSagFactor: 0.65,
    stats: { speed: 80, power: 80, suspension: 95, stability: 70 }
  },
  chopper: {
    id: 'chopper',
    name: 'V-Twin Chopper',
    category: 'bike',
    cost: 22000,
    description: 'Raked-out chrome fork, fat rear tire, ape-hanger bars, and low leather seat.',
    isBike: true,
    wheelRadius: 22,
    rearWheelRadius: 24,
    frontWheelRadius: 21,
    wheelBaseHalf: 52,
    suspensionRestLength: 28,
    mass: 750,
    width: 110,
    height: 40,
    headOffset: { x: -12, y: -40 },
    headRadius: 11,
    driveForceMul: 1.3,
    maxSpeedMul: 1.2,
    springKMul: 1.0,
    airRotationMul: 1.25,
    weightSagFactor: 0.8,
    stats: { speed: 85, power: 85, suspension: 75, stability: 78 }
  },

  // --- BUSES ---
  schoolbus: {
    id: 'schoolbus',
    name: 'School Bus',
    category: 'bus',
    cost: 18000,
    description: 'Long yellow heavy chassis. Heavy momentum clears the steepest peaks!',
    wheelRadius: 23,
    rearWheelRadius: 23,
    frontWheelRadius: 23,
    wheelBaseHalf: 68,
    suspensionRestLength: 30,
    mass: 1800,
    width: 154,
    height: 52,
    headOffset: { x: 42, y: -38 },
    headRadius: 11,
    driveForceMul: 1.45,
    maxSpeedMul: 1.05,
    springKMul: 1.35,
    airRotationMul: 0.8,
    weightSagFactor: 1.5,
    stats: { speed: 65, power: 90, suspension: 75, stability: 82 }
  },
  doubledecker: {
    id: 'doubledecker',
    name: 'Double Decker',
    category: 'bus',
    cost: 40000,
    description: 'Iconic two-story city bus. Massive torque and climbing momentum!',
    wheelRadius: 24,
    rearWheelRadius: 24,
    frontWheelRadius: 24,
    wheelBaseHalf: 72,
    suspensionRestLength: 32,
    mass: 2200,
    width: 158,
    height: 74,
    headOffset: { x: 44, y: -36 },
    headRadius: 11,
    driveForceMul: 1.55,
    maxSpeedMul: 1.0,
    springKMul: 1.5,
    airRotationMul: 0.7,
    weightSagFactor: 1.8,
    stats: { speed: 60, power: 95, suspension: 70, stability: 75 }
  },

  // --- TRUCKS ---
  pickup: {
    id: 'pickup',
    name: '4x4 Monster',
    category: 'truck',
    cost: 15000,
    description: 'Huge high-lift clearance, massive knobby tires, and raw hill-climbing power.',
    wheelRadius: 27,
    rearWheelRadius: 27,
    frontWheelRadius: 27,
    wheelBaseHalf: 54,
    suspensionRestLength: 36,
    mass: 1400,
    width: 124,
    height: 48,
    headOffset: { x: -6, y: -40 },
    headRadius: 11,
    driveForceMul: 1.45,
    maxSpeedMul: 1.2,
    springKMul: 1.3,
    airRotationMul: 0.95,
    weightSagFactor: 1.3,
    stats: { speed: 80, power: 95, suspension: 92, stability: 88 }
  },
  bigrig: {
    id: 'bigrig',
    name: 'Titan Semi',
    category: 'truck',
    cost: 50000,
    description: 'Giant chrome grille, vertical twin exhausts, unstoppable torque train.',
    wheelRadius: 26,
    rearWheelRadius: 26,
    frontWheelRadius: 26,
    wheelBaseHalf: 76,
    suspensionRestLength: 34,
    mass: 2400,
    width: 168,
    height: 60,
    headOffset: { x: 38, y: -44 },
    headRadius: 11,
    driveForceMul: 1.65,
    maxSpeedMul: 1.12,
    springKMul: 1.6,
    airRotationMul: 0.65,
    weightSagFactor: 1.9,
    stats: { speed: 75, power: 100, suspension: 82, stability: 92 }
  }
};

class TerrainGenerator {
  constructor() {
    this.stage = 'countryside';
    this.gravity = 1450; // pixels / s^2 - Stable, grounded racing feel
    this.friction = 0.96;
    this.activeVehicleX = 0;
    this.activeVehicleWeight = 1.0;
  }

  setStage(stageName) {
    this.stage = stageName;
    switch (stageName) {
      case 'desert':
        this.gravity = 1420;
        this.friction = 0.92;
        break;
      case 'arctic':
        this.gravity = 1450;
        this.friction = 0.78; // Slippery icy hills
        break;
      case 'volcano':
        this.gravity = 1520; // Heavy molten volcanic gravity
        this.friction = 0.94;
        break;
      case 'mars':
        this.gravity = 780; // Extraterrestrial low gravity
        this.friction = 0.90;
        break;
      case 'moon':
        this.gravity = 520; // Low lunar gravity space jumps
        this.friction = 0.88;
        break;
      case 'countryside':
      default:
        this.stage = 'countryside';
        this.gravity = 1450;
        this.friction = 0.96;
        break;
    }
  }

  isSpace() {
    return this.stage === 'moon' || this.stage === 'mars';
  }

  hasAtmosphere() {
    return !this.isSpace();
  }

  getStageBaseHeight(x, stage = this.stage) {
    if (x < 320) return 500;
    const t = x - 320;
    let h = 500;
    const distFactor = Math.min(2.2, 1.0 + (x / 10000) * 0.8);

    switch (stage) {
      case 'desert':
        h += (Math.sin(t * 0.0016) * 120
           + Math.sin(t * 0.0038) * 70
           + Math.cos(t * 0.0008) * 100
           + Math.sin(t * 0.008) * 30) * distFactor;
        break;
      case 'arctic':
        h += (Math.sin(t * 0.0028) * 115
           + Math.sin(t * 0.0075) * 60
           + Math.cos(t * 0.0012) * 130
           + Math.sin(t * 0.012) * 25) * distFactor;
        break;
      case 'volcano':
        h += (Math.sin(t * 0.0035) * 125
           + Math.sin(t * 0.0085) * 65
           + Math.cos(t * 0.0016) * 135
           + Math.sin(t * 0.014) * 30) * distFactor;
        break;
      case 'mars':
        h += (Math.sin(t * 0.0018) * 150
           + Math.sin(t * 0.0042) * 75
           + Math.cos(t * 0.0007) * 120
           + Math.sin(t * 0.009) * 35) * distFactor;
        break;
      case 'moon':
        h += (Math.sin(t * 0.0012) * 170
           + Math.sin(t * 0.0032) * 85
           + Math.cos(t * 0.0005) * 130) * distFactor;
        break;
      case 'countryside':
      default:
        h += (Math.sin(t * 0.0022) * 105
            + Math.sin(t * 0.0055) * 52
            + Math.cos(t * 0.0009) * 78
            + Math.sin(t * 0.009) * 26) * distFactor;
        break;
    }
    return h;
  }

  getHeight(x) {
    let h = this.getStageBaseHeight(x);

    // Deep Chasm Canyon underneath every bridge: every 2400px (starts at x=800)
    const chasmInterval = 2400;
    const bridgeSpan = 340;
    const chasmOffset = (x - 800) % chasmInterval;
    if (chasmOffset > 0 && chasmOffset < bridgeSpan) {
      const chasmRatio = chasmOffset / bridgeSpan;
      const chasmDepth = Math.sin(chasmRatio * Math.PI) * 190;
      h += chasmDepth;
    }

    return h;
  }

  isBridge(x) {
    const chasmInterval = 2400;
    const bridgeSpan = 340;
    const chasmOffset = (x - 800) % chasmInterval;
    return chasmOffset >= 0 && chasmOffset <= bridgeSpan;
  }

  getBridgeInfo(x) {
    const chasmInterval = 2400;
    const bridgeSpan = 340;
    const startX = Math.floor((x - 800) / chasmInterval) * chasmInterval + 800;
    const endX = startX + bridgeSpan;
    return { startX, endX, span: bridgeSpan };
  }

  getBridgeHeight(x) {
    const { startX, endX, span } = this.getBridgeInfo(x);
    const h1 = this.getStageBaseHeight(startX);
    const h2 = this.getStageBaseHeight(endX);
    const t = Math.max(0, Math.min(1, (x - startX) / span));

    // Cosine smoothing between cliff edges
    const baseH = h1 + (h2 - h1) * (0.5 - 0.5 * Math.cos(t * Math.PI));

    // Static catenary sag curve
    const staticSag = Math.sin(t * Math.PI) * 20;

    // Dynamic weight deflection when vehicle crosses
    let dynamicSag = 0;
    if (this.activeVehicleX && Math.abs(x - this.activeVehicleX) < 140) {
      const dist = Math.abs(x - this.activeVehicleX);
      const factor = 1 - dist / 140;
      dynamicSag = factor * factor * 16 * (this.activeVehicleWeight || 1.0);
    }

    return baseH + staticSag + dynamicSag;
  }

  getEffectiveHeight(x) {
    if (this.isBridge(x)) {
      return this.getBridgeHeight(x);
    }
    return this.getHeight(x);
  }

  getSlope(x) {
    const dx = 2.0;
    const h1 = this.getEffectiveHeight(x - dx);
    const h2 = this.getEffectiveHeight(x + dx);
    return (h2 - h1) / (dx * 2);
  }

  getTangent(x) {
    const slope = this.getSlope(x);
    const len = Math.sqrt(1 + slope * slope);
    return {
      x: 1 / len,
      y: slope / len
    };
  }

  getNormal(x) {
    const tangent = this.getTangent(x);
    return {
      x: -tangent.y,
      y: tangent.x
    };
  }
}

class Vehicle {
  constructor(upgrades = { engine: 1, suspension: 1, tires: 1, fourwd: 1 }, terrain = null, vehicleType = 'buggy') {
    this.reset(upgrades, 220, terrain, vehicleType);
  }

  reset(upgrades = { engine: 1, suspension: 1, tires: 1, fourwd: 1 }, startX = 220, terrain = null, vehicleType = 'buggy') {
    this.upgrades = upgrades;
    this.vehicleType = vehicleType;
    this.vehicleDef = VEHICLE_DEFS[vehicleType] || VEHICLE_DEFS.buggy;

    // Chassis geometry configured from vehicle definition
    this.x = startX;
    const startGround = terrain ? terrain.getHeight(startX) : 500;

    this.wheelBaseHalf = this.vehicleDef.wheelBaseHalf;
    this.wheelRadius = this.vehicleDef.wheelRadius;
    this.rearWheelRadius = this.vehicleDef.rearWheelRadius || this.wheelRadius;
    this.frontWheelRadius = this.vehicleDef.frontWheelRadius || this.wheelRadius;
    this.suspensionRestLength = this.vehicleDef.suspensionRestLength;

    // Place vehicle so wheels rest naturally on terrain
    this.y = startGround - this.rearWheelRadius - this.suspensionRestLength + 2;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.angularVel = 0;
    this.width = this.vehicleDef.width;
    this.height = this.vehicleDef.height;

    // Wheels state
    this.rearWheel = {
      x: this.x - this.wheelBaseHalf,
      y: this.y + this.suspensionRestLength,
      radius: this.rearWheelRadius,
      grounded: true,
      rot: 0,
      rotVel: 0
    };

    this.frontWheel = {
      x: this.x + this.wheelBaseHalf,
      y: this.y + this.suspensionRestLength,
      radius: this.frontWheelRadius,
      grounded: true,
      rot: 0,
      rotVel: 0
    };

    // Driver head relative offset
    this.headOffset = { x: this.vehicleDef.headOffset.x, y: this.vehicleDef.headOffset.y };
    this.headRadius = this.vehicleDef.headRadius || 11;
    this.isDead = false;

    // Air flips & stunts
    this.midAir = false;
    this.airTime = 0;
    this.totalRotation = 0;
    this.lastAngle = 0;

    this.updateStats();
  }

  updateStats() {
    const def = this.vehicleDef;
    const engineLvl = this.upgrades.engine || 1;
    this.driveForce = (820 + (engineLvl - 1) * 125) * (def.driveForceMul || 1.0);
    this.maxSpeed = (560 + (engineLvl - 1) * 65) * (def.maxSpeedMul || 1.0);

    const suspLvl = this.upgrades.suspension || 1;
    this.springK = (480 + (suspLvl - 1) * 40) * (def.springKMul || 1.0);
    this.springDamp = 20 + (suspLvl - 1) * 2.5;

    const tiresLvl = this.upgrades.tires || 1;
    this.tireGrip = 1.1 + (tiresLvl - 1) * 0.14;

    const fourwdLvl = this.upgrades.fourwd || 1;
    this.fourwdBonus = 1.05 + (fourwdLvl - 1) * 0.15;
  }

  update(dt, input, terrain) {
    if (this.isDead) return;

    // Update active position for dynamic bridge deflection
    terrain.activeVehicleX = this.x;
    terrain.activeVehicleWeight = this.vehicleDef.weightSagFactor || 1.0;

    // Substep integration for high stability & smooth physics
    const subSteps = 3;
    const subDt = dt / subSteps;

    for (let i = 0; i < subSteps; i++) {
      this.stepPhysics(subDt, input, terrain);
    }

    this.checkStunts(dt);
  }

  stepPhysics(dt, input, terrain) {
    // Gravity pulls chassis
    this.vy += terrain.gravity * dt;

    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    const downX = -sin;
    const downY = cos;

    // Chassis suspension mount points
    const rmX = this.x - this.wheelBaseHalf * cos;
    const rmY = this.y - this.wheelBaseHalf * sin;
    const fmX = this.x + this.wheelBaseHalf * cos;
    const fmY = this.y + this.wheelBaseHalf * sin;

    // Ground height at each wheel
    const rwGround = terrain.getEffectiveHeight(rmX);
    const fwGround = terrain.getEffectiveHeight(fmX);

    // Target wheel positions
    const rwTargetY = rmY + downY * this.suspensionRestLength;
    const fwTargetY = fmY + downY * this.suspensionRestLength;

    // Compression amounts
    const rwComp = Math.max(0, (rwTargetY + this.rearWheelRadius) - rwGround);
    const fwComp = Math.max(0, (fwTargetY + this.frontWheelRadius) - fwGround);

    this.rearWheel.grounded = rwComp > 0;
    this.frontWheel.grounded = fwComp > 0;
    const isGrounded = this.rearWheel.grounded || this.frontWheel.grounded;

    // Update actual wheel positions for rendering
    this.rearWheel.x = rmX + downX * (this.suspensionRestLength - rwComp * 0.55);
    this.rearWheel.y = rwTargetY - rwComp;
    this.frontWheel.x = fmX + downX * (this.suspensionRestLength - fwComp * 0.55);
    this.frontWheel.y = fwTargetY - fwComp;

    // Suspension upward push on chassis
    let f_net_susp = 0;
    if (rwComp > 0 || fwComp > 0) {
      const f_spring = (rwComp + fwComp) * this.springK * 0.5;
      const verticalCompSpeed = (this.vy * downY + this.vx * downX);
      const f_damp = verticalCompSpeed > 0 ? (verticalCompSpeed * this.springDamp) : (verticalCompSpeed * this.springDamp * 0.3);
      f_net_susp = Math.max(0, f_spring + f_damp);
    }

    this.vy -= f_net_susp * downY * dt;
    this.vx -= f_net_susp * downX * dt;

    // Aerodynamic Downforce: keeps vehicle planted to hills when driving fast
    if (isGrounded) {
      const speed = Math.abs(this.vx);
      this.vy += Math.min(280, speed * 0.32) * dt;
    }

    // Restorative rotational torque from difference in wheel compression
    const torque = (rwComp - fwComp) * 24.0;
    const torque_damp = this.angularVel * 12.0;
    this.angularVel += (torque - torque_damp) * dt;

    // Ground Propulsion & Traction
    if (isGrounded) {
      const tangent = terrain.getTangent(this.x);
      const grip = terrain.friction * this.tireGrip * this.fourwdBonus;

      // Active Ground Handling Assist: Gently align chassis with terrain angle to prevent accidental rear flips
      const terrainAngle = Math.atan2(tangent.y, tangent.x);
      let angleDiff = this.angle - terrainAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.angularVel -= angleDiff * 6.5 * dt;

      if (input.gas) {
        // Accelerate along terrain slope
        const currentSpeed = this.vx * tangent.x + this.vy * tangent.y;
        if (currentSpeed < this.maxSpeed) {
          this.vx += tangent.x * this.driveForce * grip * dt;
          this.vy += tangent.y * this.driveForce * grip * dt;
        }

        // Controlled hill wheelie
        const slope = terrain.getSlope(this.x);
        if (slope < -0.45) {
          this.angularVel -= (this.vehicleDef.isBike ? 2.5 : 1.2) * dt;
        }

        // Wheel spin
        this.rearWheel.rotVel = Math.min(45, this.rearWheel.rotVel + 45 * dt);
        this.frontWheel.rotVel = Math.min(45, this.frontWheel.rotVel + 40 * dt);
      } else if (input.brake) {
        // Active braking
        this.vx -= tangent.x * this.driveForce * 0.9 * dt;
        this.vy -= tangent.y * this.driveForce * 0.9 * dt;
        this.rearWheel.rotVel *= 0.82;
        this.frontWheel.rotVel *= 0.82;
      } else {
        // Natural rolling
        const groundSpeed = (this.vx * tangent.x + this.vy * tangent.y) / this.wheelRadius;
        this.rearWheel.rotVel += (groundSpeed - this.rearWheel.rotVel) * 0.25;
        this.frontWheel.rotVel += (groundSpeed - this.frontWheel.rotVel) * 0.25;
      }

      // Rolling friction
      this.vx *= Math.pow(0.992, dt * 60);
      this.vy *= Math.pow(0.992, dt * 60);
    } else {
      // Responsive Mid-air pitch rotation controls for smooth landing
      const airMult = this.vehicleDef.airRotationMul || 1.0;
      if (input.gas) {
        this.angularVel -= 6.2 * airMult * dt; // Tilt nose forward
      }
      if (input.brake) {
        this.angularVel += 6.2 * airMult * dt; // Tilt nose backward
      }

      // Air stability damping to prevent spinning out
      this.angularVel *= Math.pow(0.96, dt * 60);

      // Idle air wheel spin
      this.rearWheel.rotVel *= 0.96;
      this.frontWheel.rotVel *= 0.96;
    }

    // ==========================================
    // ROCKET BOOSTER PROPULSION
    // Powerful uphill thrust available to all vehicles
    // ==========================================
    if (input.boost) {
      const tangent = terrain.getTangent(this.x);
      const boostForward = 1450 * dt;
      const boostLift = 320 * dt;

      // Thrust along vehicle heading & terrain forward slope
      this.vx += (tangent.x * 0.6 + cos * 0.4) * boostForward;
      this.vy += (tangent.y * 0.6 + sin * 0.4) * boostForward - boostLift;

      // Anti-flip stability assist during boost
      if (isGrounded) {
        const terrainAngle = Math.atan2(tangent.y, tangent.x);
        let angleDiff = this.angle - terrainAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        this.angularVel -= angleDiff * 12.0 * dt;
      }

      // Spin wheels fast during boost
      this.rearWheel.rotVel = Math.min(60, this.rearWheel.rotVel + 80 * dt);
      this.frontWheel.rotVel = Math.min(60, this.frontWheel.rotVel + 70 * dt);
    }

    // Angular damping & integration
    this.angularVel *= Math.pow(0.94, dt * 60);
    this.angle += this.angularVel * dt;

    // Integrate wheel rotation
    this.rearWheel.rot += this.rearWheel.rotVel * dt;
    this.frontWheel.rot += this.frontWheel.rotVel * dt;

    // Translation integration
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Chassis belly collision (prevents bottoming out through ground)
    const centerGround = terrain.getEffectiveHeight(this.x);
    const bellyMargin = Math.min(12, (this.rearWheelRadius || 22) * 0.45);
    if (this.y + bellyMargin > centerGround) {
      this.y = centerGround - bellyMargin;
      if (this.vy > 0) this.vy = 0;
      this.vx *= 0.985;
    }

    // Check Driver Head Collision
    this.checkDriverHead(terrain);
  }

  checkDriverHead(terrain) {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);

    const headWorldX = this.x + (this.headOffset.x * cos - this.headOffset.y * sin);
    const headWorldY = this.y + (this.headOffset.x * sin + this.headOffset.y * cos);

    const groundY = terrain.getEffectiveHeight(headWorldX);

    // In Hill Climb Racing: Driver ONLY injured if vehicle is overturned (cos < -0.35)
    // AND head impacts the ground firmly!
    if (cos < -0.35 && (headWorldY + this.headRadius >= groundY - 1)) {
      this.isDead = true;
      soundEngine.playCrash();
    }
  }

  checkStunts(dt) {
    const isAir = !this.rearWheel.grounded && !this.frontWheel.grounded;
    if (isAir) {
      if (!this.midAir) {
        this.midAir = true;
        this.airTime = 0;
        this.totalRotation = 0;
        this.lastAngle = this.angle;
      }
      this.airTime += dt;

      let deltaAngle = this.angle - this.lastAngle;
      while (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
      while (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

      this.totalRotation += deltaAngle;
      this.lastAngle = this.angle;

      // 360 degree flip check
      if (Math.abs(this.totalRotation) >= Math.PI * 1.88) {
        const isBackflip = this.totalRotation < 0;
        this.totalRotation = 0;
        if (window.gameInstance) {
          window.gameInstance.triggerStunt(isBackflip ? 'BACKFLIP!' : 'FRONTFLIP!', 1000);
        }
      }
    } else {
      if (this.midAir) {
        if (this.airTime >= 1.3) {
          const reward = Math.floor(this.airTime * 350);
          if (window.gameInstance) {
            window.gameInstance.triggerStunt('AIR TIME!', reward);
          }
        }
        this.midAir = false;
        this.airTime = 0;
        this.totalRotation = 0;
      }
    }
  }

  getSpeedKmh() {
    const speedPix = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    return Math.floor(speedPix * 0.16);
  }

  getRPM(isGas) {
    const kmh = this.getSpeedKmh();
    if (isGas) {
      return Math.min(85, 25 + Math.floor(kmh * 1.2) + Math.floor(Math.random() * 5));
    }
    return Math.max(12, Math.floor(kmh * 0.7));
  }
}
