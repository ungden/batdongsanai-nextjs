// Ambient modules cho URL imports dùng trong Supabase Edge Functions (Deno).
// Giúp TypeScript ở môi trường Vite/Node không báo lỗi TS2307.

// deno.land std server
declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
}

// OpenAI qua esm.sh (phiên bản đúng với file edge function)
declare module "https://esm.sh/openai@4.52.7" {
  // Minimal typings đủ dùng cho project
  export default class OpenAI {
    constructor(options?: {
      apiKey?: string;
      baseURL?: string;
      defaultHeaders?: Record<string, string>;
    });
    chat: {
      completions: {
        create: (opts: any) => Promise<any>;
      };
    };
  }
}