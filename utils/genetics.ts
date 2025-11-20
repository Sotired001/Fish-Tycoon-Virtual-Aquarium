import { FishGenes } from '../types';

// Helper to mix two colors
const mixColors = (color1: string, color2: string): string => {
    // Simple hex mixing
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);

    const r1 = (c1 >> 16) & 255;
    const g1 = (c1 >> 8) & 255;
    const b1 = c1 & 255;

    const r2 = (c2 >> 16) & 255;
    const g2 = (c2 >> 8) & 255;
    const b2 = c2 & 255;

    const r = Math.round((r1 + r2) / 2);
    const g = Math.round((g1 + g2) / 2);
    const b = Math.round((b1 + b2) / 2);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// Helper to mutate a color slightly
const mutateColor = (color: string): string => {
    const c = parseInt(color.slice(1), 16);
    let r = (c >> 16) & 255;
    let g = (c >> 8) & 255;
    let b = c & 255;

    // Random shift -20 to +20
    r = Math.min(255, Math.max(0, r + (Math.random() * 40 - 20)));
    g = Math.min(255, Math.max(0, g + (Math.random() * 40 - 20)));
    b = Math.min(255, Math.max(0, b + (Math.random() * 40 - 20)));

    return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
};

export const generateOffspringGenes = (parent1: FishGenes, parent2: FishGenes): FishGenes => {
    const mutationRate = 0.1; // 10% chance of mutation per trait

    // 1. Body Color: Mix or Inherit
    let bodyColor = Math.random() < 0.5 ? parent1.bodyColor : parent2.bodyColor;
    if (Math.random() < 0.2) bodyColor = mixColors(parent1.bodyColor, parent2.bodyColor); // 20% chance to mix
    if (Math.random() < mutationRate) bodyColor = mutateColor(bodyColor);

    // 2. Fin Color: Mix or Inherit
    let finColor = Math.random() < 0.5 ? parent1.finColor : parent2.finColor;
    if (Math.random() < 0.2) finColor = mixColors(parent1.finColor, parent2.finColor);
    if (Math.random() < mutationRate) finColor = mutateColor(finColor);

    // 3. Pattern: Inherit
    let pattern = Math.random() < 0.5 ? parent1.pattern : parent2.pattern;
    // Small chance for random pattern mutation
    if (Math.random() < mutationRate) {
        const patterns = ['SOLID', 'STRIPED', 'SPOTTED'] as const;
        pattern = patterns[Math.floor(Math.random() * patterns.length)];
    }

    // 4. Pattern Color
    let patternColor = Math.random() < 0.5 ? parent1.patternColor : parent2.patternColor;
    if (Math.random() < mutationRate) patternColor = mutateColor(patternColor);

    // 5. Scale: Average + Variance
    let scale = (parent1.scale + parent2.scale) / 2;
    scale += (Math.random() * 0.2 - 0.1); // +/- 0.1 variance
    scale = Math.max(0.5, Math.min(2.0, scale));

    // 6. Fin Shape: Inherit
    let finShape = Math.random() < 0.5 ? parent1.finShape : parent2.finShape;
    if (Math.random() < mutationRate) {
        const shapes = ['TRIANGLE', 'ROUND', 'FORKED'] as const;
        finShape = shapes[Math.floor(Math.random() * shapes.length)];
    }

    return {
        bodyColor,
        finColor,
        pattern,
        patternColor,
        scale,
        finShape
    };
};

export const generateRandomGenes = (speciesId: string): FishGenes => {
    // Default genes based on species
    let base: FishGenes = {
        bodyColor: '#F59E0B',
        finColor: '#FCD34D',
        pattern: 'SOLID',
        patternColor: '#000000',
        scale: 1.0,
        finShape: 'TRIANGLE'
    };

    if (speciesId === 'guppy') {
        base.bodyColor = '#3B82F6';
        base.finColor = '#93C5FD';
        base.finShape = 'ROUND';
        base.scale = 0.8;
    } else if (speciesId === 'tropical') {
        base.bodyColor = '#EC4899';
        base.finColor = '#FBCFE8';
        base.pattern = 'STRIPED';
        base.patternColor = '#FFFFFF';
    } else if (speciesId === 'puffer') {
        base.bodyColor = '#10B981';
        base.finColor = '#6EE7B7';
        base.scale = 1.5; // Increased from 1.2
        base.finShape = 'ROUND';
    } else if (speciesId === 'squid') {
        base.bodyColor = '#8B5CF6';
        base.finColor = '#C4B5FD';
        base.scale = 1.8; // Increased from 1.1
    } else if (speciesId === 'shark') {
        base.bodyColor = '#64748B';
        base.finColor = '#94A3B8';
        base.scale = 2.5; // Increased from 1.5
        base.finShape = 'FORKED';
    } else if (speciesId === 'whale') {
        base.bodyColor = '#334155';
        base.finColor = '#475569';
        base.scale = 4.0; // Increased from 2.0
    }

    // Add slight variance to initial shop fish
    return {
        ...base,
        scale: base.scale * (0.9 + Math.random() * 0.2),
        bodyColor: mutateColor(base.bodyColor)
    };
};
