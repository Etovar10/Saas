"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

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

export default function Home() {
    const [idea, setIdea] = useState<string>('…loading');
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const eventRef = useRef<EventSource | null>(null);
    const bufferRef = useRef('');

    const startStream = useCallback(() => {
        if (typeof window === 'undefined') {
            return;
        }

        eventRef.current?.close();
        bufferRef.current = '';
        setIdea('…loading');
        setError(null);
        setIsStreaming(true);

        const evt = new EventSource('/api');
        eventRef.current = evt;
        evt.onmessage = (e) => {
            if (e.data === '[END]') {
                setIsStreaming(false);
                bufferRef.current = bufferRef.current.trimStart();
                evt.close();
                eventRef.current = null;
                return;
            }

            bufferRef.current += e.data ?? '';
            setIdea(bufferRef.current.trimStart());
        };

        evt.onerror = () => {
            setIsStreaming(false);
            setError('Lost connection to the idea stream. Try again.');
            evt.close();
            eventRef.current = null;
            bufferRef.current = '';
        };
    }, []);

    useEffect(() => {
        startStream();

        return () => {
            eventRef.current?.close();
        };
    }, [startStream]);

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
                            ) : (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                >
                                    {idea}
                                </ReactMarkdown>
                            )}
                        </div>
                    </div>
                </section>
            </section>
        </main>
    );
}
