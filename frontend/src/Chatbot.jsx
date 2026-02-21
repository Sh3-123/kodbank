import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';

const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
// Using a fast model that is usually loaded for general instruction
const API_URL = 'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Hi! I am your Kodbank AI assistant. How can I help you today?' },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const queryHuggingFace = async (prompt, retries = 3) => {
        for (let i = 0; i < retries; i++) {
            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 150,
                        temperature: 0.7,
                        return_full_text: false,
                    }
                }),
            });
            const data = await response.json();

            if (response.ok) {
                return data;
            }

            if (data.error && data.error.includes('currently loading')) {
                // Wait for the estimated time (capping at 10s per retry just in case)
                const waitTime = Math.min((data.estimated_time || 5) * 1000, 10000);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
                throw new Error(data.error || 'Failed to fetch from Hugging Face API');
            }
        }
        throw new Error('Model is still loading. Please try again later.');
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Build prompt for Zephyr-7B (ChatML-style or its default system prompt format)
            let prompt = `<|system|>\nYou are a helpful and concise AI assistant for Kodbank, a modern online banking platform. You answer financial questions clearly and helpfully.</s>\n`;
            messages.forEach(m => {
                prompt += `<|${m.role === 'bot' ? 'assistant' : 'user'} बालक|>\n${m.content}</s>\n`;
            });
            // Removing the extra " बालक" I mistyped above
            prompt = `<|system|>\nYou are a helpful and concise AI assistant for Kodbank, a modern online banking platform. You answer financial questions clearly and helpfully.</s>\n`;
            messages.forEach(m => {
                prompt += `<|${m.role === 'bot' ? 'assistant' : 'user'}|>\n${m.content}</s>\n`;
            });
            prompt += `<|user|>\n${input}</s>\n<|assistant|>\n`;

            const result = await queryHuggingFace(prompt);

            let botContent = 'Sorry, I couldn\'t generate a response.';
            if (Array.isArray(result) && result.length > 0 && result[0].generated_text) {
                botContent = result[0].generated_text;
            } else if (typeof result === 'string') {
                botContent = result;
            } else if (result.generated_text) {
                botContent = result.generated_text;
            }

            setMessages(prev => [...prev, { role: 'bot', content: botContent.trim() }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                role: 'bot',
                content: `Error: ${error.message || 'I encountered an issue connecting to the AI model.'}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Search Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-accent hover:bg-accentDark text-black rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(81,210,131,0.4)] transition-transform hover:scale-105"
                >
                    <MessageSquare fill="currentColor" className="w-6 h-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[350px] sm:w-[400px] h-[500px] bg-card border border-[#2e3039] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-[#1f2127] border-b border-[#2e3039] p-4 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center relative">
                                <Bot className="w-5 h-5 text-accent" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-[#1f2127]"></div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-200 text-sm">Kodbank AI</h3>
                                <p className="text-xs text-accent">Online</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-textMuted hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-background/50 flex flex-col gap-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#2e3039]' : 'bg-accent/20 text-accent'
                                        }`}
                                >
                                    {msg.role === 'user' ? <User className="w-4 h-4 text-gray-300" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div
                                    className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-accent text-black rounded-tr-none'
                                        : 'bg-[#2e3039] text-gray-200 rounded-tl-none border border-[#3f414a]'
                                        }`}
                                    style={{ whiteSpace: 'pre-wrap' }}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 max-w-[85%] self-start">
                                <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="px-5 py-3 rounded-2xl bg-[#2e3039] text-gray-200 rounded-tl-none border border-[#3f414a] flex items-center">
                                    <span className="flex gap-1 items-center h-4">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-[#1f2127] border-t border-[#2e3039] shrink-0">
                        <div className="relative flex items-end">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Ask me anything..."
                                className="w-full bg-inputBg border border-[#2e3039] rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-accent text-white placeholder:text-textMuted resize-none max-h-32 min-h-[44px]"
                                rows={1}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 bottom-[6px] w-8 h-8 flex items-center justify-center rounded-lg bg-accent hover:bg-accentDark text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Send Message"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />}
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-textMuted">Powered by Hugging Face AI</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
