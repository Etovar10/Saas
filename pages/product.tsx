"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { SignedIn, SignedOut, SignInButton, useAuth, UserButton } from '@clerk/nextjs';
import { fetchEventSource } from '@microsoft/fetch-event-source';

const vibeTags = [
    'Generative ideation',
    'Azure OpenAI',
    'Realtime streaming',
    'Business blueprints'
];

const metrics = [
    { value: '12,840+', label: 'Ideas launched' },
    { value: '~2.4s', label: 'Avg. response time' },
    { value: '14', label: 'Industries covered' },
    { value: '99.2%', label: 'User satisfaction' }
];

function normalizeMarkdown(input: string): string {
    let out = input.replace(/\r\n/g, '\n');
    // Ensure visible separation around horizontal rules
    out = out.replace(/\s*---\s*/g, '\n\n---\n\n');
    // Insert a blank line before ATX headings if jammed to previous text
    out = out.replace(/([^\n])\s*(#{1,6}\s)/g, '$1\n\n$2');
    // Ensure unordered list items start on a new line
    out = out.replace(/([^\n])\s*(-\s)/g, '$1\n$2');
    // Ensure ordered list items start on a new line
    out = out.replace(/([^\n])\s*(\d+\.\s)/g, '$1\n$2');
    // Collapse excessive blank lines
    out = out.replace(/\n{3,}/g, '\n\n');
    return out;
}

function IdeaLab() {
    const { isLoaded, getToken } = useAuth();
    const [idea, setIdea] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFirstToken, setHasFirstToken] = useState(false);
    const controllerRef = useRef<AbortController | null>(null);
    const bufferRef = useRef('');

    const startStream = useCallback(async () => {
        if (!isLoaded) {
            return;
        }

        controllerRef.current?.abort();

        bufferRef.current = '';
        setIdea('');
        setError(null);
        setIsStreaming(true);
        setHasFirstToken(false);

        const controller = new AbortController();
        controllerRef.current = controller;
        const token = getToken ? await getToken() : null;

        fetchEventSource('/api', {
            signal: controller.signal,
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            onmessage(ev) {
                if (ev.data === '[END]') {
                    setIsStreaming(false);
                    controller.abort();
                    controllerRef.current = null;
                    const cleaned = normalizeMarkdown(bufferRef.current.trim());
                    setIdea(cleaned);
                    return;
                }

                setHasFirstToken(true);
                bufferRef.current += ev.data ?? '';
                const preview = normalizeMarkdown(bufferRef.current);
                setIdea(preview.trimStart());
            },
            onclose() {
                setIsStreaming(false);
                controllerRef.current = null;
            },
            onerror(err) {
                throw err;
            },
        }).catch((err) => {
            if (controller.signal.aborted) {
                return;
            }
            console.error('Streaming failed', err);
            setError('Streaming stalled. Please try again.');
            setIsStreaming(false);
            controllerRef.current = null;
        });
    }, [getToken, isLoaded]);

    useEffect(() => {
        return () => {
            controllerRef.current?.abort();
        };
    }, []);

    const displayedIdea = idea || 'Tap “Generate a new idea” to stream something fresh.';
    const showLoader = isStreaming && !hasFirstToken && !error;

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <div className="floating-orb orb-one" />
            <div className="floating-orb orb-two" />
            <div className="floating-orb orb-three" />
            <div className="noise-overlay" />

            <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 flex flex-col gap-12">
                <header className="text-center space-y-6">
                    <span className="tagline">AI Agents Studio · Powered by Azure OpenAI</span>
                    <h1 className="gradient-heading text-4xl md:text-6xl font-black leading-tight">
                        Business Idea Reactor
                    </h1>
                    <p className="text-lg text-indigo-100 max-w-3xl mx-auto">
                        Spin up venture-ready concepts in seconds. We stream fresh strategy, positioning,
                        and differentiation angles in real-time—perfect for founders, agencies, and builders
                        chasing their next big launch.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {vibeTags.map((tag) => (
                            <span key={tag} className="glass-pill text-sm uppercase tracking-wide">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={startStream}
                            disabled={isStreaming}
                            className="button-primary"
                        >
                            {isStreaming ? 'Streaming fresh idea…' : 'Generate a new idea'}
                        </button>
                        <button
                            onClick={() => navigator.clipboard.writeText(idea)}
                            className="button-secondary"
                        >
                            Copy current idea
                        </button>
                    </div>
                </header>

                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                    {metrics.map((metric) => (
                        <div key={metric.label} className="glass-panel p-4 rounded-2xl text-left">
                            <p className="text-2xl font-semibold text-white">{metric.value}</p>
                            <p className="text-sm text-indigo-100/80">{metric.label}</p>
                        </div>
                    ))}
                </section>

                <section id="idea" className="relative">
                    <div className="idea-glow" />
                    <div className="glass-panel idea-panel">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">
                                    Live AI output
                                </p>
                                <h2 className="text-2xl font-semibold text-white">
                                    Your personalized business opportunity
                                </h2>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-indigo-100">
                                <span className={`pulse-dot ${isStreaming ? 'is-active' : ''}`} />
                                {isStreaming ? 'Streaming in real-time' : 'Ready for another idea'}
                            </div>
                        </div>

                        <div className="idea-scroll markdown-content prose prose-invert">
                            {error ? (
                                <div className="error-banner">
                                    {error}
                                </div>
                            ) : showLoader ? (
                                <div className="idea-loader">
                                    <div className="equalizer">
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                    <p className="text-sm text-indigo-100 tracking-wide uppercase">
                                        Brewing your next opportunity
                                    </p>
                                </div>
                            ) : (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                >
                                    {displayedIdea}
                                </ReactMarkdown>
                            )}
                        </div>
                    </div>
                </section>
            </section>
        </main>
    );
}

export default function ProductPage() {
    return (
        <>
            <SignedIn>
                <div className="absolute top-6 right-6 z-20">
                    <UserButton showName afterSignOutUrl="/" />
                </div>
                <IdeaLab />
            </SignedIn>
            <SignedOut>
                <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-6 px-6 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight">Access requires an account</h1>
                    <p className="text-indigo-100 max-w-xl">
                        Sign in to generate bespoke business ideas, track your history, and unlock additional product research tools.
                    </p>
                    <SignInButton mode="modal">
                        <button className="button-primary text-base">Sign in to continue</button>
                    </SignInButton>
                </main>
            </SignedOut>
        </>
    );
}
