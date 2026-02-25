"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, Sparkles, Send, Save, Eye, MoreHorizontal } from "lucide-react";

export default function AIEditor() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isAiProcessing, setIsAiProcessing] = useState(false);

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        // In a real app, this would tie into the browser's MediaRecorder API and OpenAI Whisper
    };

    const handleAiAssist = async () => {
        setIsAiProcessing(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content, mode: 'tone_journalistic' }) // Default formatting
            });
            const data = await res.json();
            if (data.result) setContent(data.result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAiProcessing(false);
        }
    };

    const handleToneChange = async (mode: string) => {
        setIsAiProcessing(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content, mode })
            });
            const data = await res.json();
            if (data.result) setContent(data.result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAiProcessing(false);
        }
    };

    return (
        <div className="container mx-auto max-w-screen-xl px-4 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[calc(100vh-140px)] flex flex-col">

            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
                <Link href="/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-medium mr-2">Draft saved at 10:42 AM</span>
                    <button className="p-2 border border-border/60 rounded-lg text-muted-foreground hover:bg-accent transition-colors" aria-label="Preview">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button className="px-4 py-2 border border-border/60 rounded-lg text-sm font-medium hover:bg-accent transition-colors flex items-center">
                        <Save className="w-4 h-4 mr-2" /> Save Draft
                    </button>
                    <button className="px-5 py-2 bg-brand-deepNavy dark:bg-foreground text-white dark:text-background rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center">
                        <Send className="w-4 h-4 mr-2" /> Publish
                    </button>
                </div>
            </div>

            {/* Editor Layout: Main workspace + Side panel */}
            <div className="flex flex-col lg:flex-row gap-8 flex-1 h-full">

                {/* Main Editor Area */}
                <div className="flex-1 flex flex-col max-w-4xl w-full">
                    <input
                        type="text"
                        placeholder="Article Title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-4xl md:text-5xl font-serif font-bold bg-transparent border-none outline-none placeholder:text-muted focus:ring-0 mb-6 text-foreground"
                    />

                    <div className="flex items-center gap-2 mb-6 p-2 bg-card border border-border/50 rounded-xl shadow-sm w-fit">
                        <button
                            onClick={toggleRecording}
                            className={`p-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors ${isRecording
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                : 'hover:bg-accent text-foreground'
                                }`}
                        >
                            <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                            {isRecording ? 'Listening...' : 'Dictate (STT)'}
                        </button>
                        <div className="w-px h-6 bg-border mx-1"></div>
                        <button
                            onClick={handleAiAssist}
                            disabled={isAiProcessing || content.length === 0}
                            className="p-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-brand-mutedBlue/10 text-brand-mutedBlue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sparkles className={`w-4 h-4 ${isAiProcessing ? 'animate-spin' : ''}`} />
                            Auto-Format
                        </button>
                        <button className="p-2.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing, or use the dictator to transcribe your thoughts..."
                        className="w-full flex-1 resize-none bg-transparent border-none outline-none text-lg md:text-xl font-sans font-light leading-relaxed placeholder:text-muted-foreground/50 focus:ring-0 text-foreground custom-scrollbar"
                    />
                </div>

                {/* AI Assistant Side Panel */}
                <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 border-l border-border/40 pl-0 lg:pl-8">

                    {/* Tone & Style Adjustment */}
                    <div className="bg-gradient-to-br from-brand-mutedBlue/5 to-transparent border border-brand-mutedBlue/20 rounded-[1.5rem] p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-brand-mutedBlue" />
                            <h3 className="font-bold text-foreground">AI Style Editor</h3>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                            Select a tone to instantly rewrite your current draft.
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleToneChange('tone_journalistic')} className="px-3 py-2 text-xs font-semibold rounded-lg border border-border/60 bg-card hover:bg-accent hover:border-brand-mutedBlue/30 text-foreground transition-all">
                                Journalistic
                            </button>
                            <button onClick={() => handleToneChange('tone_editorial')} className="px-3 py-2 text-xs font-semibold rounded-lg border border-border/60 bg-card hover:bg-accent hover:border-brand-mutedBlue/30 text-foreground transition-all">
                                Editorial
                            </button>
                            <button onClick={() => handleToneChange('tone_casual')} className="px-3 py-2 text-xs font-semibold rounded-lg border border-border/60 bg-card hover:bg-accent hover:border-brand-mutedBlue/30 text-foreground transition-all">
                                Casual
                            </button>
                            <button onClick={() => handleToneChange('tone_academic')} className="px-3 py-2 text-xs font-semibold rounded-lg border border-border/60 bg-card hover:bg-accent hover:border-brand-mutedBlue/30 text-foreground transition-all">
                                Academic
                            </button>
                        </div>

                        <button disabled={isAiProcessing || !content} onClick={() => handleAiAssist()} className="w-full mt-4 py-2.5 bg-brand-deepNavy dark:bg-brand-mutedBlue/30 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                            Apply Tone {isAiProcessing && '...'}
                        </button>
                    </div>

                    {/* AI Utilities */}
                    <div className="border border-border/50 bg-card rounded-[1.5rem] p-6 shadow-sm flex-1">
                        <h3 className="font-bold text-foreground mb-4">Utilities</h3>
                        <div className="space-y-3">
                            <button className="w-full p-3 flex flex-col items-start gap-1 rounded-xl hover:bg-accent border border-transparent hover:border-border/60 transition-all text-left group">
                                <span className="text-sm font-semibold text-foreground group-hover:text-brand-mutedBlue">Generate Summary</span>
                                <span className="text-xs text-muted-foreground">Create the 3-line reader summary</span>
                            </button>
                            <button className="w-full p-3 flex flex-col items-start gap-1 rounded-xl hover:bg-accent border border-transparent hover:border-border/60 transition-all text-left group">
                                <span className="text-sm font-semibold text-foreground group-hover:text-brand-mutedBlue">Find Data Points</span>
                                <span className="text-xs text-muted-foreground">Search web for stats to support text</span>
                            </button>
                            <button className="w-full p-3 flex flex-col items-start gap-1 rounded-xl hover:bg-accent border border-transparent hover:border-border/60 transition-all text-left group">
                                <span className="text-sm font-semibold text-foreground group-hover:text-brand-mutedBlue">Suggest Title</span>
                                <span className="text-xs text-muted-foreground">Generate 5 engaging headline options</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
