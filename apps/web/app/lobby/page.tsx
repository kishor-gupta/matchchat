"use client";
import React, { useEffect, useRef, useState } from 'react';
import { initializeConnection } from '../socketio';

export default function LobbyPage() {
    const [paired, setPaired] = useState<{ peerId: string; roomId?: string } | null>(null);
    const [messages, setMessages] = useState<Array<{ from: string; text: string }>>([]);
    const socketRef = useRef<ReturnType<typeof initializeConnection> | null>(null);
    const [socketId, setSocketId] = useState<string>();
    const [input, setInput] = useState('');
    const [counter, setCounter] = useState(0);
    const messagesEndRef = useRef<null | HTMLDivElement>(null)

    const scrollToBottom = () => {
        if (messagesEndRef?.current) {
            const element = messagesEndRef.current;
            element.scroll({
                top: element.scrollHeight,
                left: 0,
                behavior: "smooth"
            })
        }
    }

    useEffect(() => {
        setTimeout(scrollToBottom, 0);
    }, [messages]);

    useEffect(() => {
        console.log("socketId:", socketId);
    }, [socketId]);

    useEffect(() => {
        const socket = initializeConnection();
        socketRef.current = socket;

        socketRef.current.on('connect', () => {
            setSocketId(socketRef.current?.id);
            socketRef.current!.emit('join');
        });

        socketRef.current.on('waiting', () => {
            setPaired(null);
        });

        socketRef.current.on('paired', (data: { peerId: string; roomId?: string }) => {
            setPaired(data);
        });

        socketRef.current.on('message', (payload: { from: string; text: string }) => {
            setMessages((prev) => [...prev, payload]);
        });

        socketRef.current.on('onlineClient', (data: { count: number }) => {
            setCounter(data.count);
        });

        return () => {
            socketRef.current?.off('waiting');
            socketRef.current?.off('paired');
            socketRef.current?.off('message');
            socketRef.current?.off('onlineClient');
            socketRef.current?.disconnect();
        };
    }, []);

    const handleSend = () => {
        const text = input.trim();
        if (!text || !socketRef.current) return;
        socketRef.current.emit('message', { text });
        setMessages((prev) => [...prev, { from: 'me', text }]);
        setInput('');
    };

    const handleLeave = () => {
        socketRef.current?.emit('leave');
        setMessages([]);
    };

    return (
        <div className="min-h-screen bg-neutral-50 px-4 py-6">
            <div className="mx-auto max-w-6xl grid grid-cols-1 gap-3 md:grid-cols-12">
                {/* Left: Participants Card */}
                <aside className="order-2 md:order-1 md:col-span-3">
                    <div className="h-[70vh] flex flex-col gap-4">

                        {/* User (Other) */}
                        <div className="flex-1 rounded-xl border border-neutral-200 bg-white shadow-sm flex justify-center items-center">
                            {/* <div className="p-3 border w-12 h-12 flex justify-center items-center rounded-full">{paired?.peerId}</div> */}
                            {paired?.peerId}
                        </div>

                        {/* User (You) */}
                        <div className="flex-1 rounded-xl border border-neutral-200 bg-white shadow-sm flex justify-center items-center">
                            {/* <div className="p-3 border w-12 h-12 flex justify-center items-center rounded-full">{socketRef.current?.id}</div> */}
                            {socketId} - YOU
                        </div>

                    </div>
                </aside>

                {/* Middle: Chat Area */}
                <main className="order-1 md:order-2 md:col-span-6">
                    <div className="flex md:h-[70vh] h-[80vh] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                        {/* Chat header */}
                        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                            <div>
                                {/* <h3 className="text-sm font-semibold text-neutral-800">Connected</h3> */}
                                {/* <p className="text-xs text-neutral-500">2 participants</p> */}
                            </div>
                            <button className="rounded-md border border-neutral-200 px-3 py-1 text-sm text-white hover:bg-neutral-50 bg-red-500" type='button' onClick={handleLeave}>
                                {paired ? 'Leave' : 'Waiting'}
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" ref={messagesEndRef}>
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex gap-3 ${m.from === 'me' ? 'justify-end' : ''}`}>
                                    {m.from !== 'me' && <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-200" />}
                                    <div className={`max-w-[70%] rounded-lg px-3 py-2 ${m.from === 'me' ? 'bg-rose-100' : 'bg-neutral-100'}`}>
                                        <p className="text-sm text-neutral-800">{m.text}</p>
                                    </div>
                                    {m.from === 'me' && <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-200" />}
                                </div>
                            ))}
                        </div>

                        {/* Composer */}
                        <div className="border-t border-neutral-200 p-3">
                            <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message"
                                    className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-600"
                                />
                                <button
                                    type="submit"
                                    className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
                                >
                                    Send{counter}
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
