import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/app/admin/settings/actions';

export default async function Home() {
  const supabase = createClient();
  const settings = await getSettings();

  const { data: allPosts } = await supabase
    .from('posts')
    .select('*')
    .in('status', ['published', '발행됨'])
    .neq('slug', 'system-settings') // Hide settings post
    .order('created_at', { ascending: false })
    .limit(30);

  // Filter posts into categories based on slug prefix
  const rawPosts = allPosts || [];
  const shorts = rawPosts.filter(p => p.slug?.startsWith('short-')).slice(0, 5);
  const articles = rawPosts.filter(p => !p.slug?.startsWith('short-'));

  // Use pinned featured post if set, otherwise default to latest article
  const featuredPostId = settings.featuredPostId;
  const featuredPost = featuredPostId ? articles.find(p => p.id === featuredPostId) : null;
  const mainPost = featuredPost || articles[0];

  // remaining articles excluding what's in hero
  const otherArticles = articles.filter(p => p.id !== mainPost?.id);
  const standardPost1 = otherArticles[0];
  const standardPost2 = otherArticles[1];

  const getExcerpt = (post: { summary?: string; content?: string }, length: number) => {
    const text = post.summary || post.content || '';
    return text
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/!\[.*/g, '')
      .replace(/[#*`~>]/g, '')
      .trim()
      .substring(0, length);
  };

  const getFirstImage = (content?: string) => {
    if (!content) return null;
    const match = content.match(/!\[.*?\]\((.*?)\)/);
    return match ? match[1] : null;
  };

  return (
    <div className="container mx-auto max-w-screen-xl px-4 lg:px-8 py-8 md:py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Date & Greeting */}
      <section className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-deepNavy dark:text-foreground tracking-tight">
          {settings.homeGreeting}
        </h1>
        <p className="text-muted-foreground text-lg">
          {settings.homeDescription}
        </p>
      </section>

      {/* Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
        {/* Main Feature - 2x2 */}
        {mainPost ? (
          <Link href={`/posts/${mainPost.slug || mainPost.id}`} className="group col-span-1 md:col-span-2 row-span-2 rounded-[2rem] overflow-hidden relative border border-border/50 bg-card text-card-foreground shadow-sm hover:shadow-md transition-all">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-90"></div>

            {/* Decorative background representing an image */}
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 group-hover:scale-105 transition-transform duration-700">
              {getFirstImage(mainPost.content) ? (
                <img src={getFirstImage(mainPost.content)!} alt="" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-mutedBlue/30 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen"></div>
                  <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-brand-deepNavy/20 rounded-full blur-2xl mix-blend-multiply dark:mix-blend-screen"></div>
                </>
              )}
            </div>

            <div className="absolute bottom-0 left-0 p-8 md:p-10 z-20 space-y-4 w-full md:w-4/5">
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/10">최신 인사이트</span>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-white group-hover:text-white/90 transition-colors drop-shadow-sm">
                {mainPost.title}
              </h2>
              <p className="text-gray-200 line-clamp-2 md:text-lg font-light leading-relaxed">
                {getExcerpt(mainPost, 150)}
              </p>
              <div className="text-sm text-gray-300 font-medium">에디터 작성 • {new Date(mainPost.created_at).toLocaleDateString('ko-KR')}</div>
            </div>
          </Link>
        ) : (
          <div className="group col-span-1 md:col-span-2 row-span-2 rounded-[2rem] border border-border/50 bg-card p-10 flex items-center justify-center text-muted-foreground">
            아직 발행된 첫 번째 글이 없습니다.
          </div>
        )}

        {/* Short Thought - 1x2 */}
        <div className="col-span-1 row-span-2 rounded-[2rem] border border-border/50 bg-card p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-foreground">최근 단상</h3>
            <Link href="/shorts" className="text-brand-mutedBlue text-sm hover:underline font-medium">모두 보기</Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
            {shorts.length > 0 ? shorts.map((post) => (
              <Link href={`/posts/${post.slug || post.id}`} key={post.id} className="block group cursor-pointer space-y-2 pb-5 border-b border-border/40 last:border-0">
                <p className="text-sm text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed line-clamp-3">
                  &quot;{getExcerpt(post, 100)}...&quot;
                </p>
                <div className="text-xs text-muted-foreground font-medium">{new Date(post.created_at).toLocaleDateString('ko-KR')}</div>
              </Link>
            )) : (
              <div className="text-sm text-muted-foreground pt-4">최근 글이 없습니다.</div>
            )}
          </div>
        </div>

        {/* Standard Card 1 - 1x1 */}
        {standardPost1 && (
          <Link href={`/posts/${standardPost1.slug || standardPost1.id}`} className="group col-span-1 row-span-1 rounded-[2rem] border border-border/50 bg-card p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
            {getFirstImage(standardPost1.content) && (
              <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <img src={getFirstImage(standardPost1.content)!} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-3 relative z-10">
              <span className="text-xs font-semibold text-brand-mutedBlue tracking-wide uppercase">인사이트</span>
              <h3 className="font-bold text-xl font-serif leading-tight group-hover:text-brand-mutedBlue transition-colors text-foreground line-clamp-2">
                {standardPost1.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {getExcerpt(standardPost1, 100)}
              </p>
            </div>
            <div className="text-xs text-muted-foreground mt-4 font-medium">{new Date(standardPost1.created_at).toLocaleDateString('ko-KR')}</div>
          </Link>
        )}

        {/* Standard Card 2 (High Contrast) - 1x1 */}
        {standardPost2 && (
          <Link href={`/posts/${standardPost2.slug || standardPost2.id}`} className="group col-span-1 row-span-1 rounded-[2rem] border border-transparent p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between bg-brand-charcoal text-white dark:bg-card dark:border-border/50 dark:text-card-foreground relative overflow-hidden">
            {getFirstImage(standardPost2.content) && (
              <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity mix-blend-screen">
                <img src={getFirstImage(standardPost2.content)!} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-3 relative z-10">
              <span className="text-xs font-semibold text-gray-400 dark:text-brand-mutedBlue tracking-wide uppercase">인사이트</span>
              <h3 className="font-bold text-xl font-serif leading-tight group-hover:text-gray-200 dark:group-hover:text-brand-mutedBlue transition-colors line-clamp-2">
                {standardPost2.title}
              </h3>
              <p className="text-sm text-gray-300 dark:text-muted-foreground line-clamp-2">
                {getExcerpt(standardPost2, 100)}
              </p>
            </div>
            <div className="text-xs text-gray-400 dark:text-muted-foreground mt-4 font-medium">{new Date(standardPost2.created_at).toLocaleDateString('ko-KR')}</div>
          </Link>
        )}
      </section>
    </div>
  );
}
