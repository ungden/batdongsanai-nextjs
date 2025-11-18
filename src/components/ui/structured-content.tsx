
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';

interface FAQItemProps {
  question: string;
  answer: string;
}

export const FAQItem = ({ question, answer }: FAQItemProps) => (
  <Card className="mb-4">
    <CardHeader>
      <CardTitle className="text-lg">{question}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{answer}</p>
    </CardContent>
  </Card>
);

interface HowToStepProps {
  step: number;
  title: string;
  description: string;
}

export const HowToStep = ({ step, title, description }: HowToStepProps) => (
  <div className="flex gap-4 mb-6">
    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
      {step}
    </div>
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

interface ArticleSummaryProps {
  title: string;
  summary: string;
  readTime?: string;
}

export const ArticleSummary = ({ title, summary, readTime }: ArticleSummaryProps) => (
  <Card className="mb-6 bg-blue-50 border-blue-200">
    <CardContent className="p-6">
      <h2 className="text-xl font-semibold mb-3 text-blue-900">{title}</h2>
      <p className="text-blue-800 leading-relaxed">{summary}</p>
      {readTime && (
        <div className="mt-3 text-sm text-blue-600">
          Thời gian đọc: {readTime}
        </div>
      )}
    </CardContent>
  </Card>
);
