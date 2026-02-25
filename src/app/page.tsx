import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto max-w-screen-xl px-4 lg:px-8 py-8 md:py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Date & Greeting */}
      <section className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-deepNavy dark:text-foreground tracking-tight">
          Good Morning.
        </h1>
        <p className="text-muted-foreground text-lg">
          Here is your private briefing for today.
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
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/10">Insight</span>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-white group-hover:text-white/90 transition-colors drop-shadow-sm">
              The Evolution of AI in Personal Media: A New Era of Storytelling
            </h2>
            <p className="text-gray-200 line-clamp-2 md:text-lg font-light leading-relaxed">
              As artificial intelligence continues to advance, we are seeing a massive shift in how individuals consume and create news. The boundaries are blurring.
            </p>
            <div className="text-sm text-gray-300 font-medium">By The Editor • 5 min read</div>
          </div>
        </Link>

        {/* Short Thought - 1x2 */}
        <div className="col-span-1 row-span-2 rounded-[2rem] border border-border/50 bg-card p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-foreground">Recent Shorts</h3>
            <Link href="/shorts" className="text-brand-mutedBlue text-sm hover:underline font-medium">View all</Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group cursor-pointer space-y-2 pb-5 border-b border-border/40 last:border-0">
                <p className="text-sm text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed">
                  &quot;The most important asset in the digital age is not data, but attention. How we curate it defines our intellect.&quot;
                </p>
                <div className="text-xs text-muted-foreground font-medium">2 hours ago</div>
              </div>
            ))}
          </div>
        </div>

        {/* Standard Card 1 - 1x1 */}
        <Link href="/posts/2" className="group col-span-1 row-span-1 rounded-[2rem] border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-brand-mutedBlue tracking-wide uppercase">Tech & Society</span>
            <h3 className="font-bold text-xl font-serif leading-tight group-hover:text-brand-mutedBlue transition-colors text-foreground">
              Spatial Computing: Beyond the Goggles
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              Why the future of interfaces isn&apos;t just about wearing a headset, but redefining our physical environment.
            </p>
          </div>
          <div className="text-xs text-muted-foreground mt-4 font-medium">Yesterday • 3 min read</div>
        </Link>

        {/* Standard Card 2 (High Contrast) - 1x1 */}
        <Link href="/posts/3" className="group col-span-1 row-span-1 rounded-[2rem] border border-transparent p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between bg-brand-charcoal text-white dark:bg-card dark:border-border/50 dark:text-card-foreground">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-gray-400 dark:text-brand-mutedBlue tracking-wide uppercase">Economy</span>
            <h3 className="font-bold text-xl font-serif leading-tight group-hover:text-gray-200 dark:group-hover:text-brand-mutedBlue transition-colors">
              Market Shifts in the Post-Interest Rate Hike Era
            </h3>
            <p className="text-sm text-gray-300 dark:text-muted-foreground line-clamp-2">
              An analysis of how continuous inflation pressures are reshaping venture capital.
            </p>
          </div>
          <div className="text-xs text-gray-400 dark:text-muted-foreground mt-4 font-medium">Oct 24, 2024 • 7 min read</div>
        </Link>
      </section>
    </div>
  );
}
