import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import login_EN from './en/login.json';
import resetPassword_EN from './en/resetPassword.json';
import labels_EN from './en/labels.json';
import messages_EN from './en/messages.json';
import changePassword_EN from './en/changePassword.json';
import login_FR from './fr/login.json';
import resetPassword_FR from './fr/resetPassword.json';
import labels_FR from './fr/labels.json';
import messages_FR from './fr/messages.json';
import changePassword_FR from './fr/changePassword.json';

export const resources = {
  en: {
    login: login_EN,
    resetPassword: resetPassword_EN,
    labels: labels_EN,
    messages: messages_EN,
    changePassword: changePassword_EN,
  },
  fr: {
    login: login_FR,
    resetPassword: resetPassword_FR,
    labels: labels_FR,
    messages: messages_FR,
    changePassword: changePassword_FR,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'en',
    ns: ['login', 'resetPassword', 'labels', 'messages', 'changePassword'],
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources,
    supportedLngs: ['en', 'fr'],
    nonExplicitSupportedLngs: true,
  });

export default i18n;
