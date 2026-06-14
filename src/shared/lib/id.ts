// Generate a short, unique-enough id for client-side list keys / messages.
export function newId(): string {
  return Math.random().toString(36).slice(2);
}
