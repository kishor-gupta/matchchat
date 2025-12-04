import React from 'react'

export default function LobbyPage() {
    return (
        <div className="min-h-screen bg-neutral-50 px-4 py-6">
            <div className="mx-auto max-w-6xl grid grid-cols-2 gap-2 md:grid-cols-12">
                {/* Left: Participants Card */}
                <aside className="md:col-span-3">
                    <div className="h-[70vh] flex flex-col gap-4">

                        {/* User (Other) */}
                        <div className="flex-1 rounded-xl border border-neutral-200 bg-white shadow-sm flex justify-center items-center">
                            <div className="p-3 border w-12 h-12 flex justify-center items-center rounded-full">A</div>
                        </div>

                        {/* User (You) */}
                        <div className="flex-1 rounded-xl border border-neutral-200 bg-white shadow-sm flex justify-center items-center">
                            <div className="p-3 border w-12 h-12 flex justify-center items-center rounded-full">B</div>
                        </div>

                    </div>
                </aside>

                {/* Middle: Chat Area */}
                <main className="md:col-span-6">
                    <div className="flex h-[70vh] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                        {/* Chat header */}
                        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                            <div>
                                {/* <h3 className="text-sm font-semibold text-neutral-800">Connected</h3> */}
                                {/* <p className="text-xs text-neutral-500">2 participants</p> */}
                            </div>
                            <button className="rounded-md border border-neutral-200 px-3 py-1 text-sm text-white hover:bg-neutral-50 bg-red-500" type='button'>
                                Leave
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                            <div className="flex gap-3">
                                <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-200" />
                                <div className="max-w-[70%] rounded-lg bg-neutral-100 px-3 py-2">
                                    <p className="text-sm text-neutral-800">Hey! Ready to match?</p>
                                    <span className="mt-1 block text-[10px] text-neutral-500">09:20</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <div className="max-w-[70%] rounded-lg bg-rose-100 px-3 py-2">
                                    <p className="text-sm text-neutral-800">Yes, let's start!</p>
                                    <span className="mt-1 block text-[10px] text-neutral-500">09:21</span>
                                </div>
                                <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-200" />
                            </div>
                        </div>

                        {/* Composer */}
                        <div className="border-t border-neutral-200 p-3">
                            <form className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message"
                                    className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-600"
                                />
                                <button
                                    type="button"
                                    className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
