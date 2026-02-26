import Link from "next/link";
import { ArrowLeft, Settings as SettingsIcon, Save, User, Globe, Bell, Shield } from "lucide-react";

export default function AdminSettings() {
    return (
        <div className="container mx-auto max-w-screen-xl px-4 lg:px-8 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="mb-10">
                <Link href="/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    대시보드로 돌아가기
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-sans text-foreground tracking-tight flex items-center gap-3">
                            <SettingsIcon className="h-8 w-8 text-brand-mutedBlue" />
                            플랫폼 설정
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">기본 플랫폼 정보 및 에디터 계정 설정을 관리할 수 있습니다.</p>
                    </div>
                    <button className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-brand-deepNavy dark:bg-foreground text-white dark:text-background hover:opacity-90 h-10 px-6 py-2 shadow-sm font-semibold">
                        <Save className="mr-2 h-4 w-4" /> 변경사항 저장
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1">
                {/* Side Nav */}
                <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent text-brand-mutedBlue font-semibold text-sm transition-colors text-left">
                        <Globe className="w-4 h-4" /> 사이트 일반
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent text-foreground font-medium text-sm transition-colors text-left">
                        <User className="w-4 h-4 text-muted-foreground" /> 내 프로필
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent text-foreground font-medium text-sm transition-colors text-left">
                        <Shield className="w-4 h-4 text-muted-foreground" /> 보안 및 인증
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent text-foreground font-medium text-sm transition-colors text-left">
                        <Bell className="w-4 h-4 text-muted-foreground" /> 알림 설정
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 max-w-3xl space-y-8">
                    <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-6 space-y-6">
                        <h2 className="text-lg font-bold border-b border-border/50 pb-4">기본 사이트 정보</h2>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">사이트 이름</label>
                            <input
                                type="text"
                                defaultValue="포워드 익산"
                                className="w-full rounded-xl px-4 py-2.5 bg-background border border-border/60 focus:outline-none focus:ring-2 focus:ring-brand-mutedBlue/50 transition-all font-sans"
                            />
                            <p className="text-xs text-muted-foreground mt-1">헤더 및 메타 테그에 노출되는 플랫폼 공식 명칭입니다.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">사이트 설명</label>
                            <textarea
                                defaultValue="기술, 비즈니스, 디자인 등 다양한 분야의 인사이트를 간결하게 전달하는 1인 레이블 매거진입니다."
                                rows={3}
                                className="w-full resize-none rounded-xl px-4 py-2.5 bg-background border border-border/60 focus:outline-none focus:ring-2 focus:ring-brand-mutedBlue/50 transition-all font-sans"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-border/50 pb-4">
                            <div>
                                <h2 className="text-lg font-bold">SEO 설정</h2>
                                <p className="text-xs text-muted-foreground mt-1">구글 및 네이버 검색 최적화</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">인덱싱 허용</label>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-mutedBlue rounded border-border" />
                                <span className="text-sm text-foreground">검색 엔진이 이 사이트를 검색 결과에 노출하도록 허용합니다.</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-red-500/20 bg-card shadow-sm p-6 space-y-4">
                        <h2 className="text-lg font-bold text-red-500">위험 구역</h2>
                        <p className="text-sm text-muted-foreground">사이트를 비공개로 전환하거나 삭제할 수 있습니다. 되돌릴 수 없으니 주의하세요.</p>
                        <button className="px-4 py-2 bg-red-500/10 text-red-500 font-semibold text-sm rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                            플랫폼 비활성화
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
