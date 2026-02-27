"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Settings as SettingsIcon, Save, Globe } from "lucide-react";
import { getSettings, saveSettings, SiteSettings } from "./actions";

export default function AdminSettings() {
    const [settings, setSettings] = useState<SiteSettings>({
        siteName: "",
        homeGreeting: "",
        homeDescription: "",
        aboutContent: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await getSettings();
            setSettings(data);
            setIsLoading(false);
        };
        fetchSettings();
    }, []);

    const handleChange = (field: keyof SiteSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        startTransition(async () => {
            const result = await saveSettings(settings);
            if (result.error) {
                alert(result.error);
            } else {
                alert("성공적으로 저장되었습니다.");
            }
        });
    };

    if (isLoading) {
        return <div className="container mx-auto p-12 text-center text-muted-foreground">설정을 불러오는 중입니다...</div>;
    }

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
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-brand-deepNavy dark:bg-foreground text-white dark:text-background hover:opacity-90 h-10 px-6 py-2 shadow-sm font-semibold disabled:opacity-50"
                    >
                        <Save className="mr-2 h-4 w-4" /> {isPending ? '저장 중...' : '변경사항 저장'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 flex-1">
                {/* Side Nav */}
                <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent text-brand-mutedBlue font-semibold text-sm transition-colors text-left">
                        <Globe className="w-4 h-4" /> 사이트 일반
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 max-w-3xl space-y-8">
                    <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-6 space-y-6">
                        <h2 className="text-lg font-bold border-b border-border/50 pb-4">홈 화면 텍스트 설정</h2>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">홈 화면 인사말</label>
                            <input
                                type="text"
                                value={settings.homeGreeting}
                                onChange={(e) => handleChange('homeGreeting', e.target.value)}
                                className="w-full rounded-xl px-4 py-2.5 bg-background border border-border/60 focus:outline-none focus:ring-2 focus:ring-brand-mutedBlue/50 transition-all font-sans"
                            />
                            <p className="text-xs text-muted-foreground mt-1">예: &quot;좋은 아침입니다.&quot;</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">홈 화면 타이틀 설명</label>
                            <input
                                type="text"
                                value={settings.homeDescription}
                                onChange={(e) => handleChange('homeDescription', e.target.value)}
                                className="w-full rounded-xl px-4 py-2.5 bg-background border border-border/60 focus:outline-none focus:ring-2 focus:ring-brand-mutedBlue/50 transition-all font-sans"
                            />
                            <p className="text-xs text-muted-foreground mt-1">인사말 바로 아래에 작게 노출되는 서브 타이틀입니다.</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-6 space-y-6">
                        <h2 className="text-lg font-bold border-b border-border/50 pb-4">소개 (About) 페이지 콘텐츠</h2>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">소개글 내용</label>
                            <textarea
                                value={settings.aboutContent}
                                onChange={(e) => handleChange('aboutContent', e.target.value)}
                                rows={8}
                                className="w-full resize-none rounded-xl px-4 py-2.5 bg-background border border-border/60 focus:outline-none focus:ring-2 focus:ring-brand-mutedBlue/50 transition-all font-sans custom-scrollbar"
                                placeholder="마크다운(Markdown) 문법을 사용하여 /about 페이지에 노출될 소개글을 작성하세요."
                            />
                            <p className="text-xs text-muted-foreground mt-1">마크다운(## 소제목, **굵게**, 링크 등)을 지원합니다.</p>
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
