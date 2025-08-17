import React from 'react';
import { Helmet } from 'react-helmet-async';

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

const SEO: React.FC<SEOProps> = ({
  title = 'Doc Keeper Vault - Gestion Documentaire Sécurisée',
  description = 'Solution moderne de gestion documentaire avec stockage sécurisé dans le cloud. Upload, organisation, recherche et partage de documents en toute sécurité.',
  keywords = 'gestion documentaire, stockage cloud, sécurisé, documents, PDF, images, chiffrement',
  image = 'https://doc-keeper-vault.netlify.app/og-image.jpg',
  url = 'https://doc-keeper-vault.netlify.app/',
  type = 'website',
  noindex = false,
  canonical
}) => {
  const siteTitle = 'Doc Keeper Vault';
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* JSON-LD pour les pages spécifiques */}
      <script type="application/ld+json">
        {JSON.stringify({
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
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
