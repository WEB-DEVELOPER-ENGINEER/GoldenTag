export interface UserDetail {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  profile?: {
    id: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    backgroundType: 'COLOR' | 'IMAGE';
    backgroundColor: string | null;
    backgroundImageUrl: string | null;
    isPublished: boolean;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    theme?: {
      id: string;
      mode: 'LIGHT' | 'DARK';
      primaryColor: string;
      secondaryColor: string;
      textColor: string;
      fontFamily: string;
      layout: 'CENTERED' | 'LEFT' | 'RIGHT';
      buttonStyle: 'ROUNDED' | 'SQUARE' | 'PILL';
    };
    popup?: {
      id: string;
      isEnabled: boolean;
      message: string;
      duration: number | null;
      backgroundColor: string;
      textColor: string;
    };
    links?: Array<{
      id: string;
      type: 'PLATFORM' | 'CUSTOM';
      platform: string | null;
      title: string;
      url: string;
      icon: string | null;
      order: number;
      isVisible: boolean;
    }>;
    contacts?: Array<{
      id: string;
      type: 'EMAIL' | 'PHONE';
      value: string;
      label: string | null;
      order: number;
    }>;
    files?: Array<{
      id: string;
      filename: string;
      originalName: string;
      title: string;
      fileUrl: string;
      fileSize: number;
      mimeType: string;
      order: number;
    }>;
  };
}

export interface AdminActionLog {
  adminId: string;
  action: string;
  targetUserId: string;
  timestamp: string;
}

export interface EditForm {
  email: string;
  username: string;
  role: 'user' | 'admin';
  isActive: boolean;
}

export interface ProfileForm {
  displayName: string;
  bio: string;
  avatarUrl: string;
  backgroundType: 'COLOR' | 'IMAGE';
  backgroundColor: string;
  backgroundImageUrl: string;
  isPublished: boolean;
}

export interface ThemeForm {
  mode: 'LIGHT' | 'DARK';
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  fontFamily: string;
  layout: 'CENTERED' | 'LEFT' | 'RIGHT';
  buttonStyle: 'ROUNDED' | 'SQUARE' | 'PILL';
}

export interface PopupForm {
  isEnabled: boolean;
  message: string;
  duration: number;
  backgroundColor: string;
  textColor: string;
}
