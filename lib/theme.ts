export interface CategoryTheme {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  lightBg: string;
  border: string;
  text: string;
  badgeBg: string;
  badgeText: string;
}

export const defaultTheme: CategoryTheme = {
  background: '#FAF9F6',
  surface: '#FFFFFF',
  primary: '#1A2A4E',
  secondary: '#16A2D4',
  lightBg: '#F3F4F6',
  border: '#E5E7EB',
  text: '#1A2A4E',
  badgeBg: '#D93630',
  badgeText: '#FFFFFF',
};

export const ecoTheme: CategoryTheme = {
  background: '#F7F6EF',
  surface: '#FFFFFF',
  primary: '#527A5A',
  secondary: '#7FA486',
  lightBg: '#E6EFE5',
  border: '#DCE5D8',
  text: '#2C3E30',
  badgeBg: '#3D5C43',
  badgeText: '#FFFFFF',
};

export function getCategoryTheme(categorySlug: string): CategoryTheme {
  return categorySlug === 'eco' ? ecoTheme : defaultTheme;
}
