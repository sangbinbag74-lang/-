import Link from 'next/link';
import { ArrowLeft, Sparkles, Clock, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function PostPage({ params }: { params: { slug: string } }) {
    const supabase = createClient();
    const { data: post } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', params.slug)
        .single();

    if (!post) {
        notFound();
    }

    // Determine read time (rough estimate: 500 characters per minute)
    const readTime = Math.max(1, Math.ceil(post.content.length / 500));

    return (
        <article className="container mx-auto px-4 py-8 md:py-16 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Navigation */}
            <nav className="mb-10 md:mb-16">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="p-2 rounded-full border border-border/50 bg-card group-hover:bg-accent mr-3 transition-colors">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    </div>
                    포워드 익산 목록으로
                </Link>
            </nav>

            {/* Header */}
            <header className="space-y-6 mb-12">
                <div className="flex items-center gap-3 text-xs md:text-sm text-brand-mutedBlue font-bold tracking-widest uppercase">
                    <span>인사이트</span>
                    <span className="opacity-50">•</span>
                    <span className="flex items-center"><Clock className="mr-1.5 h-3.5 w-3.5" /> 읽는 시간 {readTime}분</span>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-[1.15] tracking-tight text-balance whitespace-pre-line">
                    {post.title}
                </h1>

                <div className="flex items-center justify-between py-8 border-b border-border/60">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-brand-deepNavy dark:bg-brand-mutedBlue/20 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            {(post.author || '에').substring(0, 1)}
                        </div>
                        <div>
                            <p className="text-base font-semibold text-foreground tracking-tight">발행인: {post.author || '담당 에디터'}</p>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <Calendar className="mr-1.5 h-3.5 w-3.5" /> {new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {post.summary && (
                <section className="mb-14 rounded-[2rem] bg-gradient-to-br from-brand-mutedBlue/10 to-transparent dark:from-brand-mutedBlue/10 dark:to-transparent border border-brand-mutedBlue/20 p-8 md:p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
                        <Sparkles className="w-32 h-32 text-brand-mutedBlue" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2.5 mb-5 text-brand-mutedBlue">
                            <Sparkles className="h-5 w-5" />
                            <h3 className="font-bold text-lg tracking-tight">AI 요약</h3>
                        </div>
                        <div className="text-foreground/80 text-lg md:text-xl font-medium leading-relaxed">
                            {post.summary}
                        </div>
                    </div>
                </section>
            )}

            {/* Body Content */}
            <div className="space-y-8 text-lg md:text-xl text-foreground/90 leading-loose font-sans font-light whitespace-pre-wrap">
                {post.content}
            </div>

        </article>
    );
}
