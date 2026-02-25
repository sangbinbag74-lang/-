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
                    비공개 브리핑 목록으로
                </Link>
            </nav>

            {/* Header */}
            <header className="space-y-6 mb-12">
                <div className="flex items-center gap-3 text-xs md:text-sm text-brand-mutedBlue font-bold tracking-widest uppercase">
                    <span>테크놀로지</span>
                    <span className="opacity-50">•</span>
                    <span className="flex items-center"><Clock className="mr-1.5 h-3.5 w-3.5" /> 읽는 시간 5분</span>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-[1.15] tracking-tight text-balance">
                    개인 미디어에서 AI의 진화: 스토리텔링의 새로운 시대
                </h1>

                <div className="flex items-center justify-between py-8 border-b border-border/60">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-brand-deepNavy dark:bg-brand-mutedBlue/20 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            에
                        </div>
                        <div>
                            <p className="text-base font-semibold text-foreground tracking-tight">발행인: 담당 에디터</p>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <Calendar className="mr-1.5 h-3.5 w-3.5" /> 2024년 10월 24일
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
                        <h3 className="font-bold text-lg tracking-tight">AI 3줄 요약</h3>
                    </div>
                    <ul className="space-y-4 text-foreground/80 list-none text-lg md:text-xl font-medium leading-relaxed">
                        <li className="flex items-start">
                            <span className="mr-3 text-brand-mutedBlue">1.</span>
                            <span>AI는 우리가 매일 뉴스를 큐레이팅하고 소비하는 방식을 근본적으로 바꾸고 있습니다.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 text-brand-mutedBlue">2.</span>
                            <span>개인화된 브리핑이 복잡한 주제를 깔끔하게 요약함으로써 기존의 추천 알고리즘을 대체합니다.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-3 text-brand-mutedBlue">3.</span>
                            <span>이에 따라 저자의 역할은 단순한 작가에서 AI 결과물의 최고 에디터 겸 디렉터로 변화하고 있습니다.</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Body Content */}
            <div className="space-y-8 text-lg md:text-xl text-foreground/90 leading-loose font-sans font-light">
                <p className="text-xl md:text-2xl text-foreground font-normal leading-relaxed text-balance">
                    수십 년 동안 우리가 뉴스를 접하던 표준적인 방식은 편집된 홈페이지나 인쇄된 지면의 1면을 통하는 것이었습니다. 오늘날의 1면은 오직 당신만을 위해 생성되며, 당신에게 허락된 시간이 얼마나 되는지 정확히 이해하고 있습니다.
                </p>

                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-12 mb-6 tracking-tight">저술 방식의 패러다임 변화</h2>
                <p>
                    미디어 산업에서의 AI 발전 중 가장 흥미로운 측면은 저술의 정의가 변화하고 있다는 점입니다. 과연 기사의 초안을 AI가 작성하더라도, 인간이 명확한 프롬프트를 제공하고 어조를 수정하여 발행했다면 이 글의 작성자는 누구의 이름으로 올라가야 할까요?
                </p>

                <p>
                    우리는 모든 단어를 직접 써내려가던 세상에서 지능형 비서를 통제하는 세상으로 나아가고 있습니다. 인간은 이제 자신의 생각과 아이디어의 방향을 지시하는 &apos;편집장&apos; 역할을 하게 됩니다.
                </p>

                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-12 mb-6 tracking-tight">벤토 그리드(Bento Grid)가 효과적인 이유</h2>
                <p>
                    오늘 대시보드에서 새로운 레이아웃을 눈치채셨을 것입니다. 일본의 도시락(Bento) 상자에서 영감을 받은 이 형태는 사용자에게 시각적 압박감을 주지 않으면서도 다양한 주제의 정보를 나란히 배치할 수 있어 AI 요약본에 아주 잘 들어맞습니다.
                </p>

                <blockquote className="my-10 pl-6 border-l-4 border-brand-mutedBlue/50 text-2xl font-serif italic text-foreground tracking-tight text-balance">
                    &quot;무한한 콘텐츠의 시대, 우리 모두에게 최고의 럭셔리는 곧 &apos;간결함&apos;입니다.&quot;
                </blockquote>

                <p>
                    단순한 노이즈를 제거하고 순수한 본질(Signal)에만 집중하는 이러한 독자 중심 철학을 앞으로 더 많은 플랫폼에서 채택하게 될 것입니다.
                </p>
            </div>

        </article>
    );
}
