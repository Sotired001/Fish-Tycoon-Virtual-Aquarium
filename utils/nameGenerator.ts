export const FISH_NAMES = [
  "Bubbles", "Finnegan", "Gill", "Swimmy", "Nemo", "Dory", "Marlin", "Goldie",
  "Splash", "Flipper", "Coral", "Reef", "Wave", "Tide", "Marina", "Captain",
  "Skipper", "Pearl", "Sandy", "Shelly", "Blue", "Red", "Spot", "Stripey",
  "Flash", "Speedy", "Turbo", "Dart", "Bolt", "Zip", "Zoom", "Dash",
  "Angel", "Star", "Luna", "Sunny", "Sky", "Cloud", "Rain", "Storm",
  "Shadow", "Ghost", "Phantom", "Spirit", "Soul", "Aura", "Mystic", "Magic",
  "King", "Queen", "Prince", "Princess", "Duke", "Duchess", "Baron", "Baroness",
  "Ace", "Jack", "Joker", "Spade", "Heart", "Diamond", "Club", "Lucky"
];

export const generateFishName = (): string => {
  return FISH_NAMES[Math.floor(Math.random() * FISH_NAMES.length)];
};
