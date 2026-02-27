import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required to generate an image based on context.' }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API Error: API 키가 설정되지 않았습니다. .env에 OPENAI_API_KEY를 추가해주세요.' }, { status: 500 });
        }

        const openai = new OpenAI({ apiKey });

        // 1. Text -> Image Prompt via journalistic metaphor strategy
        const promptCompletion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a visual editor at a world-class news magazine. Your job is to choose a symbolic, editorial visual concept for a news article — the kind a photo editor would choose for the cover of The Economist or TIME magazine.

Read the provided Korean news article and output ONE English image prompt (max 45 words) for DALL-E 3.

CRITICAL RULES:
1. Use SYMBOLIC or METAPHORICAL imagery — never literal violence, real weapons, or identifiable people.
   - Conflict/war → cracked flags, chess pieces on a map, broken bridges, storm clouds over a landmark, tangled barbed wire as abstract art
   - Economic → tumbling coins, cracked stock graph, a scale tipping, currency symbols clashing
   - Political → empty parliament, fractured globe, two abstract flags facing each other
   - Technology → circuit boards, futuristic cityscape, glowing data streams
2. No real faces or identifiable individuals.
3. No text, letters, or numbers inside the image.
4. Style: dramatic, cinematic, photorealistic, magazine cover quality.
5. Output ONLY the raw image prompt. No explanations, no quotes.`
                },
                {
                    role: "user",
                    content: text.slice(0, 600)
                }
            ],
            temperature: 0.6,
        });

        const rawPrompt = promptCompletion.choices[0].message.content?.trim() ?? '';
        const imagePrompt = rawPrompt || 'Dramatic cinematic editorial illustration of two abstract national flags facing each other across a dark divide, symbolic geopolitical tension, magazine cover style';

        if (!imagePrompt) {
            return NextResponse.json({ error: 'Failed to generate an image prompt.' }, { status: 500 });
        }

        // 2. Image Prompt -> Image Generation (Using DALL-E 3)
        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: imagePrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            response_format: "url",
        });

        const imageUrl = imageResponse.data?.[0]?.url;

        if (!imageUrl) {
            return NextResponse.json({ error: 'OpenAI returned an empty image URL.' }, { status: 500 });
        }

        return NextResponse.json({
            url: imageUrl,
            promptUsed: imagePrompt
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '이미지를 생성하는 동안 오류가 발생했습니다. DALL-E 3 크레딧이 부족할 수 있습니다.';
        console.error('AI Image Gen Error:', error);
        return NextResponse.json({
            error: message
        }, { status: 500 });
    }
}
