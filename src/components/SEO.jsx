import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "YITTE — Your IT TEam", 
  description = "Marketplace d'experts freelances spécialisés en Web3, IA Générative et No-Code. Trouvez les meilleurs talents pour vos projets Tech.",
  name = "YITTENET",
  type = "website"
}) => {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      
      {/* OpenGraph tags (Facebook, LinkedIn, etc.) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={name} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}

export default SEO;
