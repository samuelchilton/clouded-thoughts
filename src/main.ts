import './style.css';
import { Cloud, createRandomCloud } from './cloud';
import { handleWallCollisions, handleCloudCollisions } from './physics';

const NUM_CLOUDS = 3;

class CloudedThoughts {
  private clouds: Cloud[] = [];
  private sky: HTMLElement;
  private viewportWidth: number;
  private viewportHeight: number;

  constructor() {
    const skyElement = document.getElementById('sky');
    if (!skyElement) {
      throw new Error('Sky element not found');
    }
    this.sky = skyElement;
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;

    this.init();
    this.setupResizeHandler();
    this.startAnimationLoop();
  }

  private init(): void {
    // Create clouds
    for (let i = 0; i < NUM_CLOUDS; i++) {
      const cloud = createRandomCloud(
        this.viewportWidth,
        this.viewportHeight,
        this.clouds
      );
      this.clouds.push(cloud);
      this.sky.appendChild(cloud.element);
    }
  }

  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      this.viewportWidth = window.innerWidth;
      this.viewportHeight = window.innerHeight;

      // Ensure clouds stay within bounds after resize
      for (const cloud of this.clouds) {
        if (cloud.x + cloud.width > this.viewportWidth) {
          cloud.x = this.viewportWidth - cloud.width;
        }
        if (cloud.y + cloud.height > this.viewportHeight) {
          cloud.y = this.viewportHeight - cloud.height;
        }
        cloud.updatePosition();
      }
    });
  }

  private startAnimationLoop(): void {
    const animate = (): void => {
      // Update positions
      for (const cloud of this.clouds) {
        cloud.update();
      }

      // Handle collisions
      for (const cloud of this.clouds) {
        handleWallCollisions(cloud, this.viewportWidth, this.viewportHeight);
      }
      handleCloudCollisions(this.clouds);

      // Update DOM positions
      for (const cloud of this.clouds) {
        cloud.updatePosition();
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }
}

// Start the app
new CloudedThoughts();
