import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from '@/lib/supabase/server';

export default async function ShortsPage() {
    const supabase = createClient();

    // Fetch recent posts that could act as shorts
    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .in('status', ['published', '발행됨'])
        .order('created_at', { ascending: false })
        .limit(20);

    return (
        <div className="container mx-auto max-w-screen-xl px-4 lg:px-8 py-8 md:py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <nav className="mb-10 md:mb-16">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="p-2 rounded-full border border-border/50 bg-card group-hover:bg-accent mr-3 transition-colors">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    </div>
                    포워드 익산 홈으로
                </Link>
            </nav>

            <header className="mb-12">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-deepNavy dark:text-foreground tracking-tight mb-4">
                    최근 단상
                </h1>
                <p className="text-muted-foreground text-lg">
                    짧지만 깊이 있는 생각의 조각들을 모았습니다.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts && posts.length > 0 ? posts.map((post) => (
                    <Link href={`/posts/${post.slug}`} key={post.id} className="rounded-[2rem] border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                        <p className="text-lg text-foreground leading-relaxed mb-6 italic font-serif group-hover:text-brand-mutedBlue transition-colors line-clamp-4">
                            &quot;{post.summary || post.content.substring(0, 150)}...&quot;
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="font-medium">{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                            <span>작성자: {post.author || '에디터'}</span>
                        </div>
                    </Link>
                )) : (
                    <div className="col-span-full text-center py-20 text-muted-foreground">
                        아직 작성된 단상이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
