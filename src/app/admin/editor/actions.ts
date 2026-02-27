'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function savePost(data: { id?: string; title: string; content: string; summary?: string; status: 'draft' | 'published'; category?: 'article' | 'short' }) {
    const supabase = createClient()

    // 1. Check if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '인증되지 않은 사용자입니다.' }
    }

    // 2. Summary handling
    let finalSummary = data.summary;
    if (!finalSummary) {
        const plainText = data.content
            .replace(/!\[.*?\]\(.*?\)/g, '') // 이미지 제거
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 링크는 링크 텍스트만 남김
            .replace(/[#*`~>]/g, '') // 불필요한 마크다운 기호 제거
            .replace(/\n+/g, ' ') // 줄바꿈을 공백으로 치환
            .trim();
        finalSummary = plainText.substring(0, 100) + (plainText.length > 100 ? '...' : '');
    }

    let resultId = data.id;

    // 3. Upsert into Supabase
    if (data.id) {
        // Update existing post
        const { error } = await supabase
            .from('posts')
            .update({
                title: data.title || '새 문서',
                content: data.content,
                summary: finalSummary,
                status: data.status,
                published_at: data.status === 'published' ? new Date().toISOString() : null,
            })
            .eq('id', data.id)

        if (error) {
            console.error('Update post error:', error)
            return { error: `글 수정 실패: ${error.message}` }
        }
    } else {
        // Insert new post
        const slugBase = data.title
            ? data.title.toLowerCase().replace(/[^a-zA-Z0-9가-힣]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now()
            : `draft-${Date.now()}`

        const prefix = data.category === 'short' ? 'short-' : 'article-';
        const slug = prefix + slugBase;

        const { data: newRow, error } = await supabase
            .from('posts')
            .insert({
                title: data.title || '새 문서',
                slug,
                content: data.content,
                summary: finalSummary,
                status: data.status,
                published_at: data.status === 'published' ? new Date().toISOString() : null,
                author: user.email
            })
            .select()
            .single()

        if (error) {
            console.error('Save post error:', error)
            return { error: `글 저장 실패: ${error.message}` }
        }
        resultId = newRow.id;
    }

    // 4. Revalidate cache
    revalidatePath('/admin')
    revalidatePath('/admin/posts')
    revalidatePath('/')

    return { success: true, id: resultId }
}

export async function deletePost(id: string) {
    const supabase = createClient()

    // 1. Check if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '인증되지 않은 사용자입니다.' }
    }

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Delete post error:', error)
        return { error: `글 삭제 실패: ${error.message}` }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/posts')
    revalidatePath('/')

    return { success: true }
}
