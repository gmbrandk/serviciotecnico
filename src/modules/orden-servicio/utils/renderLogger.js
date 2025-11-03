// utils/renderLogger.js
let queue = new Map();
let scheduled = false;

export function logRender(componentName) {
  const prev = queue.get(componentName) || 0;
  queue.set(componentName, prev + 1);

  if (!scheduled) {
    scheduled = true;

    // ✅ esperamos al final del frame
    Promise.resolve().then(() => {
      printTree();
      queue.clear();
      scheduled = false;
    });
  }
}

function printTree() {
  if (queue.size === 0) return;

  console.group('🌳 Render Tree (este evento)');
  queue.forEach((count, name) => {
    console.log(`🔄 ${name} (${count}x)`);
  });
  console.groupEnd();
}
