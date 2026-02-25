import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 lg:px-8 py-8 md:py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Date & Greeting */}
      <section className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-deepNavy dark:text-foreground tracking-tight">
          좋은 아침입니다.
        </h1>
        <p className="text-muted-foreground text-lg">
          오늘의 프라이빗 브리핑을 전해드립니다.
        </p>
      </section>

      {/* Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
        {/* Main Feature - 2x2 */}
        <Link href="/posts/1" className="group col-span-1 md:col-span-2 row-span-2 rounded-[2rem] overflow-hidden relative border border-border/50 bg-card text-card-foreground shadow-sm hover:shadow-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-90"></div>

          {/* Decorative background representing an image */}
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 group-hover:scale-105 transition-transform duration-700">
            {/* Abstract shapes as placeholder image */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-mutedBlue/30 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-brand-deepNavy/20 rounded-full blur-2xl mix-blend-multiply dark:mix-blend-screen"></div>
          </div>

          <div className="absolute bottom-0 left-0 p-8 md:p-10 z-20 space-y-4 w-full md:w-4/5">
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/10">인사이트</span>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-white group-hover:text-white/90 transition-colors drop-shadow-sm">
              개인 미디어에서 AI의 진화: 스토리텔링의 새로운 시대
            </h2>
            <p className="text-gray-200 line-clamp-2 md:text-lg font-light leading-relaxed">
              인공지능이 계속 발전함에 따라, 개인이 뉴스를 소비하고 창작하는 방식에 거대한 변화가 일어나고 있습니다. 기존의 경계가 무너지고 있습니다.
            </p>
            <div className="text-sm text-gray-300 font-medium">에디터 작성 • 읽는 시간 5분</div>
          </div>
        </Link>

        {/* Short Thought - 1x2 */}
        <div className="col-span-1 row-span-2 rounded-[2rem] border border-border/50 bg-card p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-foreground">최근 단상</h3>
            <Link href="/shorts" className="text-brand-mutedBlue text-sm hover:underline font-medium">모두 보기</Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group cursor-pointer space-y-2 pb-5 border-b border-border/40 last:border-0">
                <p className="text-sm text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed">
                  &quot;디지털 시대의 가장 중요한 자산은 데이터가 아니라 주의력입니다. 이를 어떻게 선별하느냐가 우리의 지성을 정의합니다.&quot;
                </p>
                <div className="text-xs text-muted-foreground font-medium">2시간 전</div>
              </div>
            ))}
          </div>
        </div>

        {/* Standard Card 1 - 1x1 */}
        <Link href="/posts/2" className="group col-span-1 row-span-1 rounded-[2rem] border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-brand-mutedBlue tracking-wide uppercase">기술 & 사회</span>
            <h3 className="font-bold text-xl font-serif leading-tight group-hover:text-brand-mutedBlue transition-colors text-foreground">
              공간 컴퓨팅: 고글 그 너머로
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              인터페이스의 미래가 단순히 헤드셋을 쓰는 것이 아니라, 우리의 물리적 환경을 어떻게 재정의하는지에 대하여.
            </p>
          </div>
          <div className="text-xs text-muted-foreground mt-4 font-medium">어제 • 읽는 시간 3분</div>
        </Link>

        {/* Standard Card 2 (High Contrast) - 1x1 */}
        <Link href="/posts/3" className="group col-span-1 row-span-1 rounded-[2rem] border border-transparent p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between bg-brand-charcoal text-white dark:bg-card dark:border-border/50 dark:text-card-foreground">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-gray-400 dark:text-brand-mutedBlue tracking-wide uppercase">경제</span>
            <h3 className="font-bold text-xl font-serif leading-tight group-hover:text-gray-200 dark:group-hover:text-brand-mutedBlue transition-colors">
              금리 인상 이후 시대의 시장 변화
            </h3>
            <p className="text-sm text-gray-300 dark:text-muted-foreground line-clamp-2">
              지속적인 인플레이션 압력이 벤처 캐피탈을 어떻게 재편하고 있는지에 대한 심층 분석.
            </p>
          </div>
          <div className="text-xs text-gray-400 dark:text-muted-foreground mt-4 font-medium">2024년 10월 24일 • 읽는 시간 7분</div>
        </Link>
      </section>
    </div>
  );
}
