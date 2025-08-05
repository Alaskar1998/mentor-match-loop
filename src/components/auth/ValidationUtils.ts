/**
 * @file ValidationUtils.ts
 * @description Validation utilities for authentication forms
 */

import { useTranslation } from 'react-i18next';

export interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
  bio?: string;
  gender?: string;
  country?: string;
  age?: string;
  skillsToTeach?: string;
}

/**
 * @function validateEmail
 * @description Validates email format and requirements
 * @param {string} email - Email to validate
 * @param {any} t - Translation function
 * @returns {string | undefined} Error message or undefined if valid
 */
export const validateEmail = (email: string, t: any): string | undefined => {
  if (!email) return t('actions.email') + ' ' + t('actions.required');
  if (!email.includes('@'))
    return t('actions.email') + ' ' + t('actions.mustContainAt');
  if (
    !email.includes('.') ||
    email.split('@')[1]?.split('.')[0]?.length === 0
  ) {
    return t('actions.pleaseEnterValidEmail');
  }
  return undefined;
};

/**
 * @function validatePassword
 * @description Validates password strength and requirements
 * @param {string} password - Password to validate
 * @param {any} t - Translation function
 * @returns {string | undefined} Error message or undefined if valid
 */
export const validatePassword = (
  password: string,
  t: any
): string | undefined => {
  if (!password) return t('actions.password') + ' ' + t('actions.required');
  if (password.length < 6) return t('actions.passwordMustBeAtLeast6');
  return undefined;
};

/**
 * @function validateRequired
 * @description Validates required field is not empty
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @param {any} t - Translation function
 * @returns {string | undefined} Error message or undefined if valid
 */
export const validateRequired = (
  value: string,
  fieldName: string,
  t: any
): string | undefined => {
  if (!value || value.trim() === '')
    return `${fieldName} ` + t('actions.required');
  return undefined;
};

/**
 * @function validateAge
 * @description Validates age range selection
 * @param {string} age - Age to validate
 * @param {any} t - Translation function
 * @returns {string | undefined} Error message or undefined if valid
 */
export const validateAge = (age: string, t: any): string | undefined => {
  if (!age || age.trim() === '') return t('actions.ageRangeRequired');
  return undefined;
};

/**
 * @function validateSkillsToTeach
 * @description Validates that user has selected skills to teach
 * @param {any[]} skills - Skills array to validate
 * @param {any} t - Translation function
 * @returns {string | undefined} Error message or undefined if valid
 */
export const validateSkillsToTeach = (
  skills: any[],
  t: any
): string | undefined => {
  if (!skills || skills.length === 0) return t('actions.skillsToTeachRequired');
  return undefined;
};
