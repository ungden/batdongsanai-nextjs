import { Project } from '@/types/project';

interface SchemaMarkupProps {
  type: 'organization' | 'website' | 'realEstate' | 'localBusiness';
  data?: any;
  project?: Project;
}

export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Realprofit.vn",
  "description": "Nền tảng kiểm tra pháp lý và đầu tư bất động sản hàng đầu Việt Nam",
  "url": "https://realprofit.vn",
  "logo": "https://lovable.dev/opengraph-image-p98pqg.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+84-1900-XXX-XXX",
    "contactType": "customer service",
    "availableLanguage": "Vietnamese"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "VN",
    "addressLocality": "Ho Chi Minh City"
  },
  "sameAs": [
    "https://facebook.com/realprofitvn",
    "https://linkedin.com/company/realprofitvn"
  ]
});

export const generateWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Realprofit.vn",
  "url": "https://realprofit.vn",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://realprofit.vn/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
});

export const generateRealEstateSchema = (project: Project) => ({
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "name": project.name,
  "description": `Dự án ${project.name} tại ${project.location} do ${project.developer} phát triển`,
  "url": `https://realprofit.vn/projects/${project.id}`,
  "image": project.image,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": project.city,
    "addressRegion": project.district,
    "addressCountry": "VN"
  },
  "offers": {
    "@type": "Offer",
    "price": project.pricePerSqm,
    "priceCurrency": "VND",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": project.pricePerSqm,
      "priceCurrency": "VND",
      "unitText": "per square meter"
    }
  },
  "provider": {
    "@type": "Organization",
    "name": project.developer
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": project.legalScore,
    "bestRating": 10,
    "ratingCount": 1
  }
});

export const generateLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Realprofit.vn",
  "description": "Dịch vụ tư vấn và kiểm tra pháp lý bất động sản",
  "image": "https://lovable.dev/opengraph-image-p98pqg.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Đường ABC",
    "addressLocality": "Ho Chi Minh City",
    "postalCode": "700000",
    "addressCountry": "VN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 10.8231,
    "longitude": 106.6297
  },
  "telephone": "+84-1900-XXX-XXX",
  "openingHours": "Mo-Fr 08:00-18:00",
  "priceRange": "$$",
  "servedCuisine": [],
  "paymentAccepted": "Cash, Credit Card",
  "currenciesAccepted": "VND"
});

export const generateFAQSchema = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

const SchemaMarkup = ({ type, data, project }: SchemaMarkupProps) => {
  let schema;
  
  switch (type) {
    case 'organization':
      schema = generateOrganizationSchema();
      break;
    case 'website':
      schema = generateWebsiteSchema();
      break;
    case 'realEstate':
      schema = project ? generateRealEstateSchema(project) : null;
      break;
    case 'localBusiness':
      schema = generateLocalBusinessSchema();
      break;
    default:
      schema = null;
  }

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default SchemaMarkup;