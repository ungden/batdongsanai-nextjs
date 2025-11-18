export type FormattedMeta = {
  title?: string | null;
  slug?: string | null;
  date?: string | null;
  symbols?: string[] | null;
  tags?: string[] | null;
  language?: string | null;
  source_type?: 'project_analysis' | 'corporate_analysis';
  model_used?: "Gemini-2.5-Flash" | "Gemini-2.5-Pro";
};

export type ValuationData = {
  finalPriceTarget?: number | null;
  finalRecommendation?: string | null;
  summary?: string | null;
};

export type RisksAndPotentialsData = {
  risks?: string[];
  potentials?: string[];
};

export type RecommendationsData = {
  shortTerm?: string | null;
  longTerm?: string | null;
};

export type KeyHighlight = {
  text: string;
  type: 'positive' | 'negative' | 'neutral';
};

export type ContentBlock = 
  | { type: 'paragraph'; content: string }
  | { type: 'list'; items: string[] };

export type FormattedSection = {
  section_id?: string;
  heading: string | null;
  content_blocks: ContentBlock[];
};

export type FormattedAnalysis = {
  meta?: FormattedMeta;
  valuation?: ValuationData;
  risksAndPotentials?: RisksAndPotentialsData;
  recommendations?: RecommendationsData;
  keyHighlights?: KeyHighlight[];
  sections: FormattedSection[];
  summary_for_indexing?: string | null;
};