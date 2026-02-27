"use client";

import { useState } from "react";
import { Pin, PinOff } from "lucide-react";
import { pinFeaturedPost } from "@/app/admin/settings/actions";

interface PinButtonProps {
    postId: string;
    isFeatured: boolean;
}

export default function PinButton({ postId, isFeatured }: PinButtonProps) {
    const [loading, setLoading] = useState(false);
    const [featured, setFeatured] = useState(isFeatured);

    const handlePin = async () => {
        setLoading(true);
        const result = await pinFeaturedPost(postId);
        if (result?.error) {
            alert(result.error);
        } else {
            setFeatured(true);
            alert("홈페이지 대문에 고정하였습니다!");
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handlePin}
            disabled={loading}
            title={featured ? "현재 대문에 고정됨" : "대문에 올리기"}
            className={`inline-flex p-2 rounded-lg transition-colors ${featured
                    ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                    : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                } disabled:opacity-50`}
        >
            {featured ? (
                <PinOff className="w-4 h-4" />
            ) : (
                <Pin className="w-4 h-4" />
            )}
        </button>
    );
}
