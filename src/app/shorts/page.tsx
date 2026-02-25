import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ShortsPage() {
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
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="rounded-[2rem] border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <p className="text-lg text-foreground leading-relaxed mb-6 italic font-serif">
                            &quot;디지털 시대의 가장 중요한 자산은 데이터가 아니라 주의력입니다. 이를 어떻게 선별하느냐가 우리의 지성을 정의합니다.&quot;
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="font-medium">{i * 2}시간 전</span>
                            <span>작성자: 에디터</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
