import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
  structuredData?: any;
}

export const SEO = ({
  title = "GameHub - Free Online Games",
  description = "Play thousands of free online games instantly in your browser. No downloads required. Action, puzzle, racing, adventure games and more!",
  keywords = "free games, online games, browser games, HTML5 games, play games online, gaming",
  image = "/og-image.jpg",
  url = "https://gamehub.com",
  type = "website",
  noIndex = false,
  canonicalUrl,
  structuredData
}: SEOProps) => {
  const siteTitle = "GameHub";
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;
  const fullUrl = url.startsWith('http') ? url : `https://gamehub.com${url}`;
  const fullImageUrl = image.startsWith('http') ? image : `https://gamehub.com${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl || fullUrl} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Additional Meta Tags for Gaming */}
      <meta name="author" content="GameHub Team" />
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Predefined SEO configurations for different page types
export const GameSEO = ({ game }: { game: any }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Game",
    "name": game.title,
    "description": game.description,
    "image": game.thumbnail,
    "applicationCategory": "Game",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": game.rating ? {
      "@type": "AggregateRating",
      "ratingValue": game.rating,
      "ratingCount": game.reviews || 100,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "genre": game.category,
    "datePublished": game.releaseDate,
    "publisher": {
      "@type": "Organization",
      "name": "GameHub"
    }
  };

  return (
    <SEO
      title={`${game.title} - Play Free Online`}
      description={`Play ${game.title} for free! ${game.description} No downloads required, play instantly in your browser.`}
      keywords={`${game.title}, ${game.category.toLowerCase()} games, ${game.tags?.join(', ')}, free online games`}
      image={game.thumbnail}
      type="article"
      structuredData={structuredData}
    />
  );
};

export const CategorySEO = ({ category, gameCount }: { category: any; gameCount: number }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} Games`,
    "description": category.description,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": gameCount,
      "itemListElement": []
    }
  };

  return (
    <SEO
      title={`${category.name} Games - Free Online ${category.name} Games`}
      description={`Play the best free ${category.name.toLowerCase()} games online! ${category.description} ${gameCount} games available to play instantly.`}
      keywords={`${category.name.toLowerCase()} games, free ${category.name.toLowerCase()} games online, browser ${category.name.toLowerCase()} games`}
      structuredData={structuredData}
    />
  );
};

export const SearchSEO = ({ query, resultCount }: { query: string; resultCount: number }) => {
  return (
    <SEO
      title={`"${query}" Search Results - GameHub`}
      description={`Found ${resultCount} games matching "${query}". Play free online games instantly in your browser.`}
      keywords={`${query}, search games, free online games`}
      noIndex={true} // Don't index search results pages
    />
  );
};

export const HomeSEO = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GameHub",
    "description": "Play thousands of free online games instantly in your browser",
    "url": "https://gamehub.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://gamehub.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "GameHub",
      "logo": {
        "@type": "ImageObject",
        "url": "https://gamehub.com/logo.png"
      }
    }
  };

  return (
    <SEO
      title="GameHub - Free Online Games | Play Instantly in Browser"
      description="Play thousands of free online games instantly! Action, puzzle, racing, adventure games and more. No downloads required - start playing now!"
      keywords="free online games, browser games, HTML5 games, play games online, gaming, no download games"
      structuredData={structuredData}
    />
  );
};