import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is Skrtlife?",
    a: "Skrtlife is a digital society where streetwear and Web3 collide. We offer limited-run physical apparel, digital wearables (NFTs), and a platform for creators to express their identity across both worlds."
  },
  {
    q: "How do I get a digital wearable?",
    a: "Digital wearables can be purchased in our Shop. Some are bundled with physical items, while others are sold as standalone 3D NFTs. You can manage and view your collection in the Genesis NFT Marketplace."
  },
  {
    q: "What blockchain do you use?",
    a: "Our primary contracts are on the Ethereum blockchain. We also support Polygon for certain collections to ensure lower gas fees and faster transactions."
  },
  {
    q: "How does shipping work for physical items?",
    a: "We ship globally. Standard shipping takes 5-7 business days domestically, and 10-15 business days internationally. You'll receive a tracking number once your order is fulfilled."
  },
  {
    q: "Can I return an item?",
    a: "Physical items can be returned within 30 days of receipt, provided they are in unworn, original condition. Due to their on-chain nature, NFT sales are final and cannot be returned."
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#050810] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <p className="text-blue-300/60 text-sm uppercase tracking-widest mb-4">Help Center</p>
          <h1 className="text-4xl font-bold text-white mb-3">Frequently Asked Questions</h1>
          <p className="text-white/60">Find answers to common questions about Skrtlife.</p>
        </header>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-white/70 leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}