const FULL_TURN = Math.PI * 2;
const DRAG_SENSITIVITY = 0.006;
const KEYBOARD_STEP = Math.PI / 12;
const DRAG_THRESHOLD = 4;

function normalizeAngle(angle) {
  if (!Number.isFinite(angle)) return 0;
  if (angle >= -Math.PI && angle < Math.PI) return angle;
  return ((angle + Math.PI) % FULL_TURN + FULL_TURN) % FULL_TURN - Math.PI;
}

export function mountExhibitRotation(element, { onRotate, onInteractionChange }) {
  const document = element.ownerDocument;
  const window = document.defaultView;
  let exhibit = { id: null, label: 'exhibit', angle: 0, enabled: false };
  let pointer = null;
  let dragging = false;
  let disposed = false;

  const attribute = (name, value) => {
    const text = String(value);
    if (element.getAttribute(name) !== text) element.setAttribute(name, text);
  };
  const syncAccessibility = () => {
    const degrees = Math.round(exhibit.angle * 1800 / Math.PI) / 10;
    attribute('aria-label', `Rotate ${exhibit.label}`);
    attribute('aria-valuenow', degrees);
    attribute('aria-valuetext', `${degrees} degrees`);
    attribute('aria-disabled', !exhibit.enabled);
    attribute('tabindex', exhibit.enabled ? 0 : -1);
  };
  const setDragging = (next) => {
    if (dragging === next) return;
    dragging = next;
    attribute('data-dragging', dragging);
    onInteractionChange?.(dragging);
  };
  const cancelDrag = () => {
    const previous = pointer;
    pointer = null;
    if (previous) {
      try {
        if (element.hasPointerCapture(previous.id)) element.releasePointerCapture(previous.id);
      } catch {
        // Capture may already be released by the browser after a cancellation.
      }
    }
    setDragging(false);
  };
  const rotate = (angle) => {
    exhibit.angle = normalizeAngle(angle);
    syncAccessibility();
    onRotate(exhibit.id, exhibit.angle);
  };
  const pointerDown = (event) => {
    if (disposed || !exhibit.enabled || pointer || event.isPrimary === false || event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX };
    element.focus({ preventScroll: true });
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      // Window listeners still finish the gesture if capture is unavailable.
    }
  };
  const pointerMove = (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    if (event.pointerType !== 'touch' && (event.buttons & 1) === 0) {
      cancelDrag();
      return;
    }
    const delta = event.clientX - pointer.x;
    if (!dragging && Math.abs(delta) < DRAG_THRESHOLD) return;
    setDragging(true);
    if (!pointer || event.pointerId !== pointer.id) return;
    pointer.x = event.clientX;
    if (delta) rotate(exhibit.angle + delta * DRAG_SENSITIVITY);
  };
  const pointerEnd = (event) => {
    if (pointer && event.pointerId === pointer.id) cancelDrag();
  };
  const keyDown = (event) => {
    if (disposed || !exhibit.enabled || event.altKey || event.ctrlKey || event.metaKey) return;
    let angle;
    if (event.key === 'ArrowLeft') angle = exhibit.angle - KEYBOARD_STEP;
    else if (event.key === 'ArrowRight') angle = exhibit.angle + KEYBOARD_STEP;
    else if (event.key === 'Home') angle = 0;
    else return;
    event.preventDefault();
    cancelDrag();
    rotate(angle);
  };
  const visibilityChange = () => {
    if (document.hidden) cancelDrag();
  };
  const listeners = [
    [element, 'pointerdown', pointerDown],
    [element, 'lostpointercapture', pointerEnd],
    [element, 'keydown', keyDown],
    [element, 'blur', cancelDrag],
    [window, 'pointermove', pointerMove],
    [window, 'pointerup', pointerEnd],
    [window, 'pointercancel', pointerEnd],
    [window, 'blur', cancelDrag],
    [document, 'visibilitychange', visibilityChange],
  ];
  listeners.forEach(([target, type, listener]) => target.addEventListener(type, listener));
  attribute('data-dragging', false);
  syncAccessibility();

  return {
    setExhibit({ id, label, angle = 0, enabled = true }) {
      if (disposed) return;
      const nextEnabled = Boolean(enabled && id != null);
      if (id !== exhibit.id || !nextEnabled) cancelDrag();
      exhibit = { id, label: label || 'exhibit', angle: normalizeAngle(angle), enabled: nextEnabled };
      syncAccessibility();
    },
    reset() {
      if (disposed || !exhibit.enabled) return;
      cancelDrag();
      rotate(0);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelDrag();
      listeners.forEach(([target, type, listener]) => target.removeEventListener(type, listener));
    },
  };
}
