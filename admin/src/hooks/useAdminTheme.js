import { useEffect } from 'react';
import { siteSettingsAPI } from '../api/settings';

const LS_KEY = 'admin_theme_apply';

export function isAdminThemeEnabled() {
  return localStorage.getItem(LS_KEY) === 'true';
}

export function setAdminThemeEnabled(val) {
  localStorage.setItem(LS_KEY, String(val));
}

function applyVars(theme) {
  const root = document.documentElement;
  if (theme?.primaryColor) root.style.setProperty('--brand',        theme.primaryColor);
  if (theme?.primaryDark)  root.style.setProperty('--brand-dark',   theme.primaryDark);
  if (theme?.primaryLight) root.style.setProperty('--brand-light',  theme.primaryLight);
  if (theme?.accentColor)  root.style.setProperty('--brand-accent', theme.accentColor);
}

function removeVars() {
  const root = document.documentElement;
  root.style.removeProperty('--brand');
  root.style.removeProperty('--brand-dark');
  root.style.removeProperty('--brand-light');
  root.style.removeProperty('--brand-accent');
}

export default function useAdminTheme() {
  useEffect(() => {
    if (!isAdminThemeEnabled()) return;

    document.body.classList.add('admin-themed');

    siteSettingsAPI.get()
      .then(res => {
        const theme = (res.data?.data ?? res.data)?.theme;
        if (theme) applyVars(theme);
      })
      .catch(() => {});

    return () => {};
  }, []);
}

// Called by ThemeSwitcher and Theme page when admin saves/changes theme
export function applyAdminThemeNow(theme) {
  if (!isAdminThemeEnabled()) return;
  applyVars(theme);
}

export function toggleAdminTheme(enable, theme) {
  setAdminThemeEnabled(enable);
  if (enable) {
    document.body.classList.add('admin-themed');
    if (theme) applyVars(theme);
  } else {
    document.body.classList.remove('admin-themed');
    removeVars();
  }
}
