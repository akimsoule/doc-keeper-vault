import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  canonical?: string;
}

const SEONative: React.FC<SEOProps> = ({
  title = 'Doc Keeper Vault - Gestion Documentaire Sécurisée',
  description = 'Solution moderne de gestion documentaire avec stockage sécurisé dans le cloud. Upload, organisation, recherche et partage de documents en toute sécurité.',
  keywords = 'gestion documentaire, stockage cloud, sécurisé, documents, PDF, images, chiffrement',
  image = 'https://doc-keeper-vault.netlify.app/og-image.jpg',
  url = 'https://doc-keeper-vault.netlify.app/',
  type = 'website',
  noindex = false,
  canonical
}) => {
  useEffect(() => {
    const siteTitle = 'Doc Keeper Vault';
    const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;

    // Update title
    document.title = fullTitle;

    // Helper function to update meta tags
    const updateMetaTag = (name: string, content: string, useProperty = false) => {
      const selector = useProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (useProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    }

    // Open Graph tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:site_name', siteTitle, true);

    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:url', url, true);
    updateMetaTag('twitter:title', fullTitle, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);

    // Canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }

    // JSON-LD structured data
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: fullTitle,
      description: description,
      url: url,
      isPartOf: {
        '@type': 'WebSite',
        name: siteTitle,
        url: 'https://doc-keeper-vault.netlify.app/'
      }
    };

    let jsonLdScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(jsonLd);

  }, [title, description, keywords, image, url, type, noindex, canonical]);

  return null; // This component doesn't render anything
};

export default SEONative;
