export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffled(list) {
  return [...list].sort(() => Math.random() - 0.5);
}
