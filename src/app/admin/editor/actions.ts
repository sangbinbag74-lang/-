'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function savePost(data: { title: string; content: string; status: 'draft' | 'published' }) {
    const supabase = createClient()

    // 1. Check if authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '인증되지 않은 사용자입니다.' }
    }

    // 2. Generate simple slug from title or timestamp
    const slug = data.title
        ? data.title.toLowerCase().replace(/[^a-zA-Z0-9가-힣]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now()
        : `draft-${Date.now()}`

    // 3. Simple AI Summary mock (In reality, we could call OpenAI here)
    const summary = data.content.substring(0, 100) + '...'

    // 4. Insert into Supabase
    const { error } = await supabase
        .from('posts')
        .insert({
            title: data.title || '새 문서',
            slug,
            content: data.content,
            summary,
            status: data.status,
            published_at: data.status === 'published' ? new Date().toISOString() : null,
            author: user.email // Or fetch profile name later
        })

    if (error) {
        console.error('Save post error:', error)
        return { error: `글 저장 실패: ${error.message}` }
    }

    // 5. Revalidate cache and redirect
    revalidatePath('/admin')
    revalidatePath('/')

    redirect('/admin')
}
