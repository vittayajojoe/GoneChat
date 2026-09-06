const ADJECTIVES = [
  'Silent', 'Quiet', 'Blue', 'Green', 'Golden', 'Silver', 'Shadow',
  'Mystic', 'Swift', 'Calm', 'Brave', 'Hidden', 'Gentle', 'Cosmic',
  'Amber', 'Crimson', 'Lunar', 'Solar', 'Velvet', 'Frost'
];

const ANIMALS = [
  'Fox', 'Cat', 'Panda', 'Owl', 'Wolf', 'Falcon', 'Tiger',
  'Rabbit', 'Otter', 'Eagle', 'Hawk', 'Dolphin', 'Koala', 'Lynx',
  'Bear', 'Raven', 'Deer', 'Panther', 'Hedgehog', 'Seal'
];

export function generateRandomNickname() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
}
