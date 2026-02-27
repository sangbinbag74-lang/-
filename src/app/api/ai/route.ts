import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
    try {
        const { text, mode } = await req.json();

        if (!text && mode !== 'generate') {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API Error: API 키가 설정되지 않았습니다. .env에 GEMINI_API_KEY를 추가해주세요.' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });

        let systemPrompt = "당신은 전문적이고 유능한 수석 에디터입니다.";

        switch (mode) {
            case 'tone_journalistic':
                systemPrompt += " 제공된 텍스트를 깊이 있고 신뢰감 있는 저널리즘(기사) 어조로 변경하세요.";
                break;
            case 'summarize':
                systemPrompt += " 제공된 텍스트를 독자가 가장 흥미로워할 3줄 요약 부울릿 포인트(1,2,3)로 핵심만 정리하세요.";
                break;
            case 'search_data':
                systemPrompt += " 제공된 텍스트의 맥락에 어울리는 구체적인 최신 통계 데이터나 객관적인 사실 1~2가지를 덧붙여서 글을 더욱 풍부하게 만들어주세요.";
                break;
            case 'suggest_title':
                systemPrompt += " 이 글 내용에 어울리는 가장 시선을 끌 수 있는 매력적인 제목 5가지를 번호 매겨서 추천해 주세요.";
                break;
            case 'expand':
                systemPrompt += " 제공된 텍스트의 논리와 맥락을 바탕으로 구체적인 예시, 부연 설명, 깊이 있는 통찰을 추가하여 글의 전체 분량을 2배 정도로 풍부하게 확장해 주세요.";
                break;
            case 'proofread':
                systemPrompt += " 제공된 텍스트의 본래 톤과 맥락은 완벽히 유지하되, 오탈자, 띄어쓰기, 문법적 오류, 어색한 문장 구조만 전문가 수준으로 깔끔하게 교정해 주세요. 교정된 결과물만 출력하세요.";
                break;
            case 'generate_article':
                systemPrompt += " 제공된 짧은 아이디어나 키워드를 바탕으로, 관련된 배경 지식과 맥락을 추가로 심층 취재하여 전문가 수준의 뉴스 기사를 작성해 주세요. 기사는 사실적이고 객관적인 언론 보도 형식(저널리즘 톤)이어야 하며, 불필요한 마크다운 기호(예: ###, ** 등)나 소제목을 남발하지 말고, 특히 글의 제목이나 본문에 절대 굵은 글씨(**)를 사용하지 마세요. 단락 구분을 통해 자연스럽게 서론, 본론, 결론이 유려하게 이어지는 완성된 기사 본문을 작성해 주세요. 서술어는 '~다', '~했다' 체로 통일하세요.";
                break;
            default:
                systemPrompt += " 이 글의 의도를 파악하여 문맥을 매끄럽게 포맷팅하고 단락을 세련되게 구조화하세요.";
        }

        const config: {
            systemInstruction: string;
            temperature: number;
            tools?: Array<{ googleSearch: object }>;
        } = {
            systemInstruction: systemPrompt,
            temperature: 0.7,
        };

        // 인터넷 검색(Grounding) 허용 모드: 기사 생성, 통계 검색
        if (mode === 'generate_article' || mode === 'search_data') {
            config.tools = [{ googleSearch: {} }];
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: text,
            config: config
        });

        const result = response.text;

        return NextResponse.json({ result });

    } catch (error) {
        console.error('Gemini API error:', error);
        const errMessage = error instanceof Error ? error.message : 'Failed to process AI request';
        return NextResponse.json({ error: errMessage }, { status: 500 });
    }
}
