import Link from 'next/link';
import { Search, Tag, ArrowRight } from 'lucide-react';

export default function ArchivePage() {
    const tags = ["Technology", "Economy", "Culture", "AI", "Design", "Opinion"];

    const posts = [
        {
            id: 1,
            title: "The Evolution of AI in Personal Media",
            tag: "Technology",
            date: "Oct 24, 2024",
            excerpt: "As artificial intelligence continues to advance, we are seeing a massive shift in how individuals consume and create news."
        },
        {
            id: 2,
            title: "Spatial Computing: Beyond the Goggles",
            tag: "Design",
            date: "Oct 23, 2024",
            excerpt: "Why the future of interfaces isn't just about wearing a headset, but redefining our physical environment."
        },
        {
            id: 3,
            title: "Market Shifts in the Post-Interest Rate Hike Era",
            tag: "Economy",
            date: "Oct 22, 2024",
            excerpt: "An analysis of how continuous inflation pressures are reshaping venture capital."
        }
    ];

    return (
        <div className="container mx-auto max-w-screen-xl px-4 lg:px-8 py-8 md:py-16 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header & Search */}
            <section className="space-y-6 max-w-3xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground tracking-tight">
                    Archive.
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl">
                    Search through past briefings, thoughts, and deep dives.
                </p>

                <div className="relative group pt-4">
                    <div className="absolute inset-y-0 mt-4 left-0 pl-5 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-brand-deepNavy dark:group-focus-within:text-foreground transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by keyword, title, or topic..."
                        className="w-full pl-14 pr-6 py-4 md:py-5 bg-card border border-border rounded-[1.5rem] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-deepNavy/20 dark:focus:ring-white/20 transition-all shadow-sm text-base md:text-lg"
                    />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map(tag => (
                        <button key={tag} className="inline-flex items-center rounded-full border border-border/60 bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-brand-mutedBlue/10 hover:text-brand-deepNavy dark:hover:text-white transition-colors">
                            <Tag className="mr-1.5 h-3.5 w-3.5 opacity-70" />
                            {tag}
                        </button>
                    ))}
                </div>
            </section>

            {/* Results / List */}
            <section className="space-y-8 max-w-4xl">
                <h2 className="text-xl md:text-2xl font-bold border-b border-border/60 pb-4 text-foreground">
                    Latest Posts
                </h2>

                <div className="grid gap-6">
                    {posts.map(post => (
                        <Link key={post.id} href={`/posts/${post.id}`} className="group block p-6 md:p-8 rounded-[2rem] border border-border/50 bg-card hover:shadow-md hover:border-border transition-all">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="space-y-3 md:w-4/5">
                                    <div className="flex items-center gap-3 text-xs md:text-sm">
                                        <span className="font-semibold text-brand-mutedBlue uppercase tracking-wide">{post.tag}</span>
                                        <span className="text-muted-foreground">•</span>
                                        <span className="text-muted-foreground">{post.date}</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground group-hover:text-brand-mutedBlue transition-colors leading-tight">
                                        {post.title}
                                    </h3>
                                    <p className="text-base md:text-lg text-muted-foreground line-clamp-2 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                </div>
                                <div className="md:mt-4 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground group-hover:bg-brand-deepNavy group-hover:text-white dark:group-hover:bg-brand-mutedBlue transition-colors">
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
