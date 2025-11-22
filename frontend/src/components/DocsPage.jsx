import React from 'react';

const DocsPage = () => {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', backgroundColor: '#000' }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: '#1f2937',
        borderRight: '1px solid #374151',
        padding: '2rem 1.5rem',
        overflowY: 'auto',
        position: 'sticky',
        top: '64px',
        height: 'calc(100vh - 64px)'
      }} className="docs-sidebar">
        <h3 style={{ 
          fontSize: '0.875rem', 
          fontWeight: 'bold', 
          color: '#9ca3af', 
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Documentation
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
          Everything you need to build faster with CodeGen AI.
        </p>

        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search docs..."
            className="input"
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
            Getting started
          </h4>
          <div style={{ marginLeft: '0.5rem' }}>
            <div style={{
              fontSize: '0.875rem',
              color: 'white',
              backgroundColor: '#374151',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              marginBottom: '0.25rem',
              cursor: 'pointer'
            }}>
              Overview
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#9ca3af',
              padding: '0.5rem 0.75rem',
              cursor: 'pointer'
            }}>
              Quickstart
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#9ca3af',
              padding: '0.5rem 0.75rem',
              cursor: 'pointer'
            }}>
              Concepts
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
            Core features
          </h4>
          <div style={{ marginLeft: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
              Chat workspace
            </div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
              Code generation
            </div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
              Refactors & reviews
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
            API
          </h4>
          <div style={{ marginLeft: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
              Authentication
            </div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
              Completions API
            </div>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
              Streaming
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
            Docs / Getting started / Overview
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>Overview</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                border: '1px solid #374151',
                color: 'white'
              }}>
                View API reference
              </button>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                Open in dashboard
              </button>
            </div>
          </div>

          <p style={{ color: '#d1d5db', fontSize: '1.125rem', marginBottom: '2rem', lineHeight: '1.8' }}>
            Learn how to use CodeGen AI to generate, refactor, and review code through the chat
            workspace and API. This guide walks you from first request to production usage.
          </p>

          <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ fontSize: '1.5rem' }}>📖</div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                  Estimated read: 6 min
                </p>
                <p style={{ color: '#d1d5db' }}>
                  Best for: engineers integrating AI into existing codebases
                </p>
              </div>
            </div>
          </div>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
              1. Create your first workspace
            </h2>
            <p style={{ color: '#d1d5db', marginBottom: '1rem', lineHeight: '1.8' }}>
              After signing up, you land in the Dashboard. Workspaces keep your prompts, code context, and usage isolated across projects or teams.
            </p>
            <ul style={{ color: '#d1d5db', marginLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Click <strong>New workspace</strong> in the left sidebar</li>
              <li>Name it after your repo or project (for example, web-app-dashboard)</li>
              <li>Optionally paste a link to your Git repository so the assistant can reference its structure</li>
            </ul>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
              2. Chat with the coding assistant
            </h2>
            <p style={{ color: '#d1d5db', marginBottom: '1rem', lineHeight: '1.8' }}>
              Use the chat panel to describe what you want to build. The model responds with language-specific snippets, explanations, and follow-up suggestions.
            </p>

            <div className="code-block" style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                Example API Request
              </div>
              <pre style={{ color: '#22c55e' }}>
{`POST https://api.codegen.ai/v1/chat
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "workspace_id": "ws_123",
  "messages": [
    { "role": "user", "content": "Generate a React login component" }
  ]
}`}
              </pre>
            </div>

            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ color: '#60a5fa' }}>💡</div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#93c5fd', marginBottom: '0.25rem' }}>
                    Tip: bring your own code
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
                    Paste existing functions, components, or files directly into the chat. Ask the model to refactor, document, or add tests while preserving behavior.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
              3. Call the API from your app
            </h2>
            <p style={{ color: '#d1d5db', marginBottom: '1rem', lineHeight: '1.8' }}>
              Use the Completions API to generate code from within your own tools or CI pipelines.
            </p>

            <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#9ca3af' }}>Field</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#9ca3af' }}>Type</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#9ca3af' }}>Description</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.875rem' }}>
                  <tr style={{ borderBottom: '1px solid #374151' }}>
                    <td style={{ padding: '0.75rem', color: 'white', fontFamily: 'monospace' }}>model</td>
                    <td style={{ padding: '0.75rem', color: '#9ca3af' }}>string</td>
                    <td style={{ padding: '0.75rem', color: '#d1d5db' }}>Name of the code model</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #374151' }}>
                    <td style={{ padding: '0.75rem', color: 'white', fontFamily: 'monospace' }}>prompt</td>
                    <td style={{ padding: '0.75rem', color: '#9ca3af' }}>string</td>
                    <td style={{ padding: '0.75rem', color: '#d1d5db' }}>Instruction for code generation</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', color: 'white', fontFamily: 'monospace' }}>max_tokens</td>
                    <td style={{ padding: '0.75rem', color: '#9ca3af' }}>number</td>
                    <td style={{ padding: '0.75rem', color: '#d1d5db' }}>Upper bound on generated tokens</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid #374151',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Was this page helpful?</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                border: '1px solid #374151',
                color: 'white'
              }}>
                Yes
              </button>
              <button className="btn" style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                border: '1px solid #374151',
                color: 'white'
              }}>
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;