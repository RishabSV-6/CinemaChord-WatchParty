/**
 * TOP BAR COLOR CONFIGURATION
 * 
 * The top bar color and styling can be modified directly here,
 * or dynamically manipulated via later prompts or the in-app Appearance panel.
 */

export interface TopBarTheme {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

export const TOPBAR_THEME_PRESETS: TopBarTheme[] = [
  {
    id: 'notebook-obsidian',
    name: 'Notebook Obsidian (Default)',
    backgroundColor: '#090a0d',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    textColor: '#f7f5f0',
  },
  {
    id: 'campus-slate',
    name: 'Campus Study Slate',
    backgroundColor: '#0d1520',
    borderColor: 'rgba(30, 41, 59, 0.8)',
    textColor: '#f1f5f9',
  },
  {
    id: 'midnight-teal',
    name: 'Midnight Turquoise',
    backgroundColor: '#042220',
    borderColor: 'rgba(20, 184, 166, 0.28)',
    textColor: '#f0fdfa',
  },
  {
    id: 'noir-pitch',
    name: 'Pitch Black',
    backgroundColor: '#000000',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    textColor: '#ffffff',
  },
  {
    id: 'field-graphite',
    name: 'Field Notes Graphite',
    backgroundColor: '#18181b',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textColor: '#fafafa',
  },
];

export const DEFAULT_TOPBAR_THEME = TOPBAR_THEME_PRESETS[0];
