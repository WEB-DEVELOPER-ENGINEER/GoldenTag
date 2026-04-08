// Email and password validation utilities

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export const isValidUsername = (username: string): boolean => {
  // Username must be 3-30 characters, alphanumeric with hyphens and underscores
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};

export const isValidHexColor = (color: string): boolean => {
  // Validate hex color format (#RGB or #RRGGBB)
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
};

export const isValidBackgroundColor = (color: string): boolean => {
  // Accept hex colors
  if (isValidHexColor(color)) {
    return true;
  }
  
  // Accept CSS gradients (linear-gradient, radial-gradient, etc.)
  if (color.includes('gradient')) {
    return true;
  }
  
  // Accept CSS url() patterns (for SVG backgrounds)
  if (color.includes('url(')) {
    return true;
  }
  
  // Accept CSS color names and other valid CSS color formats
  return false;
};

export const isValidFontFamily = (font: string): boolean => {
  // List of allowed font families
  const allowedFonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Raleway',
    'Ubuntu',
    'Playfair Display',
    'Merriweather'
  ];
  return allowedFonts.includes(font);
};

export const isValidLayout = (layout: string): boolean => {
  const allowedLayouts = ['CENTERED', 'LEFT', 'RIGHT'];
  return allowedLayouts.includes(layout);
};

export const isValidButtonStyle = (style: string): boolean => {
  const allowedStyles = ['ROUNDED', 'SQUARE', 'PILL'];
  return allowedStyles.includes(style);
};

export const isValidThemeMode = (mode: string): boolean => {
  const allowedModes = ['LIGHT', 'DARK'];
  return allowedModes.includes(mode);
};


export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic phone number validation (international format)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};
