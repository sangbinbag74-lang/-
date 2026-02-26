import Link from "next/link";
import { ArrowLeft, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from '@/lib/supabase/server';

export default async function AdminPosts() {
    const supabase = createClient();
    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="container mx-auto max-w-screen-xl px-4 lg:px-8 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="mb-8">
                <Link href="/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    대시보드로 돌아가기
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-sans text-foreground tracking-tight flex items-center gap-3">
                            <FileText className="h-8 w-8 text-brand-mutedBlue" />
                            콘텐츠 관리
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">플랫폼에 작성된 모든 글과 초안을 관리합니다.</p>
                    </div>
                    <Link href="/admin/editor" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-brand-deepNavy dark:bg-foreground text-white dark:text-background hover:opacity-90 h-10 px-5 py-2 shadow-sm font-semibold">
                        <Plus className="mr-2 h-4 w-4" /> 새 글 쓰기
                    </Link>
                </div>
            </div>

            {/* Posts Table */}
            <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-accent/50 text-muted-foreground font-medium border-b border-border/50">
                            <tr>
                                <th className="px-6 py-4">제목</th>
                                <th className="px-6 py-4">상태</th>
                                <th className="px-6 py-4">조회수</th>
                                <th className="px-6 py-4">작성일</th>
                                <th className="px-6 py-4 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {posts?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        작성된 글이 없습니다.
                                    </td>
                                </tr>
                            ) : posts?.map((post) => (
                                <tr key={post.id} className="hover:bg-accent/30 transition-colors group">
                                    <td className="px-6 py-4 font-semibold text-foreground">
                                        <Link href={`/posts/${post.slug}`} className="hover:text-brand-mutedBlue transition-colors" target="_blank">
                                            {post.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${post.status === 'published' || post.status === '발행됨'
                                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                                : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                            }`}>
                                            {post.status === 'draft' ? '초안' : post.status === 'published' ? '발행됨' : post.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {(post.views || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Link href={`/admin/editor?id=${post.id}`} className="inline-flex p-2 text-muted-foreground hover:text-brand-mutedBlue hover:bg-accent rounded-lg transition-colors" title="수정">
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <button className="inline-flex p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="삭제 (지원 예정)">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
