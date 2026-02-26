"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, Sparkles, Send, Save, Eye, MoreHorizontal } from "lucide-react";
import { savePost } from "./actions";

export default function AIEditor() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSave = (status: 'draft' | 'published') => {
        if (!title && !content) return;

        startTransition(async () => {
            const result = await savePost({ title, content, status });
            if (result?.error) {
                alert(result.error);
            }
        });
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
    };

    const handleAiAssist = async () => {
        setIsAiProcessing(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content, mode: 'tone_journalistic' }) // Default formatting
            });
            const data = await res.json();
            if (data.result) setContent(data.result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAiProcessing(false);
        }
    };

    const handleToneChange = async (mode: string) => {
        setIsAiProcessing(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content, mode })
            });
            const data = await res.json();
            if (data.result) setContent(data.result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAiProcessing(false);
        }
    };

    return (
        <div className="container mx-auto max-w-screen-xl px-4 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[calc(100vh-140px)] flex flex-col">

            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
                <Link href="/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    대시보드로 돌아가기
                </Link>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-medium mr-2">
                        {isPending ? '저장 중...' : '자동 저장 활성화됨'}
                    </span>
                    <button className="p-2 border border-border/60 rounded-lg text-muted-foreground hover:bg-accent transition-colors" aria-label="미리보기">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleSave('draft')}
                        disabled={isPending}
                        className="px-4 py-2 border border-border/60 rounded-lg text-sm font-medium hover:bg-accent transition-colors flex items-center disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" /> 초안 저장
                    </button>
                    <button
                        onClick={() => handleSave('published')}
                        disabled={isPending}
                        className="px-5 py-2 bg-brand-deepNavy dark:bg-foreground text-white dark:text-background rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center disabled:opacity-50"
                    >
                        <Send className="w-4 h-4 mr-2" /> 발행하기
                    </button>
                </div>
            </div>

            {/* Editor Layout: Main workspace + Side panel */}
            <div className="flex flex-col lg:flex-row gap-8 flex-1 h-full">

                {/* Main Editor Area */}
                <div className="flex-1 flex flex-col max-w-4xl w-full">
                    <input
                        type="text"
                        placeholder="기사 제목..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-4xl md:text-5xl font-serif font-bold bg-transparent border-none outline-none placeholder:text-muted focus:ring-0 mb-6 text-foreground"
                    />

                    <div className="flex items-center gap-2 mb-6 p-2 bg-card border border-border/50 rounded-xl shadow-sm w-fit">
                        <button
                            onClick={toggleRecording}
                            className={`p-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors ${isRecording
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                : 'hover:bg-accent text-foreground'
                                }`}
                        >
                            <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                            {isRecording ? '듣는 중...' : '음성 입력 (STT)'}
                        </button>
                        <div className="w-px h-6 bg-border mx-1"></div>
                        <button
                            onClick={handleAiAssist}
                            disabled={isAiProcessing || content.length === 0}
                            className="p-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-brand-mutedBlue/10 text-brand-mutedBlue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sparkles className={`w-4 h-4 ${isAiProcessing ? 'animate-spin' : ''}`} />
                            자동 포맷팅
                        </button>
                        <button className="p-2.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="글을 작성하거나, 음성 입력을 통해 생각을 기록해 보세요..."
                        className="w-full flex-1 resize-none bg-transparent border-none outline-none text-lg md:text-xl font-sans font-light leading-relaxed placeholder:text-muted-foreground/50 focus:ring-0 text-foreground custom-scrollbar"
                    />
                </div>

                {/* AI Assistant Side Panel */}
                <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 border-l border-border/40 pl-0 lg:pl-8">

                    {/* Tone & Style Adjustment */}
                    <div className="bg-gradient-to-br from-brand-mutedBlue/5 to-transparent border border-brand-mutedBlue/20 rounded-[1.5rem] p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-brand-mutedBlue" />
                            <h3 className="font-bold text-foreground">AI 문체 보정기</h3>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                            원하시는 어조를 선택하면 본문 초안을 즉시 다시 작성해 드립니다.
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleToneChange('tone_journalistic')} className="px-3 py-2 text-xs font-semibold rounded-lg border border-border/60 bg-card hover:bg-accent hover:border-brand-mutedBlue/30 text-foreground transition-all">
                                저널리즘
                            </button>
                            <button onClick={() => handleToneChange('tone_editorial')} className="px-3 py-2 text-xs font-semibold rounded-lg border border-border/60 bg-card hover:bg-accent hover:border-brand-mutedBlue/30 text-foreground transition-all">
                                사설
                            </button>
                            <button onClick={() => handleToneChange('tone_casual')} className="px-3 py-2 text-xs font-semibold rounded-lg border border-border/60 bg-card hover:bg-accent hover:border-brand-mutedBlue/30 text-foreground transition-all">
                                캐주얼
                            </button>
                            <button onClick={() => handleToneChange('tone_academic')} className="px-3 py-2 text-xs font-semibold rounded-lg border border-border/60 bg-card hover:bg-accent hover:border-brand-mutedBlue/30 text-foreground transition-all">
                                논문/학술
                            </button>
                        </div>

                        <button disabled={isAiProcessing || !content} onClick={() => handleAiAssist()} className="w-full mt-4 py-2.5 bg-brand-deepNavy dark:bg-brand-mutedBlue/30 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                            문체 적용하기 {isAiProcessing && '...'}
                        </button>
                    </div>

                    {/* AI Utilities */}
                    <div className="border border-border/50 bg-card rounded-[1.5rem] p-6 shadow-sm flex-1">
                        <h3 className="font-bold text-foreground mb-4">비서 기능</h3>
                        <div className="space-y-3">
                            <button
                                disabled={isAiProcessing || !content}
                                onClick={() => handleToneChange('summarize')}
                                className="w-full p-3 flex flex-col items-start gap-1 rounded-xl hover:bg-accent border border-transparent hover:border-border/60 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-sm font-semibold text-foreground group-hover:text-brand-mutedBlue">요약본 생성하기</span>
                                <span className="text-xs text-muted-foreground">독자를 위해 본문 상단 3줄 요약</span>
                            </button>
                            <button
                                disabled={isAiProcessing || !content}
                                onClick={() => handleToneChange('search_data')}
                                className="w-full p-3 flex flex-col items-start gap-1 rounded-xl hover:bg-accent border border-transparent hover:border-border/60 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-sm font-semibold text-foreground group-hover:text-brand-mutedBlue">데이터 포인트 검색</span>
                                <span className="text-xs text-muted-foreground">글을 뒷받침할 객관적 통계 추가</span>
                            </button>
                            <button
                                disabled={isAiProcessing || !content}
                                onClick={() => handleToneChange('suggest_title')}
                                className="w-full p-3 flex flex-col items-start gap-1 rounded-xl hover:bg-accent border border-transparent hover:border-border/60 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-sm font-semibold text-foreground group-hover:text-brand-mutedBlue">제목 풀 제안받기</span>
                                <span className="text-xs text-muted-foreground">시선을 끄는 매력적인 헤드라인 5개 추천</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
