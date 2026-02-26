'use client'

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deletePost } from "../editor/actions";

export default function DeletePostButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm('정말로 이 기사를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            startTransition(async () => {
                const result = await deletePost(id);
                if (result?.error) {
                    alert(result.error);
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
            title="기사 삭제"
        >
            <Trash2 className={`w-4 h-4 ${isPending ? 'animate-pulse text-red-500' : ''}`} />
        </button>
    );
}
