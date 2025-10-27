export type RetroPalette = {
  id: string;
  name: string;
  background: string;
  foreground: string;
  dim: string;
  accent: string;
};

export const RETRO_PALETTES: RetroPalette[] = [
  {
    id: 'crt-green',
    name: 'CRT Green',
    background: '#0d1b0d',
    foreground: '#00ff41',
    dim: '#00802080',
    accent: '#00ff41',
  },
  {
    id: 'amber',
    name: 'Amber Terminal',
    background: '#1a0f00',
    foreground: '#ffb000',
    dim: '#80580080',
    accent: '#ffb000',
  },
  {
    id: 'commodore',
    name: 'Commodore 64',
    background: '#3e31a2',
    foreground: '#7c70da',
    dim: '#5a4fb380',
    accent: '#a59fef',
  },
  {
    id: 'arcade',
    name: 'Arcade Purple',
    background: '#1a001a',
    foreground: '#ff00ff',
    dim: '#80008080',
    accent: '#ff00ff',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    background: '#000000',
    foreground: '#ffffff',
    dim: '#808080',
    accent: '#cccccc',
  },
  {
    id: 'white-paper',
    name: 'White Paper',
    background: '#ffffff',
    foreground: '#000000',
    dim: '#808080',
    accent: '#333333',
  },
];
