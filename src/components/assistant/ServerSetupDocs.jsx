/**
 * SkrtGPT External Server Setup Documentation
 * 
 * This documents how to set up a standalone Node/Express server 
 * using the official OpenAI SDK for production deployment outside of Base44.
 * 
 * PREREQUISITES:
 * - Node.js 18+
 * - npm or yarn
 * - OpenAI API key
 * - GitHub repository (for patch application)
 * 
 * INSTALLATION:
 * npm init -y
 * npm i express openai body-parser dotenv
 * 
 * ENVIRONMENT VARIABLES (.env):
 * OPENAI_API_KEY=sk-...
 * GITHUB_REPO_OWNER=yourOrgOrUser
 * GITHUB_REPO_NAME=yourRepo
 * GITHUB_WORKFLOW_SECRET=super-secret-for-verification
 * PATCH_STORAGE_URL=optional-url-to-store-patches
 * PORT=3000
 * DEFAULT_MODEL=gpt-4o
 * 
 * ENDPOINTS:
 * POST /api/assistant/ask       - Ask the assistant (returns human reply + machine JSON)
 * POST /api/assistant/patch     - Store a code patch
 * POST /api/assistant/apply-patch - Apply a stored patch (triggers GitHub Actions)
 * GET  /api/assistant/audit     - List recent audit entries
 * 
 * SECURITY CHECKLIST:
 * - OpenAI API key: server-only, never in client
 * - GitHub token: server-only, least privileges
 * - Approvals: require owner signature/HMAC for production apply
 * - Audit: persist every interaction
 * - Rate limiting: implement per-user limits
 * 
 * MODEL RECOMMENDATIONS:
 * - gpt-4o: Best quality for code generation
 * - gpt-4o-mini: Cheaper/faster, still good
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Key, GitBranch, Shield, Zap } from 'lucide-react';

export default function ServerSetupDocs() {
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">SkrtGPT Server Setup</h1>
        <p className="text-gray-600">External Node/Express server documentation</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Quick Start
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`npm init -y
npm i express openai body-parser dotenv`}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Environment Variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`OPENAI_API_KEY=sk-...
GITHUB_REPO_OWNER=yourOrgOrUser
GITHUB_REPO_NAME=yourRepo
GITHUB_WORKFLOW_SECRET=super-secret
PORT=3000
DEFAULT_MODEL=gpt-4o`}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge>POST</Badge>
            <code>/api/assistant/ask</code>
            <span className="text-gray-500">- Ask the assistant</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge>POST</Badge>
            <code>/api/assistant/patch</code>
            <span className="text-gray-500">- Store a code patch</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge>POST</Badge>
            <code>/api/assistant/apply-patch</code>
            <span className="text-gray-500">- Apply stored patch</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">GET</Badge>
            <code>/api/assistant/audit</code>
            <span className="text-gray-500">- Audit log</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✅ OpenAI API key: server-only, never in client</li>
            <li>✅ GitHub token: server-only, least privileges</li>
            <li>✅ Approvals: require HMAC for production apply</li>
            <li>✅ Audit: persist every interaction</li>
            <li>✅ Rate limiting: implement per-user limits</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            GitHub Action (apply-patch.yml)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`name: Apply Code Patch
on:
  repository_dispatch:
    types: [apply-patch]
jobs:
  apply:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Fetch and apply patch
        run: |
          curl -s "\${{ github.event.client_payload.patch_url }}" > patch.diff
          git apply patch.diff
      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          title: "[SkrtGPT] \${{ github.event.client_payload.title }}"
          branch: skrtgpt/patch-\${{ github.run_id }}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}