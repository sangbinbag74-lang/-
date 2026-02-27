import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSettings } from '@/app/admin/settings/actions';

export default async function AboutPage() {
    const settings = await getSettings();

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

            <header className="mb-12 border-b border-border/50 pb-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-brand-deepNavy dark:text-foreground tracking-tight mb-4">
                    소개.
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl">
                    어떤 분들이 이 공간을 만들어 가고 있는지 소개합니다.
                </p>
            </header>

            <div className="max-w-4xl mx-auto rounded-3xl border border-border/50 bg-card shadow-sm p-8 md:p-12 overflow-hidden">
                <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-h1:text-brand-deepNavy dark:prose-h1:text-foreground prose-h2:text-brand-deepNavy dark:prose-h2:text-foreground prose-a:text-brand-mutedBlue prose-img:rounded-xl">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {settings.aboutContent}
                    </ReactMarkdown>
                </article>
            </div>
        </div>
    );
}
