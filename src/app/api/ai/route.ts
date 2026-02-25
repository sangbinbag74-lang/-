import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text, mode } = await req.json();

        if (!text && mode !== 'generate') {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // MOCK RESPONSE FOR DEMO PURPOSES
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

        let mockResult = "";
        if (mode === 'summary') {
            mockResult = JSON.stringify([
                "This is the first generated summary point about the text.",
                "Here is the second compelling insight extracted by the AI.",
                "Finally, the third point concludes the main argument effectively."
            ]);
        } else {
            mockResult = `[Mock ${mode || 'edited'} version]\n\n${text}\n\n(Note: This is a placeholder since no real OpenAI API key was provided. In production, this would be the actual AI-generated text.)`;
        }

        return NextResponse.json({ result: mockResult });

    } catch (error) {
        console.error('OpenAI API error:', error);
        return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
    }
}
