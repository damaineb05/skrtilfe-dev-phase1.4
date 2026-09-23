import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot,
  Send,
  Upload,
  Code,
  Sparkles,
  FileCode,
  Package,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  History,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from '../components/admin/AdminLayout';
import AdminProtectedRoute from '../components/admin/AdminProtectedRoute';

const SYSTEM_PROMPT = `SYSTEM PROMPT — SkrtGPT (Strict Code & Patch Mode)

You are SkrtGPT — the Skrtlife code & deployment assistant. For every user request you MUST produce:
  1) A short human-readable explanation (1–3 sentences) of what you will do or have done.
  2) A MACHINE-READABLE JSON object EXACTLY as described below. This JSON must appear as the last top-level content in your response. No extra trailing text after the JSON.

The JSON schema (MUST match exactly):
{
  "reply": "<short human-friendly explanation string>",
  "actions": [
    {
      "type": "create_file" | "modify_file" | "patch_file" | "delete_file" | "run_command" | "queue_job",
      "path": "<unix-style path (required for file actions)>",
      "patch": "<string: unified-diff for patch_file OR full file content for create_file/modify_file. Use \\n for newlines>",
      "description": "<short description of the change>",
      "requires_approval": true|false,
      "metadata": {}
    }
  ],
  "confidence": 0.0-1.0
}

Rules:
- MUST return valid JSON that parses with JSON.parse(...). If unable, respond with: { "error": "unable_to_generate_json", "explanation": "<why>" }
- For file changes, prefer unified diff strings under "patch" when modifying existing files. For new files, include full file contents under "patch" with "type":"create_file".
- If an action will delete files or perform production deploys, set "requires_approval": true.
- Do not include base64, external URLs, or binary blobs in JSON output.
- Keep "reply" short (1–3 sentences). The JSON is the authoritative machine-readable contract.
- Use "confidence" to express certainty (0.0 = unsure, 1.0 = confident).
- If you need repo structure, say "NEED_REPO_STRUCTURE" in reply and return: { "reply":"NEED_REPO_STRUCTURE", "actions": [], "confidence": 0.0 }

Expertise areas:
- DripSync avatar customization and 3D assets
- Genesis Hub NFT marketplace
- Ready Player Me integration
- React/Three.js development
- E-commerce and product management

Personality: concise, precise, and safety-first.`;

function AdminAssistantContent() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data: recentTasks } = useQuery({
    queryKey: ['assistant-tasks'],
    queryFn: () => base44.entities.AssistantTask.list('-created_date', 10),
    enabled: activeTab === 'history'
  });

  const { data: pendingPatches } = useQuery({
    queryKey: ['code-patches', 'pending'],
    queryFn: () => base44.entities.CodePatch.filter({ status: 'pending' }),
    enabled: activeTab === 'patches'
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hey! I'm the Skrtlife Assistant. I can help you:\n\n• Generate React components\n• Process GLB/3D assets\n• Plan drops and collections\n• Answer questions about DripSync & Genesis Hub\n\nWhat would you like to work on?",
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  const extractCodeFromResponse = (text) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const matches = [];
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      matches.push({
        language: match[1] || 'javascript',
        code: match[2].trim()
      });
    }
    return matches;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const contextMessages = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
      const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation context:\n${contextMessages}\n\nUser: ${userInput}\n\nAssistant:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        add_context_from_internet: false
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      try {
        const codeBlocks = extractCodeFromResponse(response);
        
        await base44.entities.AssistantTask.create({
          prompt: userInput,
          reply: response,
          status: 'completed',
          code_generated: codeBlocks.length > 0
        });

        for (const block of codeBlocks) {
          await base44.entities.CodePatch.create({
            title: `Generated from: "${userInput.substring(0, 50)}..."`,
            description: `Auto-generated code from assistant conversation`,
            code: block.code,
            language: block.language,
            status: 'pending'
          });
        }
      } catch (saveError) {
        console.warn('Failed to save task/patches:', saveError);
      }

    } catch (error) {
      console.error('Assistant error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isGlb = file.name.toLowerCase().endsWith('.glb');

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: `📁 Uploading: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      timestamp: new Date().toISOString()
    }]);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✅ Uploaded successfully!\n\n**File:** ${file.name}\n**URL:** ${file_url}\n\n${isGlb ? 'This GLB can be used in DripSync or added to a collection. Want me to help register it?' : 'Asset ready for use.'}`,
        timestamp: new Date().toISOString()
      }]);

      toast({ title: "Asset uploaded", description: file.name });
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Upload failed: ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    }

    e.target.value = '';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const quickActions = [
    { label: 'Generate Component', prompt: 'Generate a React component for ', icon: Code },
    { label: 'Plan a Drop', prompt: 'Help me plan a drop for ', icon: Package },
    { label: 'DripSync Help', prompt: 'How do I add a wearable to DripSync?', icon: Sparkles },
    { label: 'Optimize GLB', prompt: 'How do I optimize a GLB file for web?', icon: Zap },
  ];

  return (
    <AdminLayout currentPage="assistant">
      <div className="h-[calc(100vh-140px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold theme-text">AI Assistant</h1>
              <p className="text-sm theme-text-secondary">Your intelligent helper for Skrtlife platform</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Chat Area */}
          <Card className="flex-1 flex flex-col theme-bg-card theme-border overflow-hidden">
            {/* Tabs */}
            <div className="p-4 border-b theme-border">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="chat" className="text-sm">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="patches" className="text-sm">
                    <FileCode className="w-4 h-4 mr-2" />
                    Code Patches
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-sm">
                    <History className="w-4 h-4 mr-2" />
                    History
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4 max-w-3xl mx-auto">
                      {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} onCopy={copyToClipboard} />
                      ))}
                      {isLoading && (
                        <div className="flex items-center gap-2 text-sky-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Quick Actions */}
                  <div className="px-6 py-3 border-t theme-border">
                    <div className="flex gap-2 overflow-x-auto pb-2 max-w-3xl mx-auto">
                      {quickActions.map((action, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap text-xs theme-button-secondary"
                          onClick={() => setInput(action.prompt)}
                        >
                          <action.icon className="w-3 h-3 mr-1" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="p-6 border-t theme-border">
                    <div className="flex gap-3 max-w-3xl mx-auto">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".glb,.png,.jpg,.jpeg"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="theme-button-secondary"
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask anything about Skrtlife..."
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="bg-sky-500 hover:bg-sky-600 text-white"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'patches' && (
                <ScrollArea className="h-full p-6">
                  <div className="space-y-3 max-w-3xl mx-auto">
                    {pendingPatches?.length === 0 && (
                      <div className="text-center py-12 theme-text-secondary">
                        <FileCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No pending code patches</p>
                        <p className="text-sm">Generated code will appear here</p>
                      </div>
                    )}
                    {pendingPatches?.map((patch) => (
                      <PatchCard key={patch.id} patch={patch} onCopy={copyToClipboard} />
                    ))}
                  </div>
                </ScrollArea>
              )}

              {activeTab === 'history' && (
                <ScrollArea className="h-full p-6">
                  <div className="space-y-3 max-w-3xl mx-auto">
                    {recentTasks?.length === 0 && (
                      <div className="text-center py-12 theme-text-secondary">
                        <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No conversation history</p>
                        <p className="text-sm">Your past conversations will appear here</p>
                      </div>
                    )}
                    {recentTasks?.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function MessageBubble({ message, onCopy }) {
  const isUser = message.role === 'user';
  const codeBlocks = message.role === 'assistant' ? extractCodeBlocks(message.content) : [];
  const textContent = message.role === 'assistant' ? removeCodeBlocks(message.content) : message.content;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-sky-500 text-white'
          : message.isError
            ? 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300'
            : 'theme-bg-secondary theme-text'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{textContent}</p>
        
        {codeBlocks.length > 0 && (
          <div className="mt-3 space-y-2">
            {codeBlocks.map((block, i) => (
              <div key={i} className="relative">
                <div className="flex items-center justify-between bg-gray-800 rounded-t-lg px-3 py-1">
                  <span className="text-xs text-gray-400">{block.language}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(block.code)}
                    className="h-6 px-2 text-xs text-gray-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <pre className="bg-gray-900 rounded-b-lg p-3 overflow-x-auto text-xs">
                  <code className="text-green-400">{block.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PatchCard({ patch, onCopy }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="theme-bg-secondary theme-border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium theme-text truncate">{patch.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {patch.language}
            </Badge>
            <span className="text-xs theme-text-secondary">
              {new Date(patch.created_date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="relative">
              <pre className="bg-gray-900 rounded-lg p-3 overflow-x-auto text-xs max-h-64">
                <code className="text-green-400">{patch.code}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(patch.code)}
                className="absolute top-2 right-2 h-7 text-xs"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function TaskCard({ task }) {
  return (
    <Card className="theme-bg-secondary theme-border p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
          task.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
        }`}>
          {task.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" /> :
           task.status === 'failed' ? <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" /> :
           <Loader2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 animate-spin" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm theme-text line-clamp-2">{task.prompt}</p>
          <div className="flex items-center gap-2 mt-2">
            {task.code_generated && (
              <Badge variant="secondary" className="text-xs">
                <Code className="w-3 h-3 mr-1" />
                Code Generated
              </Badge>
            )}
            <span className="text-xs theme-text-secondary">
              {new Date(task.created_date).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function extractCodeBlocks(text) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const matches = [];
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    matches.push({
      language: match[1] || 'javascript',
      code: match[2].trim()
    });
  }
  return matches;
}

function removeCodeBlocks(text) {
  return text.replace(/```(\w+)?\n[\s\S]*?```/g, '').trim();
}

export default function AdminAssistant() {
  return (
    <AdminProtectedRoute>
      <AdminAssistantContent />
    </AdminProtectedRoute>
  );
}