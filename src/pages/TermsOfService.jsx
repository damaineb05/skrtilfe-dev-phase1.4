import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#050810] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <p className="text-blue-300/60 text-sm uppercase tracking-widest mb-4">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-white/50 text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
        </header>
        
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 prose prose-invert prose-lg max-w-none 
            prose-headings:text-white prose-headings:font-semibold 
            prose-a:text-blue-400 hover:prose-a:text-blue-300
            prose-strong:text-white
            prose-p:text-white/70 prose-p:leading-relaxed
            "
        >

        <h2>1. Agreement to Terms</h2>
        <p>By using our website and services, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the services.</p>

        <h2>2. Intellectual Property Rights</h2>
        <p>Unless otherwise indicated, the Site is our proprietary property. All digital assets, including NFTs, are subject to their own ownership rules on the blockchain. When you purchase an NFT, you own the token, but we retain the intellectual property rights to the underlying artwork unless otherwise specified.</p>

        <h2>3. User Responsibilities</h2>
        <p>You are responsible for the security of your own crypto wallet. We are not responsible for any losses incurred due to wallet compromise or user error. All transactions on the blockchain are final.</p>

          <h2>4. Governing Law</h2>
          <p>These Terms shall be governed by and defined following the laws of the jurisdiction in which our company is based, without regard to its conflict of law principles.</p>
        </div>
      </div>
    </div>
  );
}