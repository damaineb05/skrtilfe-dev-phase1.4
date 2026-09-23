import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#050810] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <p className="text-blue-300/60 text-sm uppercase tracking-widest mb-4">Legal</p>
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-white/50 text-sm">Last Updated: {new Date().toLocaleDateString()}</p>
        </header>
        
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 prose prose-invert prose-lg max-w-none 
            prose-headings:text-white prose-headings:font-semibold 
            prose-a:text-blue-400 hover:prose-a:text-blue-300
            prose-strong:text-white
            prose-p:text-white/70 prose-p:leading-relaxed
            "
        >

        <h2>Introduction</h2>
        <p>Welcome to Skrtlife. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>

        <h2>Information We Collect</h2>
        <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes personal data, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.</p>

        <h2>Use of Your Information</h2>
        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to create and manage your account, process your orders, and email you regarding your account or order.</p>

        <h2>Blockchain Data</h2>
        <p>Please note that your interactions with the blockchain are public. Your wallet address will be publicly visible when you transact on-chain, such as when minting or trading NFTs. We are not responsible for the information that is broadcast to and recorded on a public blockchain.</p>
        
          <h2>Contact Us</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at: support@skrtlife.com</p>
        </div>
      </div>
    </div>
  );
}