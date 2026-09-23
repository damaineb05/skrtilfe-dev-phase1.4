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
  X,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";

// System prompt for the assistant
const SYSTEM_PROMPT = `You are the Skrtlife AI Assistant, an expert in:
- DripSync avatar customization and 3D assets
- Genesis Hub NFT marketplace
- Ready Player Me integration
- React/Three.js development
- E-commerce and product management

When asked to generate code, provide clean, modular React/JSX code.
When asked about assets, help with GLB/FBX optimization and registration.
When asked about business, provide guidance on drops, collections, and marketplace strategy.

Always be helpful, concise, and actionable. If you generate code, wrap it in triple backticks with the language specified.`;

export default function AssistantPanel({ isOpen, onClose, onMinimize, isMinimized }) {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch recent tasks
  const { data: recentTasks } = useQuery({
    queryKey: ['assistant-tasks'],
    queryFn: () => base44.entities.AssistantTask.list('-created_date', 10),
    enabled: activeTab === 'history'
  });

  // Fetch pending patches
  const { data: pendingPatches } = useQuery({
    queryKey: ['code-patches', 'pending'],
    queryFn: () => base44.entities.CodePatch.filter({ status: 'pending' }),
    enabled: activeTab === 'patches'
  });



  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
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
      // Build context from recent messages
      const contextMessages = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
      
      const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation context:\n${contextMessages}\n\nUser: ${userInput}\n\nAssistant:`;

      // Call LLM via Base44 integration
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

      // Save task and patches in background (don't block UI)
      try {
        const user = await base44.auth.me();
        const codeBlocks = extractCodeFromResponse(response);
        
        // Create task record
        await base44.entities.AssistantTask.create({
          prompt: userInput,
          reply: response,
          status: 'completed',
          code_generated: codeBlocks.length > 0
        });

        // Save code patches if any
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
    const isPng = file.name.toLowerCase().endsWith('.png') || file.name.toLowerCase().endsWith('.jpg');

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: `📁 Uploading: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      timestamp: new Date().toISOString()
    }]);

    try {
      // Upload file
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
  ];

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-[100]"
      >
        <Button
          onClick={onMinimize}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      className="fixed right-6 bottom-6 top-20 w-[420px] z-[100] flex flex-col"
    >
      <Card className="flex-1 flex flex-col bg-gray-900/95 backdrop-blur-xl border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Skrtlife Assistant</h3>
                <p className="text-xs text-gray-400">AI-powered helper</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={onMinimize} className="text-gray-400 hover:text-white">
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
            <TabsList className="grid grid-cols-3 bg-gray-800/50">
              <TabsTrigger value="chat" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Sparkles className="w-3 h-3 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="patches" className="text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                <FileCode className="w-3 h-3 mr-1" />
                Patches
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                <History className="w-3 h-3 mr-1" />
                History
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      onCopy={copyToClipboard}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="px-4 py-2 border-t border-gray-800">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {quickActions.map((action, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap text-xs border-gray-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50"
                      onClick={() => setInput(action.prompt)}
                    >
                      <action.icon className="w-3 h-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
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
                    className="border-gray-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask anything..."
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-cyan-500"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patches' && (
            <ScrollArea className="h-full p-4">
              <div className="space-y-3">
                {pendingPatches?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No pending code patches</p>
                  </div>
                )}
                {pendingPatches?.map((patch) => (
                  <PatchCard key={patch.id} patch={patch} onCopy={copyToClipboard} />
                ))}
              </div>
            </ScrollArea>
          )}

          {activeTab === 'history' && (
            <ScrollArea className="h-full p-4">
              <div className="space-y-3">
                {recentTasks?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No conversation history</p>
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
    </motion.div>
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
          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
          : message.isError
            ? 'bg-red-500/20 border border-red-500/30 text-red-300'
            : 'bg-gray-800 text-gray-200'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{textContent}</p>
        
        {codeBlocks.length > 0 && (
          <div className="mt-3 space-y-2">
            {codeBlocks.map((block, i) => (
              <div key={i} className="relative">
                <div className="flex items-center justify-between bg-gray-900 rounded-t-lg px-3 py-1">
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
                <pre className="bg-gray-950 rounded-b-lg p-3 overflow-x-auto text-xs">
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
    <Card className="bg-gray-800/50 border-gray-700 p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{patch.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="text-[10px] bg-purple-500/20 text-purple-400 border-purple-500/30">
              {patch.language}
            </Badge>
            <span className="text-xs text-gray-500">
              {new Date(patch.created_date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400"
        >
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
              <pre className="bg-gray-900 rounded-lg p-3 overflow-x-auto text-xs max-h-48">
                <code className="text-green-400">{patch.code}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(patch.code)}
                className="absolute top-2 right-2 h-7 text-xs border-gray-700"
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
    <Card className="bg-gray-800/50 border-gray-700 p-3">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          task.status === 'completed' ? 'bg-green-500/20' :
          task.status === 'failed' ? 'bg-red-500/20' : 'bg-yellow-500/20'
        }`}>
          {task.status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-400" /> :
           task.status === 'failed' ? <XCircle className="w-4 h-4 text-red-400" /> :
           <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white line-clamp-2">{task.prompt}</p>
          <div className="flex items-center gap-2 mt-1">
            {task.code_generated && (
              <Badge className="text-[10px] bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Code className="w-2.5 h-2.5 mr-1" />
                Code
              </Badge>
            )}
            <span className="text-xs text-gray-500">
              {new Date(task.created_date).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Helper functions
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