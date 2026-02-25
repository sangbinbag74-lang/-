import Link from 'next/link';
import { ArrowLeft, Sparkles, Clock, Calendar } from 'lucide-react';

export default function PostPage() {
    // In a real app, fetch post by params.slug (removed params to fix lint)
    return (
        <article className="container mx-auto px-4 py-8 md:py-16 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Navigation */}
            <nav className="mb-10 md:mb-16">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="p-2 rounded-full border border-border/50 bg-card group-hover:bg-accent mr-3 transition-colors">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    </div>
                    Back to Briefing
                </Link>
            </nav>

            {/* Header */}
            <header className="space-y-6 mb-12">
                <div className="flex items-center gap-3 text-xs md:text-sm text-brand-mutedBlue font-bold tracking-widest uppercase">
                    <span>Technology</span>
                    <span className="opacity-50">•</span>
                    <span className="flex items-center"><Clock className="mr-1.5 h-3.5 w-3.5" /> 5 min read</span>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-[1.15] tracking-tight text-balance">
                    The Evolution of AI in Personal Media: A New Era of Storytelling
                </h1>

                <div className="flex items-center justify-between py-8 border-b border-border/60">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-brand-deepNavy dark:bg-brand-mutedBlue/20 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            E
                        </div>
                        <div>
                            <p className="text-base font-semibold text-foreground tracking-tight">The Editor</p>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <Calendar className="mr-1.5 h-3.5 w-3.5" /> Oct 24, 2024
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* AI Summary Box */}
            <section className="mb-14 rounded-[2rem] bg-gradient-to-br from-brand-mutedBlue/10 to-transparent dark:from-brand-mutedBlue/10 dark:to-transparent border border-brand-mutedBlue/20 p-8 md:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
                    <Sparkles className="w-32 h-32 text-brand-mutedBlue" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2.5 mb-5 text-brand-mutedBlue">
                        <Sparkles className="h-5 w-5" />
                        <h3 className="font-bold text-lg tracking-tight">AI 3-Line Summary</h3>
                    </div>
                    <ul className="space-y-4 text-foreground/80 list-none text-lg md:text-xl font-medium leading-relaxed">
                        <li className="flex items-start">
                            <span className="mr-3 text-brand-mutedBlue">1.</span>
                            <span>AI is fundamentally changing how we curate and consume daily news.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 text-brand-mutedBlue">2.</span>
                            <span>Personalized briefers replace traditional algorithms by summarizing complex topics.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 text-brand-mutedBlue">3.</span>
                            <span>The role of the author shifts from writer to editor and director of AI outputs.</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Body Content */}
            <div className="space-y-8 text-lg md:text-xl text-foreground/90 leading-loose font-sans font-light">
                <p className="text-xl md:text-2xl text-foreground font-normal leading-relaxed text-balance">
                    For decades, the standard way we interacted with the news was through a curated homepage or a printed front page. Today, the front page is generated specifically for you, and it understands exactly how much time you have.
                </p>

                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-12 mb-6 tracking-tight">The Shift in Authorship</h2>
                <p>
                    The most interesting aspect of AI in personal media is the changing definition of authorship. If an AI drafted this article, but a human provided the prompt, edited the tone, and published it... whose byline goes on the piece?
                </p>

                <p>
                    We are moving from a world where we write every single word, to a world where we direct an intelligent assistant. The human becomes the editor-in-chief of their own thoughts.
                </p>

                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-12 mb-6 tracking-tight">Why Bento Grids Work</h2>
                <p>
                    You might have noticed the new layout of our dashboard. This &quot;Bento Grid&quot; approach—named after the Japanese lunchbox—works perfectly for AI summaries because it allows us to present distinct, highly condensed pieces of information side-by-side without overwhelming the user.
                </p>

                <blockquote className="my-10 pl-6 border-l-4 border-brand-mutedBlue/50 text-2xl font-serif italic text-foreground tracking-tight text-balance">
                    &quot;In an age of infinite content, the ultimate luxury is brevity.&quot;
                </blockquote>

                <p>
                    Expect to see more platforms adopt this reader-centric philosophy, stripping away the noise and focusing purely on signal.
                </p>
            </div>

        </article>
    );
}
