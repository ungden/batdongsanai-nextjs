"use client";
import { FormattedAnalysis, FormattedSection, ContentBlock, ValuationData, RisksAndPotentialsData, RecommendationsData, KeyHighlight } from "../../types/analysis";
import { CheckCircle2, XCircle, TrendingUp, Target, ShieldCheck, ShieldAlert, Clock, Zap, MinusCircle, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

// --- TEXT UTILITIES ---

const stripNoise = (text?: string) => {
  if (!text) return "";
  let cleaned = text.replace(/\*{1,}/g, "").replace(/`{1,}/g, "");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
};

const emphasizeLabel = (text: string) => {
  const cleaned = stripNoise(text);
  const match = cleaned.match(/^\s*([^:]{1,40}):\s*(.+)$/);
  if (!match) return cleaned;
  const [, label, rest] = match;
  return (
    <span>
      <span className="font-semibold">{label}:</span> {rest}
    </span>
  );
};

const isNegativeText = (txt: string) => {
  const t = txt.toLowerCase();
  const negatives = [
    "rủi ro", "nguy cơ", "âm", "giảm", "suy giảm", "sụt giảm", "áp lực",
    "nợ cao", "dòng tiền âm", "thiếu", "suy yếu", "giảm sâu", "đi xuống", "bất lợi", "chi phí tăng"
  ];
  return negatives.some(k => t.includes(k));
};

const isPositiveText = (txt: string) => {
  const t = txt.toLowerCase();
  const positives = [
    "cơ hội", "tích cực", "cải thiện", "tăng trưởng", "khả quan", "bứt phá",
    "mở rộng", "hồi phục", "đi lên", "thuận lợi", "giảm nợ", "dòng tiền cải thiện"
  ];
  return positives.some(k => t.includes(k));
};

const decideListIcon = (sectionHeading?: string | null, item?: string) => {
  const heading = (sectionHeading || "").toLowerCase();
  const text = stripNoise(item || "");
  if (heading.includes("rủi ro") && !heading.includes("cơ hội") && !heading.includes("tiềm năng")) {
    return { type: "negative" as const, icon: <MinusCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" /> };
  }
  if ((heading.includes("cơ hội") || heading.includes("tiềm năng")) && !heading.includes("rủi ro")) {
    return { type: "positive" as const, icon: <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" /> };
  }
  if (isNegativeText(text)) {
    return { type: "negative" as const, icon: <MinusCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" /> };
  }
  if (isPositiveText(text)) {
    return { type: "positive" as const, icon: <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" /> };
  }
  return { type: "neutral" as const, icon: <Circle className="w-4 h-4 text-gray-400 mt-1.5 flex-shrink-0" /> };
};

// --- SPECIALIZED RENDERERS ---

const ValuationCard = ({ data, isPremium }: { data: ValuationData, isPremium?: boolean }) => {
  const accentBg = isPremium ? 'bg-gradient-to-br from-amber-500 to-yellow-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600';
  const accentText = isPremium ? 'text-amber-900' : 'text-blue-900';
  const accentBorder = isPremium ? 'border-amber-300' : 'border-blue-300';

  const getRecommendationBadge = (rec?: string) => {
    const r = rec?.toUpperCase() || '';
    if (r.includes('MUA') || r.includes('KHẢ QUAN')) return 'bg-green-600 text-white';
    if (r.includes('BÁN')) return 'bg-red-600 text-white';
    if (r.includes('NẮM GIỮ')) return 'bg-yellow-500 text-yellow-900';
    return 'bg-gray-500 text-white';
  };

  return (
    <Card className={`mb-8 border-2 ${accentBorder} shadow-xl`}>
      <div className={`p-6 ${accentBg} text-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider">Định giá & Khuyến nghị</h2>
              <p className="text-3xl font-extrabold">{data.finalPriceTarget?.toLocaleString('vi-VN') || 'N/A'} VNĐ/m²</p>
            </div>
          </div>
          {data.finalRecommendation && (
            <Badge className={`px-4 py-2 text-base font-bold shadow-lg ${getRecommendationBadge(data.finalRecommendation)}`}>
              {data.finalRecommendation}
            </Badge>
          )}
        </div>
      </div>
      {data.summary && (
        <CardContent className="p-6 bg-white rounded-b-lg">
          <p className={`text-base leading-relaxed ${accentText}`}>{stripNoise(data.summary)}</p>
        </CardContent>
      )}
    </Card>
  );
};

const RisksPotentialsCard = ({ data }: { data: RisksAndPotentialsData }) => (
  <Card className="mb-8">
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="p-6 border-b md:border-b-0 md:border-r">
        <CardTitle className="flex items-center text-red-600 mb-4">
          <ShieldAlert className="w-6 h-6 mr-3" />
          Rủi ro cần lưu ý
        </CardTitle>
        <ul className="space-y-3">
          {(data.risks || []).map((item, i) => (
            <li key={i} className="flex items-start space-x-3">
              <MinusCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
              <span className="text-gray-800">{emphasizeLabel(item)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-6">
        <CardTitle className="flex items-center text-green-600 mb-4">
          <ShieldCheck className="w-6 h-6 mr-3" />
          Tiềm năng & Cơ hội
        </CardTitle>
        <ul className="space-y-3">
          {(data.potentials || []).map((item, i) => (
            <li key={i} className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <span className="text-gray-800">{emphasizeLabel(item)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </Card>
);

const RecommendationsCard = ({ data }: { data: RecommendationsData }) => (
  <Card className="mb-8">
    <div className="grid grid-cols-1 md:grid-cols-2">
      {data.shortTerm && (
        <div className="p-6 border-b md:border-b-0 md:border-r">
          <CardTitle className="flex items-center text-blue-600 mb-3">
            <Clock className="w-5 h-5 mr-2" />
            Ngắn hạn
          </CardTitle>
          <p className="text-gray-700">{emphasizeLabel(data.shortTerm)}</p>
        </div>
      )}
      {data.longTerm && (
        <div className="p-6">
          <CardTitle className="flex items-center text-purple-600 mb-3">
            <TrendingUp className="w-5 h-5 mr-2" />
            Dài hạn
          </CardTitle>
          <p className="text-gray-700">{emphasizeLabel(data.longTerm)}</p>
        </div>
      )}
    </div>
  </Card>
);

const KeyHighlights = ({ highlights }: { highlights: KeyHighlight[] }) => {
  const getTypeStyle = (type: KeyHighlight['type']) => {
    switch(type) {
      case 'positive': return 'bg-green-50 border-green-300 text-green-800';
      case 'negative': return 'bg-red-50 border-red-300 text-red-800';
      default: return 'bg-gray-50 border-gray-300 text-gray-800';
    }
  };
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><Zap className="w-5 h-5 mr-2 text-yellow-500"/>Điểm nhấn chính</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlights.map((item, i) => (
          <div key={i} className={`p-4 rounded-lg border-l-4 ${getTypeStyle(item.type)}`}>
            <p>{stripNoise(item.text)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- GENERIC RENDERERS ---

const ContentBlockRenderer = ({ block, sectionHeading }: { block: ContentBlock, sectionHeading?: string | null }) => {
  if (block.type === 'paragraph') {
    return <p className="text-base text-gray-800 leading-relaxed">{emphasizeLabel(block.content)}</p>;
  }
  if (block.type === 'list') {
    return (
      <ul className="space-y-2 my-4">
        {block.items.map((raw, index) => {
          const { icon } = decideListIcon(sectionHeading, raw);
          return (
            <li key={index} className="flex items-start space-x-3">
              {icon}
              <span className="text-base text-gray-800 leading-relaxed">{emphasizeLabel(raw)}</span>
            </li>
          );
        })}
      </ul>
    );
  }
  return null;
};

const SectionRenderer = ({ section, isPremium }: { section: FormattedSection, isPremium?: boolean }) => {
  const accentBorder = isPremium ? 'border-amber-300' : 'border-blue-300';
  return (
    <div className="mb-8">
      {section.heading && (
        <div className={`pb-2 mb-4 border-b-2 ${accentBorder}`}>
          <h2 className="text-xl font-bold text-gray-900">{stripNoise(section.heading)}</h2>
        </div>
      )}
      <div className="prose prose-slate max-w-none">
        {(section.content_blocks || []).map((block, index) => (
          <ContentBlockRenderer key={index} block={block} sectionHeading={section.heading} />
        ))}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface FormattedAnalysisRendererProps {
  formatted: FormattedAnalysis;
  isPremium?: boolean;
}

const FormattedAnalysisRenderer = ({ formatted, isPremium }: FormattedAnalysisRendererProps) => {
  if (!formatted) {
    return <div className="text-center text-gray-500">Không có dữ liệu để hiển thị.</div>;
  }

  return (
    <div className="space-y-6">
      {formatted.keyHighlights && <KeyHighlights highlights={formatted.keyHighlights} />}
      {formatted.valuation && <ValuationCard data={formatted.valuation} isPremium={isPremium} />}
      
      {formatted.sections?.map((section, index) => (
        <SectionRenderer key={section.section_id || index} section={section} isPremium={isPremium} />
      ))}

      {formatted.risksAndPotentials && <RisksPotentialsCard data={formatted.risksAndPotentials} />}
      {formatted.recommendations && <RecommendationsCard data={formatted.recommendations} />}
    </div>
  );
};

export default FormattedAnalysisRenderer;