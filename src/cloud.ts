export class Cloud {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  element: HTMLElement;

  constructor(x: number, y: number, vx: number, vy: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = 600;
    this.height = 480; // Account for puffs extending above

    this.element = document.createElement('div');
    this.element.className = 'cloud';
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;

    // Main cloud body
    const body = document.createElement('div');
    body.className = 'cloud-body';
    body.style.top = '180px'; // Offset to account for puffs above
    this.element.appendChild(body);

    // Add puffs
    for (let i = 1; i <= 5; i++) {
      const puff = document.createElement('div');
      puff.className = `cloud-puff cloud-puff-${i}`;
      this.element.appendChild(puff);
    }

    // Text
    const text = document.createElement('span');
    text.className = 'cloud-text';
    text.textContent = 'I am a cloud';
    this.element.appendChild(text);

    this.updatePosition();
  }

  updatePosition(): void {
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  update(): void {
    this.x += this.vx;
    this.y += this.vy;
    this.updatePosition();
  }

  getBounds(): { left: number; right: number; top: number; bottom: number } {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }
}

export function createRandomCloud(
  viewportWidth: number,
  viewportHeight: number,
  existingClouds: Cloud[]
): Cloud {
  const cloudWidth = 600;
  const cloudHeight = 480;
  const maxSpeed = 0.4;
  const minSpeed = 0.15;

  let x: number, y: number;
  let attempts = 0;
  const maxAttempts = 100;

  // Find non-overlapping position
  do {
    x = Math.random() * (viewportWidth - cloudWidth);
    y = Math.random() * (viewportHeight - cloudHeight);
    attempts++;
  } while (
    attempts < maxAttempts &&
    existingClouds.some(cloud => {
      const dx = Math.abs(cloud.x - x);
      const dy = Math.abs(cloud.y - y);
      return dx < cloudWidth + 50 && dy < cloudHeight + 50;
    })
  );

  // Random velocity with minimum speed
  const angle = Math.random() * Math.PI * 2;
  const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  return new Cloud(x, y, vx, vy);
}
