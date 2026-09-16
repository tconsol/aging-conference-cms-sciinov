import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { usecongress } from '../context/congressContext';

const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');

/**
 * Per-page title, description, keywords, canonical and social cards.
 *
 * Defaults come from Site Settings so an admin controls the baseline without a
 * deploy; a page passes overrides for its own content (an article title, a
 * speaker's name). Anything not supplied falls back to the site-wide value.
 *
 * Note on crawlers: tags are applied client-side. Google renders JavaScript and
 * will see them; several social-preview scrapers do not. Link previews therefore
 * rely on the static tags in index.html unless the site is prerendered.
 */
export default function Seo({
  title,
  description,
  keywords,
  image,
  type = 'website',
  noindex = false,
  publishedTime,
}) {
  const { siteSettings } = usecongress();
  const { pathname } = useLocation();

  const seo = siteSettings?.seo || {};
  const siteName = (siteSettings?.siteName || '').trim() || 'Aging Congress';

  const metaTitle = title
    ? `${title} · ${seo.title || siteName}`
    : (seo.title || siteName);

  const metaDescription =
    description || seo.description ||
    'A premier international congress on aging, geroscience, and longevity research.';

  const metaKeywords = keywords || seo.keywords || '';
  const metaImage = image || siteSettings?.logo || '';
  const canonical = SITE_URL ? `${SITE_URL}${pathname}` : '';

  return (
    <Helmet prioritizeSeoTags>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}

      {/* Hidden pages and thin content must not be indexed, or they compete
          with the real pages in search results. */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      {canonical && <meta property="og:url" content={canonical} />}
      {metaImage && <meta property="og:image" content={metaImage} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      <meta name="twitter:card" content={metaImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {metaImage && <meta name="twitter:image" content={metaImage} />}
    </Helmet>
  );
}
