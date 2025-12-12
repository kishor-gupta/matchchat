"use client"

import React from 'react'
import { useRouter } from 'next/navigation';

function StartChatComponent() {
    const router = useRouter();
    const handleStartChat = () => {
        router.push('/lobby');
    };

    return (
        <button type='button' className="text-white bg-blue-600 box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-full text-sm px-4 py-2.5 focus:outline-none" onClick={handleStartChat}>Start chat</button>
    )
}

export default StartChatComponent
