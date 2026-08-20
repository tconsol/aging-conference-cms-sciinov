import { useEffect, useState } from 'react';
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

function applyFavicon(url) {
  if (!url) return;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = `${url}?v=${Date.now()}`;
}

export default function useAdminTheme() {
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    siteSettingsAPI.get()
      .then(res => {
        const settings = res.data?.data ?? res.data;
        // Always apply favicon regardless of theme toggle
        if (settings?.favicon) applyFavicon(settings.favicon);
        if (settings?.logo) setLogo(settings.logo);
        // Apply theme colors only if opted in
        if (isAdminThemeEnabled() && settings?.theme) {
          document.body.classList.add('admin-themed');
          applyVars(settings.theme);
        }
      })
      .catch(() => {});
  }, []);

  return { logo };
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
