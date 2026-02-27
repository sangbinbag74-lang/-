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

        // 1. Text -> Image Prompt (Using GPT-4o-mini for speed & cost efficiency)
        const promptCompletion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert prompt engineer for DALL-E 3. Read the provided Korean text and write a single English image prompt (max 40 words) for a safe, clean, professional editorial illustration.
Rules:
- Describe only peaceful, positive, neutral scenes such as landscapes, objects, workplaces, cityscapes, or abstract concepts.
- Never include people's faces, identifiable individuals, weapons, violence, politics, or anything controversial.
- Do NOT include any text, letters, or words in the described image.
- Start the prompt with: "A safe, neutral, photorealistic editorial illustration of"
- Output only the prompt text, nothing else.`
                },
                {
                    role: "user",
                    content: text.slice(0, 500) // Limit input length
                }
            ],
            temperature: 0.5,
        });

        const rawPrompt = promptCompletion.choices[0].message.content?.trim() ?? '';
        // Ensure it always starts with a safe prefix
        const imagePrompt = rawPrompt.startsWith('A safe')
            ? rawPrompt
            : `A safe, neutral, photorealistic editorial illustration of ${rawPrompt}`;

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
