import { Cloud } from './cloud';

export interface BlockBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function handleWallCollisions(
  cloud: Cloud,
  viewportWidth: number,
  viewportHeight: number
): void {
  const bounds = cloud.getBounds();

  // Left wall
  if (bounds.left <= 0) {
    cloud.x = 0;
    cloud.vx = Math.abs(cloud.vx);
  }

  // Right wall
  if (bounds.right >= viewportWidth) {
    cloud.x = viewportWidth - cloud.width;
    cloud.vx = -Math.abs(cloud.vx);
  }

  // Top wall
  if (bounds.top <= 0) {
    cloud.y = 0;
    cloud.vy = Math.abs(cloud.vy);
  }

  // Bottom wall
  if (bounds.bottom >= viewportHeight) {
    cloud.y = viewportHeight - cloud.height;
    cloud.vy = -Math.abs(cloud.vy);
  }
}

function checkAABBCollision(a: Cloud, b: Cloud): boolean {
  const boundsA = a.getBounds();
  const boundsB = b.getBounds();

  return (
    boundsA.left < boundsB.right &&
    boundsA.right > boundsB.left &&
    boundsA.top < boundsB.bottom &&
    boundsA.bottom > boundsB.top
  );
}

export function handleCloudCollisions(clouds: Cloud[]): void {
  for (let i = 0; i < clouds.length; i++) {
    for (let j = i + 1; j < clouds.length; j++) {
      const cloudA = clouds[i];
      const cloudB = clouds[j];

      if (checkAABBCollision(cloudA, cloudB)) {
        // Calculate centers
        const centerAX = cloudA.x + cloudA.width / 2;
        const centerAY = cloudA.y + cloudA.height / 2;
        const centerBX = cloudB.x + cloudB.width / 2;
        const centerBY = cloudB.y + cloudB.height / 2;

        // Calculate overlap direction
        const dx = centerBX - centerAX;
        const dy = centerBY - centerAY;

        // Calculate overlap amounts
        const overlapX = (cloudA.width + cloudB.width) / 2 - Math.abs(dx);
        const overlapY = (cloudA.height + cloudB.height) / 2 - Math.abs(dy);

        // Separate clouds based on smallest overlap
        if (overlapX < overlapY) {
          // Horizontal collision
          const separationX = overlapX / 2 + 1;
          if (dx > 0) {
            cloudA.x -= separationX;
            cloudB.x += separationX;
          } else {
            cloudA.x += separationX;
            cloudB.x -= separationX;
          }
          // Swap horizontal velocities (elastic collision)
          const tempVx = cloudA.vx;
          cloudA.vx = cloudB.vx;
          cloudB.vx = tempVx;
        } else {
          // Vertical collision
          const separationY = overlapY / 2 + 1;
          if (dy > 0) {
            cloudA.y -= separationY;
            cloudB.y += separationY;
          } else {
            cloudA.y += separationY;
            cloudB.y -= separationY;
          }
          // Swap vertical velocities (elastic collision)
          const tempVy = cloudA.vy;
          cloudA.vy = cloudB.vy;
          cloudB.vy = tempVy;
        }
      }
    }
  }
}

export function handleBlockCollisions(cloud: Cloud, blocks: BlockBounds[]): void {
  const cloudBounds = cloud.getBounds();

  for (const block of blocks) {
    // Check if cloud overlaps with block
    const overlapsX = cloudBounds.left < block.right && cloudBounds.right > block.left;
    const overlapsY = cloudBounds.top < block.bottom && cloudBounds.bottom > block.top;

    if (overlapsX && overlapsY) {
      // Calculate overlap amounts from each side
      const overlapLeft = cloudBounds.right - block.left;
      const overlapRight = block.right - cloudBounds.left;
      const overlapTop = cloudBounds.bottom - block.top;
      const overlapBottom = block.bottom - cloudBounds.top;

      // Find minimum overlap to determine collision side
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapLeft) {
        // Cloud hit left side of block
        cloud.x = block.left - cloud.width;
        cloud.vx = -Math.abs(cloud.vx);
      } else if (minOverlap === overlapRight) {
        // Cloud hit right side of block
        cloud.x = block.right;
        cloud.vx = Math.abs(cloud.vx);
      } else if (minOverlap === overlapTop) {
        // Cloud hit top side of block
        cloud.y = block.top - cloud.height;
        cloud.vy = -Math.abs(cloud.vy);
      } else {
        // Cloud hit bottom side of block
        cloud.y = block.bottom;
        cloud.vy = Math.abs(cloud.vy);
      }
    }
  }
}
