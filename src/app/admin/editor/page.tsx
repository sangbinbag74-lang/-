"use client";

import { useState, useTransition, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send, Save, Eye, MoreHorizontal, ImageIcon, Heading2, Heading3, Bold, Italic, Link as LinkIcon, List, Quote, Undo2, Redo2 } from "lucide-react";
import { supabase } from '@/lib/supabase/client';
import { savePost } from "./actions";

function EditorContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const postId = searchParams.get('id');

    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState<'article' | 'short'>('article');
    const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // History state for Undo/Redo
    const [past, setPast] = useState<string[]>([]);
    const [future, setFuture] = useState<string[]>([]);

    const updateContent = (newContent: string, saveHistory = true) => {
        if (saveHistory && content !== newContent) {
            setPast(prev => [...prev, content].slice(-50)); // Keep last 50 states
            setFuture([]);
        }
        setContent(newContent);
    };

    const handleUndo = () => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        setFuture(prev => [content, ...prev]);
        setPast(prev => prev.slice(0, -1));
        setContent(previous);
    };

    const handleRedo = () => {
        if (future.length === 0) return;
        const next = future[0];
        setPast(prev => [...prev, content]);
        setFuture(prev => prev.slice(1));
        setContent(next);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                handleRedo();
            } else {
                handleUndo();
            }
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            handleRedo();
        } else if (e.key === ' ' || e.key === 'Enter') {
            // Save state on word boundary or new line
            setPast(prev => {
                const last = prev[prev.length - 1];
                if (last !== content) return [...prev, content].slice(-50);
                return prev;
            });
            setFuture([]);
        }
    };

    useEffect(() => {
        if (postId) {
            const fetchPost = async () => {
                const { data } = await supabase.from('posts').select('*').eq('id', postId).single();
                if (data) {
                    setTitle(data.title || "");
                    setSummary(data.summary || "");
                    setContent(data.content || "");
                    if (data.slug?.startsWith('short-')) {
                        setCategory('short');
                    } else {
                        setCategory('article');
                    }
                }
            };
            fetchPost();
        }
    }, [postId]);

    const handleSave = (status: 'draft' | 'published') => {
        if (!title && !content) return;

        startTransition(async () => {
            const result = await savePost({ id: postId || undefined, title, content, summary, status, category });
            if (result?.error) {
                alert(result.error);
            } else if (result?.success) {
                alert(status === 'published' ? '발행되었습니다.' : '초안이 저장되었습니다.');
                if (status === 'published') {
                    router.push('/admin/posts');
                } else if (!postId && result.id) {
                    router.replace(`/admin/editor?id=${result.id}`);
                }
            }
        });
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
            if (data.result) updateContent(data.result);
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
            if (data.result) {
                if (mode === 'suggest_title') {
                    const titles = data.result
                        .split('\n')
                        .map((line: string) => line.trim())
                        .filter((line: string) => line.length > 0);
                    setSuggestedTitles(titles);
                } else if (mode === 'summarize') {
                    setSummary(data.result);
                } else {
                    updateContent(data.result);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsAiProcessing(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

            const { error } = await supabase.storage
                .from('post-images')
                .upload(fileName, file);

            if (error) {
                console.error("Upload error:", error);
                alert(`이미지 업로드 실패: ${error.message}`);
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from('post-images')
                .getPublicUrl(fileName);

            const imageUrl = publicUrlData.publicUrl;
            const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;

            const textarea = textareaRef.current;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
                updateContent(newContent);
                // Move cursor
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
                    textarea.focus();
                }, 0);
            } else {
                updateContent(content + imageMarkdown);
            }
        } catch (error) {
            console.error(error);
            alert("업로드 중 오류가 발생했습니다.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const [isImageGenerating, setIsImageGenerating] = useState(false);

    const handleGenerateImage = async () => {
        if (!content || content.length < 20) {
            alert("AI가 그림을 그릴 수 있도록 본문을 최소 20자 이상 작성해 주세요.");
            return;
        }

        setIsImageGenerating(true);
        try {
            const res = await fetch('/api/ai/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content })
            });
            const data = await res.json();

            if (data.error) {
                alert(data.error);
                return;
            }

            if (data.url) {
                const imageMarkdown = `\n![AI 썸네일](${data.url})\n`;
                const textarea = textareaRef.current;

                if (textarea) {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
                    updateContent(newContent);
                    setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
                        textarea.focus();
                    }, 0);
                } else {
                    updateContent(imageMarkdown + content);
                }
            }
        } catch (e) {
            console.error(e);
            alert("이미지 생성 중 오류가 발생했습니다.");
        } finally {
            setIsImageGenerating(false);
        }
    };

    const insertMarkdown = (prefix: string, suffix: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = content;
        const selectedText = text.substring(start, end);

        const newContent = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
        setContent(newContent);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                start + prefix.length + selectedText.length
            );
        }, 0);
    };

    return (
        <div className="container mx-auto max-w-screen-xl px-4 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[calc(100vh-140px)] flex flex-col">

            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
                <Link href="/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    대시보드로 돌아가기
                </Link>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-accent rounded-lg p-1">
                        <button
                            onClick={() => setCategory('article')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${category === 'article' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            기사 (Insight)
                        </button>
                        <button
                            onClick={() => setCategory('short')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${category === 'short' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            단상 (Short)
                        </button>
                    </div>

                    <span className="text-xs text-muted-foreground font-medium hidden md:block">
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
                        className="w-full text-4xl md:text-5xl font-serif font-bold bg-transparent border-none outline-none placeholder:text-muted focus:ring-0 mb-4 text-foreground"
                    />

                    <textarea
                        placeholder="여기에 핵심 요약(AI 3줄 요약)을 입력하거나 우측 비서 AI로 자동 생성하세요..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="w-full text-lg bg-card border border-border/50 rounded-xl p-4 outline-none placeholder:text-muted focus:ring-1 focus:ring-brand-mutedBlue/50 mb-6 text-foreground/80 resize-none"
                        rows={3}
                    />

                    <div className="flex items-center gap-2 mb-6 p-2 bg-card border border-border/50 rounded-xl shadow-sm w-fit">
                        <button
                            onClick={handleAiAssist}
                            disabled={isAiProcessing || content.length === 0}
                            className="p-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-brand-mutedBlue/10 text-brand-mutedBlue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sparkles className={`w-4 h-4 ${isAiProcessing ? 'animate-spin' : ''}`} />
                            자동 포맷팅
                        </button>

                        <div className="w-px h-6 bg-border mx-1"></div>

                        {/* Formatting Toolbar */}
                        <div className="flex items-center gap-0.5">
                            <button onClick={() => insertMarkdown('## ', '')} className="p-2 shadow-sm rounded-lg hover:bg-accent text-foreground transition-colors" title="소제목 1"><Heading2 className="w-4 h-4" /></button>
                            <button onClick={() => insertMarkdown('### ', '')} className="p-2 shadow-sm rounded-lg hover:bg-accent text-foreground transition-colors" title="소제목 2"><Heading3 className="w-4 h-4" /></button>
                            <div className="w-px h-4 bg-border mx-1"></div>
                            <button onClick={() => insertMarkdown('**', '**')} className="p-2 shadow-sm rounded-lg hover:bg-accent text-foreground transition-colors" title="굵게"><Bold className="w-4 h-4" /></button>
                            <button onClick={() => insertMarkdown('_', '_')} className="p-2 shadow-sm rounded-lg hover:bg-accent text-foreground transition-colors" title="기울임"><Italic className="w-4 h-4" /></button>
                            <div className="w-px h-4 bg-border mx-1"></div>
                            <button onClick={() => insertMarkdown('- ', '')} className="p-2 shadow-sm rounded-lg hover:bg-accent text-foreground transition-colors" title="목록"><List className="w-4 h-4" /></button>
                            <button onClick={() => insertMarkdown('> ', '')} className="p-2 shadow-sm rounded-lg hover:bg-accent text-foreground transition-colors" title="인용구"><Quote className="w-4 h-4" /></button>
                            <button onClick={() => insertMarkdown('[', '](url)')} className="p-2 shadow-sm rounded-lg hover:bg-accent text-foreground transition-colors" title="링크"><LinkIcon className="w-4 h-4" /></button>
                        </div>

                        {/* Undo / Redo */}
                        <div className="flex items-center gap-0.5 ml-2">
                            <button onClick={handleUndo} disabled={past.length === 0} className="p-2 shadow-sm rounded-lg hover:bg-accent text-foreground transition-colors disabled:opacity-30" title="실행 취소 (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
                            <button onClick={handleRedo} disabled={future.length === 0} className="p-2 shadow-sm rounded-lg hover:bg-accent text-foreground transition-colors disabled:opacity-30" title="다시 실행 (Ctrl+Y)"><Redo2 className="w-4 h-4" /></button>
                        </div>

                        <div className="w-px h-6 bg-border mx-1 hidden md:block"></div>

                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isImageGenerating}
                            className="p-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-accent text-foreground transition-colors disabled:opacity-50"
                        >
                            <ImageIcon className={`w-4 h-4 ${isUploading ? 'animate-pulse' : ''}`} />
                            {isUploading ? '업로드 중...' : '사진 첨부'}
                        </button>

                        <button
                            onClick={handleGenerateImage}
                            disabled={isImageGenerating || isUploading}
                            className="p-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-brand-mutedBlue/10 text-brand-mutedBlue transition-colors disabled:opacity-50"
                        >
                            <Sparkles className={`w-4 h-4 ${isImageGenerating ? 'animate-spin' : ''}`} />
                            {isImageGenerating ? 'AI가 그리는 중...' : 'AI 그림 생성'}
                        </button>

                        <button className="p-2.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => updateContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="글을 작성하거나, 음성 입력을 통해 생각을 기록해 보세요..."
                        className="w-full flex-1 resize-none bg-transparent border-none outline-none text-lg md:text-xl font-sans font-light leading-relaxed placeholder:text-muted-foreground/50 focus:ring-0 text-foreground custom-scrollbar"
                    />
                </div>

                {/* AI Assistant Side Panel */}
                <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 border-l border-border/40 pl-0 lg:pl-8">

                    {/* AI Suggested Titles */}
                    {suggestedTitles.length > 0 && (
                        <div className="bg-brand-mutedBlue/10 border border-brand-mutedBlue/30 rounded-[1.5rem] p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-brand-deepNavy dark:text-brand-mutedBlue" />
                                <h3 className="font-bold text-foreground">AI 추천 제목</h3>
                            </div>
                            <div className="space-y-2">
                                {suggestedTitles.map((t, idx) => {
                                    const cleanTitle = t.replace(/^\d+\.\s*/, '').replace(/["'*]/g, '');
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => { setTitle(cleanTitle); setSuggestedTitles([]); }}
                                            className="w-full text-left p-3 text-sm font-medium rounded-xl bg-card hover:bg-accent border border-border/50 hover:border-brand-mutedBlue/30 transition-all text-foreground shadow-sm"
                                        >
                                            {cleanTitle}
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={() => setSuggestedTitles([])} className="w-full mt-4 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                                닫기
                            </button>
                        </div>
                    )}

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
                                onClick={() => handleToneChange('generate_article')}
                                className="w-full p-3 flex flex-col items-start gap-1 rounded-xl bg-brand-mutedBlue/10 hover:bg-brand-mutedBlue/20 border border-brand-mutedBlue/30 hover:border-brand-mutedBlue/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed mb-2 shadow-sm"
                            >
                                <span className="text-sm font-bold text-brand-deepNavy dark:text-brand-mutedBlue flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    아이디어로 기사 자동 작성
                                </span>
                                <span className="text-xs text-muted-foreground">간단한 메모만으로 완성된 뉴스 기사를 생성합니다</span>
                            </button>
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
                                onClick={() => handleToneChange('expand')}
                                className="w-full p-3 flex flex-col items-start gap-1 rounded-xl hover:bg-accent border border-transparent hover:border-border/60 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-sm font-semibold text-foreground group-hover:text-brand-mutedBlue">본문 내용 확장하기</span>
                                <span className="text-xs text-muted-foreground">논리를 보강하여 글 분량을 2배로 확장</span>
                            </button>
                            <button
                                disabled={isAiProcessing || !content}
                                onClick={() => handleToneChange('proofread')}
                                className="w-full p-3 flex flex-col items-start gap-1 rounded-xl hover:bg-accent border border-transparent hover:border-border/60 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-sm font-semibold text-foreground group-hover:text-brand-mutedBlue">문법 및 맞춤법 교정</span>
                                <span className="text-xs text-muted-foreground">오탈자와 띄어쓰기를 완벽하게 교정</span>
                            </button>
                            <button
                                disabled={isAiProcessing || !content}
                                onClick={() => handleToneChange('search_data')}
                                className="w-full p-3 flex flex-col items-start gap-1 rounded-xl hover:bg-accent border border-transparent hover:border-border/60 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-sm font-semibold text-foreground group-hover:text-brand-mutedBlue">데이터 포인트 검색</span>
                                <span className="text-xs text-muted-foreground">글의 신뢰도를 높여줄 최신 통계 추가</span>
                            </button>
                            <button
                                disabled={isAiProcessing || !content}
                                onClick={() => handleToneChange('suggest_title')}
                                className="w-full p-3 flex flex-col items-start gap-1 rounded-xl hover:bg-accent border border-transparent hover:border-border/60 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-sm font-semibold text-foreground group-hover:text-brand-mutedBlue">제목 추천받기</span>
                                <span className="text-xs text-muted-foreground">시선을 끄는 매력적인 제목 5가지</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function AIEditor() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">에디터 불러오는 중...</div>}>
            <EditorContent />
        </Suspense>
    );
}
