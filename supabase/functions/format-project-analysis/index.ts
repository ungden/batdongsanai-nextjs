/* eslint-disable */
// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import OpenAI from 'https://esm.sh/openai@4.52.7'
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

declare const Deno: { env: { get(key: string): string | undefined } }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function tryParseJson(text: string): any | null {
  if (!text) return null
  try {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/)
    if (match && match[1]) return JSON.parse(match[1])
    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const potentialJson = text.substring(firstBrace, lastBrace + 1)
      return JSON.parse(potentialJson)
    }
    return JSON.parse(text)
  } catch {
    return null
  }
}

const PROMPT = `
Bạn là chuyên gia nghiên cứu bất động sản. Hãy CHỈ ĐỊNH DẠNG văn bản thô bên dưới thành JSON duy nhất theo schema FormattedAnalysis cho "project_analysis".
KHÔNG thêm bịa đặt, KHÔNG markdown, KHÔNG giải thích — chỉ trả về 1 object JSON hợp lệ.

SCHEMA:
{
  "meta": {
    "title": "string",
    "slug": "string|null",
    "date": "string|null",
    "symbols": ["string"]|null,
    "tags": ["string"]|null,
    "language": "string|null",
    "source_type": "project_analysis"
  },
  "summary_for_indexing": "string|null",
  "valuation": {
    "finalPriceTarget": "number|null",
    "finalRecommendation": "string|null",
    "summary": "string|null"
  },
  "risksAndPotentials": {
    "risks": ["string"],
    "potentials": ["string"]
  },
  "recommendations": {
    "shortTerm": "string|null",
    "longTerm": "string|null"
  },
  "keyHighlights": [
    { "text": "string", "type": "positive|negative|neutral" }
  ],
  "sections": [
    {
      "heading": "string",
      "content_blocks": [
        { "type": "paragraph", "content": "string" },
        { "type": "list", "items": ["string"] }
      ]
    }
  ]
}

Lưu ý: Nếu thiếu thông tin, để null hoặc [].
VĂN BẢN THÔ:
---
[RAW_CONTENT]
---
`

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: userRes } = await supabase.auth.getUser(token)
    const user = userRes?.user
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Check admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin only' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { raw_content, model = 'google/gemini-2.0-flash-001' } = await req.json()
    
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openrouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is not set in environment variables.')
    }

    const client = new OpenAI({
      apiKey: openrouterApiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://propertyhub.vn',
        'X-Title': 'PropertyHub',
      },
    })

    const finalPrompt = PROMPT.replace('[RAW_CONTENT]', raw_content)

    const chat = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: finalPrompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
      max_tokens: 50000 // Tăng output limit
    })

    const content = chat.choices?.[0]?.message?.content ?? ''
    if (!content) throw new Error('AI returned an empty response.')

    const formatted = tryParseJson(content)
    if (!formatted) throw new Error('Failed to parse JSON from AI response.')
    if (!formatted.meta?.title || !formatted.sections) {
      throw new Error('Formatted analysis missing required fields (meta.title or sections).')
    }
    formatted.meta.source_type = 'project_analysis'

    return new Response(JSON.stringify({ formatted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('[format-project-analysis]', error?.message || error)
    return new Response(JSON.stringify({ error: error?.message || 'Internal error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})