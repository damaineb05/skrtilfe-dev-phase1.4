import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SizeGuide() {
  const topSizes = [
    { size: "S", chest: "36-38 in", length: "28 in" },
    { size: "M", chest: "39-41 in", length: "29 in" },
    { size: "L", chest: "42-44 in", length: "30 in" },
    { size: "XL", chest: "45-48 in", length: "31 in" },
  ];
  
  const bottomSizes = [
    { size: "S", waist: "29-31 in", inseam: "30 in" },
    { size: "M", waist: "32-34 in", inseam: "31 in" },
    { size: "L", waist: "35-37 in", inseam: "32 in" },
    { size: "XL", waist: "38-41 in", inseam: "33 in" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#050810] py-16 px-4">
      <header className="text-center mb-12 max-w-3xl mx-auto">
        <p className="text-blue-300/60 text-sm uppercase tracking-widest mb-4">Sizing Information</p>
        <h1 className="text-4xl font-bold text-white mb-3">Size Guide</h1>
        <p className="text-white/60">Find your perfect fit. All measurements are approximate.</p>
      </header>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Tops & Hoodies</h2>
          </div>
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/70">Size</TableHead>
                  <TableHead className="text-white/70">Chest</TableHead>
                  <TableHead className="text-white/70">Body Length</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSizes.map(s => (
                  <TableRow key={s.size} className="border-white/10">
                    <TableCell className="text-white font-medium">{s.size}</TableCell>
                    <TableCell className="text-white/70">{s.chest}</TableCell>
                    <TableCell className="text-white/70">{s.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Pants & Bottoms</h2>
          </div>
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/70">Size</TableHead>
                  <TableHead className="text-white/70">Waist</TableHead>
                  <TableHead className="text-white/70">Inseam</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bottomSizes.map(s => (
                  <TableRow key={s.size} className="border-white/10">
                    <TableCell className="text-white font-medium">{s.size}</TableCell>
                    <TableCell className="text-white/70">{s.waist}</TableCell>
                    <TableCell className="text-white/70">{s.inseam}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}