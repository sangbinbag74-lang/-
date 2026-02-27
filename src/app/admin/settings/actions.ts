'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SiteSettings {
    siteName: string;
    homeGreeting: string;
    homeDescription: string;
    aboutContent: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
    siteName: "포워드 익산",
    homeGreeting: "좋은 아침입니다.",
    homeDescription: "육군 참모차장의 시선으로 그리는 익산의 새로운 비전",
    aboutContent: "# 포워드 익산 소개\n\n기술, 비즈니스, 디자인 등 다양한 분야의 인사이트를 간결하게 전달하는 1인 레이블 매거진입니다."
};

export async function getSettings(): Promise<SiteSettings> {
    const supabase = createClient()
    const { data } = await supabase
        .from('posts')
        .select('content')
        .eq('slug', 'system-settings')
        .maybeSingle()

    if (data?.content) {
        try {
            const parsed = JSON.parse(data.content);
            return {
                siteName: parsed.siteName || DEFAULT_SETTINGS.siteName,
                homeGreeting: parsed.homeGreeting || DEFAULT_SETTINGS.homeGreeting,
                homeDescription: parsed.homeDescription || DEFAULT_SETTINGS.homeDescription,
                aboutContent: parsed.aboutContent || DEFAULT_SETTINGS.aboutContent,
            };
        } catch (e) {
            console.error('Failed to parse settings JSON', e);
        }
    }
    return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: SiteSettings) {
    const supabase = createClient()

    // 1. Check if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '인증되지 않은 사용자입니다.' }
    }

    const contentJson = JSON.stringify(settings);

    // 2. Check if the settings post exists
    const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', 'system-settings')
        .maybeSingle()

    let error;

    if (existing) {
        // Update existing
        const { error: updateError } = await supabase
            .from('posts')
            .update({
                title: 'System Settings (Do Not Delete)',
                content: contentJson,
                status: 'draft'
            })
            .eq('id', existing.id);
        error = updateError;
    } else {
        // Insert new
        const { error: insertError } = await supabase
            .from('posts')
            .insert({
                title: 'System Settings (Do Not Delete)',
                slug: 'system-settings',
                content: contentJson,
                summary: 'Contains site settings JSON',
                status: 'draft',
                author: user.email
            });
        error = insertError;
    }

    if (error) {
        console.error('Save settings error:', error)
        return { error: `설정 저장 실패: ${error.message}` }
    }

    revalidatePath('/')
    revalidatePath('/about')
    revalidatePath('/admin/settings')

    return { success: true }
}
