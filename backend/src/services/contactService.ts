import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (supports various formats)
const PHONE_REGEX = /^[\d\s\-\+\(\)\.]+$/;

// Validate email format
const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

// Validate phone format
const isValidPhone = (phone: string): boolean => {
  // Remove all non-digit characters for length check
  const digitsOnly = phone.replace(/\D/g, '');
  // Phone should have at least 7 digits and match the pattern
  return PHONE_REGEX.test(phone) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

export interface CreateContactInput {
  type: 'EMAIL' | 'PHONE';
  value: string;
  label?: string;
}

export interface UpdateContactInput {
  type?: 'EMAIL' | 'PHONE';
  value?: string;
  label?: string;
}

export const createContact = async (userId: string, input: CreateContactInput) => {
  // Validate required fields
  if (!input.type) {
    throw new AppError(400, 'MISSING_TYPE', 'Contact type is required');
  }

  if (input.type !== 'EMAIL' && input.type !== 'PHONE') {
    throw new AppError(400, 'INVALID_TYPE', 'Contact type must be EMAIL or PHONE');
  }

  if (!input.value || input.value.trim().length === 0) {
    throw new AppError(400, 'MISSING_VALUE', 'Contact value is required');
  }

  // Validate format based on type
  const trimmedValue = input.value.trim();

  if (input.type === 'EMAIL') {
    if (!isValidEmail(trimmedValue)) {
      throw new AppError(400, 'INVALID_EMAIL', 'Invalid email format');
    }
  } else if (input.type === 'PHONE') {
    if (!isValidPhone(trimmedValue)) {
      throw new AppError(400, 'INVALID_PHONE', 'Invalid phone number format');
    }
  }

  // Validate label if provided
  if (input.label && input.label.length > 50) {
    throw new AppError(400, 'INVALID_LABEL', 'Label cannot exceed 50 characters');
  }

  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      contacts: {
        orderBy: { order: 'desc' },
        take: 1
      }
    }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  // Calculate next order value
  const nextOrder = profile.contacts.length > 0 ? profile.contacts[0].order + 1 : 0;

  // Create contact
  const contact = await prisma.contact.create({
    data: {
      profileId: profile.id,
      type: input.type,
      value: trimmedValue,
      label: input.label?.trim() || null,
      order: nextOrder
    }
  });

  return contact;
};

export const updateContact = async (userId: string, contactId: string, input: UpdateContactInput) => {
  // Find the contact and verify ownership
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      profile: {
        include: {
          user: true
        }
      }
    }
  });

  if (!contact) {
    throw new AppError(404, 'CONTACT_NOT_FOUND', 'Contact not found');
  }

  if (contact.profile.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You do not have permission to update this contact');
  }

  // Validate type if provided
  if (input.type !== undefined && input.type !== 'EMAIL' && input.type !== 'PHONE') {
    throw new AppError(400, 'INVALID_TYPE', 'Contact type must be EMAIL or PHONE');
  }

  // Validate value if provided
  if (input.value !== undefined) {
    if (input.value.trim().length === 0) {
      throw new AppError(400, 'INVALID_VALUE', 'Contact value cannot be empty');
    }

    const trimmedValue = input.value.trim();
    const newType = input.type || contact.type;

    if (newType === 'EMAIL') {
      if (!isValidEmail(trimmedValue)) {
        throw new AppError(400, 'INVALID_EMAIL', 'Invalid email format');
      }
    } else if (newType === 'PHONE') {
      if (!isValidPhone(trimmedValue)) {
        throw new AppError(400, 'INVALID_PHONE', 'Invalid phone number format');
      }
    }
  }

  // Validate label if provided
  if (input.label !== undefined && input.label.length > 50) {
    throw new AppError(400, 'INVALID_LABEL', 'Label cannot exceed 50 characters');
  }

  // Update contact
  const updatedContact = await prisma.contact.update({
    where: { id: contactId },
    data: {
      ...(input.type !== undefined && { type: input.type }),
      ...(input.value !== undefined && { value: input.value.trim() }),
      ...(input.label !== undefined && { label: input.label.trim() || null }),
      updatedAt: new Date()
    }
  });

  return updatedContact;
};

export const deleteContact = async (userId: string, contactId: string) => {
  // Find the contact and verify ownership
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      profile: {
        include: {
          user: true
        }
      }
    }
  });

  if (!contact) {
    throw new AppError(404, 'CONTACT_NOT_FOUND', 'Contact not found');
  }

  if (contact.profile.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this contact');
  }

  // Delete contact
  await prisma.contact.delete({
    where: { id: contactId }
  });

  return { success: true, message: 'Contact deleted successfully' };
};

export const getUserContacts = async (userId: string) => {
  // Find user's profile
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      contacts: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', 'Profile not found');
  }

  return profile.contacts;
};
