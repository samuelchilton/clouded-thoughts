import './style.css';
import { Cloud, createRandomCloud } from './cloud';
import { handleWallCollisions, handleBlockCollisions, BlockBounds } from './physics';

const THOUGHTS_API_URL = 'https://clouded-thoughts-backend-production.up.railway.app/thoughts';

interface Thought {
  thought: string;
}

class CloudedThoughts {
  private clouds: Cloud[] = [];
  private sky: HTMLElement;
  private viewport: HTMLElement;
  private canvasWidth: number;
  private canvasHeight: number;
  private blockElements: HTMLElement[] = [];

  // Panning state
  private panX: number = 0;
  private panY: number = 0;
  private isPanning: boolean = false;
  private panStartX: number = 0;
  private panStartY: number = 0;

  constructor() {
    const skyElement = document.getElementById('sky');
    const viewportElement = document.getElementById('viewport');
    if (!skyElement || !viewportElement) {
      throw new Error('Required elements not found');
    }
    this.sky = skyElement;
    this.viewport = viewportElement;

    // Canvas is 3x viewport size
    this.canvasWidth = window.innerWidth * 3;
    this.canvasHeight = window.innerHeight * 3;

    // Start centered (offset by one viewport)
    this.panX = -window.innerWidth;
    this.panY = -window.innerHeight;
    this.updatePan();

    this.init();
    this.setupPanning();
    this.setupRecenterButton();
    this.setupResizeHandler();
    this.startAnimationLoop();
  }

  private setupRecenterButton(): void {
    const btn = document.getElementById('recenter-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        this.panX = -window.innerWidth;
        this.panY = -window.innerHeight;
        this.updatePan();
      });
    }
  }

  private async init(): Promise<void> {
    // Collect all block elements
    this.blockElements = Array.from(document.querySelectorAll('.block')) as HTMLElement[];

    // Fetch thoughts from the API and create clouds
    try {
      const response = await fetch(THOUGHTS_API_URL);
      const thoughts: Thought[] = await response.json();

      for (const thought of thoughts) {
        const cloud = createRandomCloud(
          this.canvasWidth,
          this.canvasHeight,
          this.clouds,
          thought.thought
        );
        this.clouds.push(cloud);
        this.sky.appendChild(cloud.element);
      }
    } catch (error) {
      console.error('Failed to fetch thoughts:', error);
    }
  }

  private getBlockBounds(): BlockBounds[] {
    return this.blockElements.map(block => {
      const rect = block.getBoundingClientRect();
      // Convert from viewport coordinates to canvas coordinates
      return {
        left: rect.left - this.panX,
        right: rect.right - this.panX,
        top: rect.top - this.panY,
        bottom: rect.bottom - this.panY
      };
    });
  }

  private setupPanning(): void {
    this.viewport.addEventListener('mousedown', (e: MouseEvent) => {
      // Only pan if clicking on the viewport/sky, not on a cloud
      if ((e.target as HTMLElement).id === 'viewport' || (e.target as HTMLElement).id === 'sky') {
        this.isPanning = true;
        this.panStartX = e.clientX - this.panX;
        this.panStartY = e.clientY - this.panY;
        this.viewport.classList.add('panning');
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.isPanning) {
        this.panX = e.clientX - this.panStartX;
        this.panY = e.clientY - this.panStartY;

        // Clamp panning to canvas bounds
        const maxPanX = 0;
        const minPanX = -(this.canvasWidth - window.innerWidth);
        const maxPanY = 0;
        const minPanY = -(this.canvasHeight - window.innerHeight);

        this.panX = Math.max(minPanX, Math.min(maxPanX, this.panX));
        this.panY = Math.max(minPanY, Math.min(maxPanY, this.panY));

        this.updatePan();
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        this.viewport.classList.remove('panning');
      }
    });
  }

  private updatePan(): void {
    this.sky.style.transform = `translate(${this.panX}px, ${this.panY}px)`;
  }

  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      this.canvasWidth = window.innerWidth * 3;
      this.canvasHeight = window.innerHeight * 3;

      // Reclamp pan position
      const minPanX = -(this.canvasWidth - window.innerWidth);
      const minPanY = -(this.canvasHeight - window.innerHeight);
      this.panX = Math.max(minPanX, Math.min(0, this.panX));
      this.panY = Math.max(minPanY, Math.min(0, this.panY));
      this.updatePan();

      // Ensure clouds stay within bounds after resize
      for (const cloud of this.clouds) {
        if (cloud.x + cloud.width > this.canvasWidth) {
          cloud.x = this.canvasWidth - cloud.width;
        }
        if (cloud.y + cloud.height > this.canvasHeight) {
          cloud.y = this.canvasHeight - cloud.height;
        }
        cloud.updatePosition();
      }
    });
  }

  private startAnimationLoop(): void {
    const animate = (): void => {
      const blockBounds = this.getBlockBounds();

      for (const cloud of this.clouds) {
        // Skip physics for clouds being dragged
        if (cloud.isDragging) continue;

        // Update position
        cloud.update();

        // Handle wall collisions (use canvas size, not viewport)
        handleWallCollisions(cloud, this.canvasWidth, this.canvasHeight);

        // Handle block collisions
        handleBlockCollisions(cloud, blockBounds);

        // Update DOM position
        cloud.updatePosition();
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }
}

// Start the app
new CloudedThoughts();
