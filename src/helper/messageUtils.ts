import React from 'react';
import { Message } from '../models/webllm';

export class MessageUtils {
    static createMessage(role: 'user' | 'assistant' | 'system', content: string): Message {
        return {
            id: this.generateMessageId(),
            role,
            content: content.trim(),
            timestamp: new Date()
        };
    }

    static generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    static formatMessageContent(content: string): React.ReactNode[] {
        // Enhanced markdown-like formatting with code blocks and lists
        const lines = content.split('\n');
        const elements: React.ReactNode[] = [];
        let currentIndex = 0;

        while (currentIndex < lines.length) {
            const line = lines[currentIndex];

            // Code blocks
            if (line.trim().startsWith('```')) {
                const { elements: codeElements, nextIndex } = this.parseCodeBlock(lines, currentIndex);
                elements.push(...codeElements);
                currentIndex = nextIndex;
                continue;
            }

            // Headers
            if (line.startsWith('#')) {
                elements.push(this.parseHeader(line, currentIndex));
                currentIndex++;
                continue;
            }

            // Lists
            if (line.match(/^[\s]*[-*+]\s/) || line.match(/^[\s]*\d+\.\s/)) {
                const { elements: listElements, nextIndex } = this.parseList(lines, currentIndex);
                elements.push(...listElements);
                currentIndex = nextIndex;
                continue;
            }

            // Regular paragraphs
            if (line.trim()) {
                elements.push(this.parseParagraph(line, currentIndex));
            }

            currentIndex++;
        }

        return elements.length > 0 ? elements : [this.parseParagraph(content, 0)];
    }

    private static parseCodeBlock(lines: string[], startIndex: number): { elements: React.ReactNode[]; nextIndex: number } {
        const elements: React.ReactNode[] = [];
        let currentIndex = startIndex + 1;
        const codeLines: string[] = [];
        let language = lines[startIndex].replace('```', '').trim();

        while (currentIndex < lines.length && !lines[currentIndex].trim().startsWith('```')) {
            codeLines.push(lines[currentIndex]);
            currentIndex++;
        }

        elements.push(
            React.createElement('pre',
                {
                    key: `code_${startIndex}`,
                    className: 'bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm font-mono my-2'
                },
                React.createElement('code',
                    { className: language ? `language-${language}` : '' },
                    codeLines.join('\n')
                )
            )
        );

        return {
            elements,
            nextIndex: currentIndex + 1
        };
    }

    private static parseHeader(line: string, index: number): React.ReactNode {
        const level = line.match(/^#+/)?.[0].length || 1;
        const text = line.replace(/^#+\s*/, '');
        const tag = `h${Math.min(level, 6)}`;

        return React.createElement(tag, {
            key: `header_${index}`,
            className: `font-bold my-2 ${this.getHeaderClass(level)}`
        }, this.parseInlineFormatting(text));
    }

    private static getHeaderClass(level: number): string {
        const classes = {
            1: 'text-2xl',
            2: 'text-xl',
            3: 'text-lg',
            4: 'text-base',
            5: 'text-sm',
            6: 'text-xs'
        };
        return classes[level as keyof typeof classes] || 'text-base';
    }

    private static parseList(lines: string[], startIndex: number): { elements: React.ReactNode[]; nextIndex: number } {
        const elements: React.ReactNode[] = [];
        const listItems: React.ReactNode[] = [];
        let currentIndex = startIndex;
        const isOrdered = lines[startIndex].match(/^[\s]*\d+\.\s/);

        while (currentIndex < lines.length) {
            const line = lines[currentIndex];
            const listMatch = line.match(/^[\s]*[-*+]\s/) || line.match(/^[\s]*\d+\.\s/);

            if (!listMatch) {
                break;
            }

            const content = line.replace(/^[\s]*(?:[-*+]|\d+\.)\s/, '');
            listItems.push(
                React.createElement('li',
                    { key: `li_${currentIndex}`, className: 'mb-1' },
                    this.parseInlineFormatting(content)
                )
            );

            currentIndex++;
        }

        const listTag = isOrdered ? 'ol' : 'ul';
        const listClass = isOrdered ? 'list-decimal list-inside' : 'list-disc list-inside';

        elements.push(
            React.createElement(listTag, {
                key: `list_${startIndex}`,
                className: `${listClass} my-2 ml-4`
            }, ...listItems)
        );

        return {
            elements,
            nextIndex: currentIndex
        };
    }

    private static parseParagraph(line: string, index: number): React.ReactNode {
        if (!line.trim()) {
            return React.createElement('br', { key: `br_${index}` });
        }

        return React.createElement('p', {
            key: `p_${index}`,
            className: 'mb-2 leading-relaxed'
        }, this.parseInlineFormatting(line));
    }

    private static parseInlineFormatting(text: string): React.ReactNode[] {
        const elements: React.ReactNode[] = [];
        let currentText = text;
        let keyIndex = 0;

        // Handle inline code first
        currentText = currentText.replace(/`([^`]+)`/g, (match, code) => {
            const placeholder = `__CODE_${keyIndex}__`;
            elements.push(
                React.createElement('code', {
                    key: `code_${keyIndex}`,
                    className: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono'
                }, code)
            );
            keyIndex++;
            return placeholder;
        });

        // Handle bold text
        currentText = currentText.replace(/\*\*([^*]+)\*\*/g, (match, bold) => {
            const placeholder = `__BOLD_${keyIndex}__`;
            elements.push(
                React.createElement('strong', {
                    key: `bold_${keyIndex}`,
                    className: 'font-semibold'
                }, bold)
            );
            keyIndex++;
            return placeholder;
        });

        // Handle italic text
        currentText = currentText.replace(/\*([^*]+)\*/g, (match, italic) => {
            const placeholder = `__ITALIC_${keyIndex}__`;
            elements.push(
                React.createElement('em', {
                    key: `italic_${keyIndex}`,
                    className: 'italic'
                }, italic)
            );
            keyIndex++;
            return placeholder;
        });

        // Handle links
        currentText = currentText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            const placeholder = `__LINK_${keyIndex}__`;
            elements.push(
                React.createElement('a', {
                    key: `link_${keyIndex}`,
                    href: url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'text-blue-600 hover:text-blue-800 underline'
                }, text)
            );
            keyIndex++;
            return placeholder;
        });

        // Split text and reconstruct with elements
        const parts = currentText.split(/(__(?:CODE|BOLD|ITALIC|LINK)_\d+__)/);
        const result: React.ReactNode[] = [];

        parts.forEach((part, index) => {
            const match = part.match(/__(?:CODE|BOLD|ITALIC|LINK)_(\d+)__/);
            if (match) {
                const elementIndex = parseInt(match[1]);
                const element = elements[elementIndex];
                if (element) {
                    result.push(element);
                }
            } else if (part) {
                result.push(part);
            }
        });

        return result.length > 0 ? result : [text];
    }

    static truncateMessage(content: string, maxLength: number = 100): string {
        if (content.length <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength).trim() + '...';
    }

    static getMessageSummary(message: Message): string {
        const preview = this.truncateMessage(message.content, 50);
        const time = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `[${time}] ${message.role}: ${preview}`;
    }

    static filterMessagesByRole(messages: Message[], role: 'user' | 'assistant' | 'system'): Message[] {
        return messages.filter(msg => msg.role === role);
    }

    static getConversationStats(messages: Message[]): {
        totalMessages: number;
        userMessages: number;
        assistantMessages: number;
        systemMessages: number;
        avgMessageLength: number;
        conversationDuration: number; // in minutes
    } {
        const userMessages = this.filterMessagesByRole(messages, 'user').length;
        const assistantMessages = this.filterMessagesByRole(messages, 'assistant').length;
        const systemMessages = this.filterMessagesByRole(messages, 'system').length;

        const totalLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
        const avgMessageLength = messages.length > 0 ? Math.round(totalLength / messages.length) : 0;

        let conversationDuration = 0;
        if (messages.length > 1) {
            const firstMessage = messages[0];
            const lastMessage = messages[messages.length - 1];
            conversationDuration = Math.round(
                (lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime()) / 60000
            );
        }

        return {
            totalMessages: messages.length,
            userMessages,
            assistantMessages,
            systemMessages,
            avgMessageLength,
            conversationDuration
        };
    }

    static exportMessagesToMarkdown(messages: Message[]): string {
        const header = `# AI Assistant Conversation\n\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`;

        const messageTexts = messages.map(msg => {
            const role = msg.role.charAt(0).toUpperCase() + msg.role.slice(1);
            const timestamp = msg.timestamp.toLocaleString();
            return `## ${role} (${timestamp})\n\n${msg.content}\n\n`;
        });

        return header + messageTexts.join('');
    }

    static searchMessages(messages: Message[], query: string): Message[] {
        const lowercaseQuery = query.toLowerCase().trim();
        if (!lowercaseQuery) return messages;

        return messages.filter(msg =>
            msg.content.toLowerCase().includes(lowercaseQuery) ||
            msg.role.toLowerCase().includes(lowercaseQuery)
        );
    }
}