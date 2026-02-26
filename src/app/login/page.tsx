import Link from 'next/link';
import { login } from './actions'
import { ArrowLeft, LockKeyhole } from 'lucide-react';

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string, success?: string }
}) {
    return (
        <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 min-h-[calc(100vh-140px)] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

            <Link
                href="/"
                className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
            >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                돌아가기
            </Link>

            <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">

                <div className="mb-8 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-brand-deepNavy dark:bg-brand-mutedBlue/20 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                        <LockKeyhole className="w-8 h-8 text-white dark:text-brand-mutedBlue" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">접근 제한됨</h1>
                    <p className="text-muted-foreground text-sm mt-3 text-balance">
                        이 영역은 플랫폼 소유자 전용입니다. AI 에디터 및 콘텐츠 관리 시스템에 접근하려면 로그인하세요.
                    </p>
                </div>

                <label className="text-sm font-semibold" htmlFor="email">
                    이메일
                </label>
                <input
                    className="rounded-xl px-4 py-3 bg-card border border-border/60 mb-6 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-mutedBlue/50 transition-all font-sans"
                    name="email"
                    placeholder="editor@forwardiksan.com"
                    required
                />

                <label className="text-sm font-semibold" htmlFor="password">
                    비밀번호
                </label>
                <input
                    className="rounded-xl px-4 py-3 bg-card border border-border/60 mb-8 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-mutedBlue/50 transition-all font-sans"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                />

                <button
                    formAction={login}
                    className="bg-brand-deepNavy dark:bg-foreground text-white dark:text-background font-semibold rounded-xl px-4 py-3 text-foreground hover:opacity-90 transition-opacity mb-2"
                >
                    로그인
                </button>

                {searchParams?.message && (
                    <p className="mt-4 p-4 bg-red-500/10 text-red-500 text-center text-sm font-medium rounded-xl">
                        {searchParams.message}
                    </p>
                )}
            </form>
        </div>
    )
}
