import { usePathname } from 'next/navigation';

import { Helmet } from 'react-helmet-async';


interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article';
  schema?: object;
  noIndex?: boolean;
}

const SEOHead = ({ 
  title = "Realprofit.vn - Đầu tư BĐS thông minh",
  description = "Realprofit.vn - Nền tảng kiểm tra pháp lý, phân tích thị trường và tính toán đầu tư bất động sản hàng đầu Việt Nam.",
  keywords = "bất động sản, pháp lý, kiểm tra, đầu tư, chung cư, dự án, realprofit",
  image = "https://lovable.dev/opengraph-image-p98pqg.png",
  type = "website",
  schema,
  noIndex = false
}: SEOProps) => {
  const pathname = usePathname();
  const currentUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${pathname}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Realprofit.vn" />
      <meta property="og:locale" content="vi_VN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;