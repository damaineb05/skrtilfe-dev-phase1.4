import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function SizeGuideModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-3xl bg-white rounded-3xl overflow-hidden z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-black">Size Guide</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Measurement Instructions */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg text-black mb-4">How to Measure</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-medium text-black mb-2">Chest</p>
                    <p className="text-sm text-gray-600">Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                  </div>
                  <div>
                    <p className="font-medium text-black mb-2">Waist</p>
                    <p className="text-sm text-gray-600">Measure around your natural waistline, keeping the tape comfortably loose.</p>
                  </div>
                  <div>
                    <p className="font-medium text-black mb-2">Length</p>
                    <p className="text-sm text-gray-600">Measure from the highest point of the shoulder down to the hem.</p>
                  </div>
                  <div>
                    <p className="font-medium text-black mb-2">Sleeve</p>
                    <p className="text-sm text-gray-600">Measure from the center back neck to the end of the shoulder and down to the wrist.</p>
                  </div>
                </div>
              </div>

              {/* Size Chart */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg text-black mb-4">Size Chart (inches)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-black">Size</th>
                        <th className="text-center py-3 px-4 font-semibold text-black">Chest</th>
                        <th className="text-center py-3 px-4 font-semibold text-black">Waist</th>
                        <th className="text-center py-3 px-4 font-semibold text-black">Length</th>
                        <th className="text-center py-3 px-4 font-semibold text-black">Sleeve</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { size: 'XS', chest: '34-36', waist: '28-30', length: '27', sleeve: '33' },
                        { size: 'S', chest: '36-38', waist: '30-32', length: '28', sleeve: '34' },
                        { size: 'M', chest: '38-40', waist: '32-34', length: '29', sleeve: '35' },
                        { size: 'L', chest: '40-42', waist: '34-36', length: '30', sleeve: '36' },
                        { size: 'XL', chest: '42-44', waist: '36-38', length: '31', sleeve: '37' },
                        { size: 'XXL', chest: '44-46', waist: '38-40', length: '32', sleeve: '38' },
                      ].map((row) => (
                        <tr key={row.size} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-black">{row.size}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{row.chest}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{row.waist}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{row.length}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{row.sleeve}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fit Notes */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-black mb-3">Fit Notes</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Model is 6'0" / 183cm and wears size M</li>
                  <li>• Designed for a relaxed, comfortable fit</li>
                  <li>• Size up for an oversized look</li>
                  <li>• All measurements are approximate and may vary slightly</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}