import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function ArchivePage() {
    const supabase = createClient();

    const { data: allPosts } = await supabase
        .from('posts')
        .select('*')
        .in('status', ['published', '발행됨'])
        .neq('slug', 'system-settings')
        .order('created_at', { ascending: false });

    // Filter to only include articles (slug does not start with short-)
    const posts = (allPosts || []).filter(p => !p.slug?.startsWith('short-'));

    return (
        <div className="container mx-auto max-w-screen-xl px-4 lg:px-8 py-8 md:py-16 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header & Search */}
            <section className="space-y-6 max-w-3xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground tracking-tight">
                    기사 (Articles)
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl">
                    모든 기사와 분석, 리포트를 모아봅니다.
                </p>

                <div className="relative group pt-4">
                    <div className="absolute inset-y-0 mt-4 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-brand-deepNavy dark:group-focus-within:text-foreground transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="키워드나 제목으로 검색..."
                        className="w-full pl-14 pr-6 py-4 md:py-5 bg-card border border-border rounded-[1.5rem] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-deepNavy/20 dark:focus:ring-white/20 transition-all shadow-sm text-base md:text-lg"
                    />
                </div>
            </section>

            {/* Results / List */}
            <section className="space-y-8 max-w-4xl">
                <h2 className="text-xl md:text-2xl font-bold border-b border-border/60 pb-4 text-foreground">
                    최근 작성된 기사
                </h2>

                <div className="grid gap-6">
                    {posts.length > 0 ? posts.map(post => (
                        <Link key={post.id} href={`/posts/${post.slug}`} className="group block p-6 md:p-8 rounded-[2rem] border border-border/50 bg-card hover:shadow-md hover:border-border transition-all">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="space-y-3 md:w-4/5">
                                    <div className="flex items-center gap-3 text-xs md:text-sm">
                                        <span className="font-semibold text-brand-mutedBlue uppercase tracking-wide">INSIGHT</span>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="text-muted-foreground">{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground group-hover:text-brand-mutedBlue transition-colors leading-tight">
                                        {post.title}
                                    </h3>
                                    <p className="text-base md:text-lg text-muted-foreground line-clamp-2 leading-relaxed">
                                        {post.summary || post.content.replace(/[#*`~>]/g, '').substring(0, 150)}
                                    </p>
                                </div>
                                <div className="md:mt-4 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground group-hover:bg-brand-deepNavy group-hover:text-white dark:group-hover:bg-brand-mutedBlue transition-colors">
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="text-center py-20 text-muted-foreground">
                            아직 작성된 기사가 없습니다.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
