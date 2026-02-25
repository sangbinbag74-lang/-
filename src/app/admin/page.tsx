import Link from "next/link";
import { BarChart3, Users, FileText, MousePointerClick, Plus, Settings, ArrowUpRight, LogOut } from "lucide-react";
import { logout } from '@/app/login/actions'

export default function AdminDashboard() {
    const stats = [
        { title: "총 조회수", value: "124,592", change: "+12.5%", trend: "up", icon: BarChart3 },
        { title: "순 방문자", value: "45,231", change: "+8.2%", trend: "up", icon: Users },
        { title: "발행된 글", value: "142", change: "이번 주 +3", trend: "neutral", icon: FileText },
        { title: "클릭률", value: "24.3%", change: "-1.1%", trend: "down", icon: MousePointerClick },
    ];

    const recentPosts = [
        { id: 1, title: "개인 미디어에서 AI의 진화: 스토리텔링의 새로운 시대", views: "12.4k", date: "오늘", status: "발행됨" },
        { id: 2, title: "공간 컴퓨팅: 고글 그 너머로", views: "8.2k", date: "어제", status: "발행됨" },
        { id: 3, title: "금리 인상 이후 시대의 시장 변화", views: "15.1k", date: "2일 전", status: "발행됨" },
        { id: 4, title: "초안: 2025년 웹 디자인 미학", views: "-", date: "-", status: "초안" },
    ];

    return (
        <div className="container mx-auto max-w-screen-xl px-4 lg:px-8 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-foreground tracking-tight">관리자 대시보드</h1>
                    <p className="text-muted-foreground mt-1 text-sm">환영합니다, 에디터님. 플랫폼 요약 정보입니다.</p>
                </div>
                <div className="flex items-center gap-3">
                    <form action={logout}>
                        <button className="p-2 border border-border/60 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-colors" title="로그아웃">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </form>
                    <Link href="/admin/settings" className="p-2 border border-border/60 rounded-lg text-muted-foreground hover:bg-accent transition-colors" title="설정">
                        <Settings className="w-5 h-5" />
                    </Link>
                    <Link href="/admin/editor" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-brand-deepNavy dark:bg-foreground text-white dark:text-background hover:opacity-90 h-10 px-5 py-2 shadow-sm font-semibold">
                        <Plus className="mr-2 h-4 w-4" /> 새 글 쓰기
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                <div className="p-2 rounded-lg bg-brand-mutedBlue/10 text-brand-mutedBlue">
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                                <p className={`text-xs font-medium flex items-center ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                                    stat.trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                                    }`}>
                                    {stat.trend === 'up' && <ArrowUpRight className="mr-1 h-3 w-3" />}
                                    {stat.change}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="grid gap-6 lg:grid-cols-3">

                {/* Recent Posts List - spans 2 cols */}
                <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border/50 flex justify-between items-center">
                        <h2 className="font-bold text-lg">콘텐츠 관리</h2>
                        <Link href="/admin/posts" className="text-sm text-brand-mutedBlue hover:underline font-medium">모두 보기</Link>
                    </div>
                    <div className="divide-y divide-border/50">
                        {recentPosts.map((post) => (
                            <div key={post.id} className="p-6 flex items-center justify-between hover:bg-accent/50 transition-colors group">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-foreground group-hover:text-brand-mutedBlue transition-colors">{post.title}</h3>
                                    <div className="flex gap-3 text-xs text-muted-foreground">
                                        <span className={post.status === '초안' ? 'text-orange-500' : 'text-green-500'}>
                                            {post.status}
                                        </span>
                                        <span>•</span>
                                        <span>{post.date}</span>
                                    </div>
                                </div>
                                <div className="text-right pl-4">
                                    <div className="font-medium text-foreground">{post.views}</div>
                                    <div className="text-xs text-muted-foreground">조회수</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / AI Status - spans 1 col */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                        <h2 className="font-bold text-lg mb-4">AI 작가 API 상태</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">OpenAI 모델</span>
                                <span className="flex items-center text-green-500 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> 온라인
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">오늘의 요청</span>
                                <span className="font-bold">24 / 1,000</span>
                            </div>
                            <div className="w-full bg-border/50 rounded-full h-2 mt-2">
                                <div className="bg-brand-mutedBlue h-2 rounded-full" style={{ width: '2.4%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-brand-deepNavy to-slate-900 text-white p-6 shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl">
                            <Plus className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="font-bold text-lg mb-2">짧은 영감이 떠오르셨나요?</h2>
                            <p className="text-sm text-gray-300 mb-6">간단한 메모를 남기면 AI가 완성된 글로 확장시켜 줍니다.</p>
                            <Link href="/admin/editor?mode=ai-expand" className="inline-block w-full text-center rounded-lg text-sm font-semibold transition-colors bg-white text-brand-deepNavy hover:bg-gray-100 py-3">
                                AI 에디터 열기
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
