import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

interface Contact {
  id: string;
  type: 'EMAIL' | 'PHONE';
  value: string;
  label: string | null;
  order: number;
}

interface ContactManagerProps {
  onContactsChange?: (contacts: Contact[]) => void;
}

export const ContactManager: React.FC<ContactManagerProps> = ({ onContactsChange }) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [contactType, setContactType] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [contactValue, setContactValue] = useState('');
  const [contactLabel, setContactLabel] = useState('');

  // Edit state
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data);
      
      if (onContactsChange) {
        onContactsChange(data);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate input
    if (!contactValue.trim()) {
      setError(t('contacts.value_required'));
      return;
    }

    if (contactType === 'EMAIL' && !validateEmail(contactValue)) {
      setError(t('contacts.email_invalid'));
      return;
    }

    if (contactType === 'PHONE' && !validatePhone(contactValue)) {
      setError(t('contacts.phone_invalid'));
      return;
    }

    setIsLoading(true);

    try {
      if (editingContact) {
        // Update existing contact
        const response = await fetch(`${apiUrl}/api/contacts/${editingContact.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: contactType,
            value: contactValue.trim(),
            label: contactLabel.trim() || null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to update contact');
        }

        setSuccessMessage(t('contacts.contact_updated'));
        setEditingContact(null);
      } else {
        // Create new contact
        const response = await fetch(`${apiUrl}/api/contacts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: contactType,
            value: contactValue.trim(),
            label: contactLabel.trim() || null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || t('contacts.add_failed'));
        }

        setSuccessMessage(t('contacts.contact_added'));
      }

      // Reset form
      setContactValue('');
      setContactLabel('');
      setContactType('EMAIL');

      // Refresh contacts list
      await fetchContacts();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('contacts.add_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setContactType(contact.type);
    setContactValue(contact.value);
    setContactLabel(contact.label || '');
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
    setContactValue('');
    setContactLabel('');
    setContactType('EMAIL');
    setError(null);
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm(t('contacts.delete_confirm'))) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${apiUrl}/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || t('contacts.delete_failed'));
      }

      setSuccessMessage(t('contacts.contact_deleted'));
      await fetchContacts();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('contacts.delete_failed'));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">{t('contacts.title')}</h2>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('contacts.contact_type')}
          </label>
          <div className="flex space-x-4 rtl:space-x-reverse">
            <label className="flex items-center">
              <input
                type="radio"
                value="EMAIL"
                checked={contactType === 'EMAIL'}
                onChange={(e) => setContactType(e.target.value as 'EMAIL' | 'PHONE')}
                className="me-2"
              />
              <span className="text-sm text-gray-700">{t('contacts.email')}</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="PHONE"
                checked={contactType === 'PHONE'}
                onChange={(e) => setContactType(e.target.value as 'EMAIL' | 'PHONE')}
                className="me-2"
              />
              <span className="text-sm text-gray-700">{t('contacts.phone')}</span>
            </label>
          </div>
        </div>

        {/* Contact Value */}
        <div>
          <label htmlFor="contactValue" className="block text-sm font-medium text-gray-700 mb-1">
            {contactType === 'EMAIL' ? t('contacts.email_address') : t('contacts.phone_number')}
          </label>
          <input
            type={contactType === 'EMAIL' ? 'email' : 'tel'}
            id="contactValue"
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={contactType === 'EMAIL' ? t('contacts.email_placeholder') : t('contacts.phone_placeholder')}
            required
          />
        </div>

        {/* Label */}
        <div>
          <label htmlFor="contactLabel" className="block text-sm font-medium text-gray-700 mb-1">
            {t('contacts.label')}
          </label>
          <select
            id="contactLabel"
            value={contactLabel}
            onChange={(e) => setContactLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('contacts.label_none')}</option>
            <option value="Work">{t('contacts.label_work')}</option>
            <option value="Personal">{t('contacts.label_personal')}</option>
            <option value="Home">{t('contacts.label_home')}</option>
            <option value="Mobile">{t('contacts.label_mobile')}</option>
            <option value="Other">{t('contacts.label_other')}</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex space-x-2 rtl:space-x-reverse">
          <button
            type="submit"
            disabled={isLoading || !contactValue.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? t('common.saving') : editingContact ? t('contacts.update_contact') : t('contacts.add_contact')}
          </button>
          {editingContact && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Contact List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">{t('contacts.your_contacts')}</h3>
        
        {contacts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">{t('contacts.no_contacts')}</p>
            <p className="text-gray-400 text-xs mt-1">{t('contacts.add_first')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {contact.type}
                    </span>
                    {contact.label && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700">
                        {contact.label}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{contact.value}</p>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
