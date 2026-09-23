import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function DripSyncPreview() {
  return (
    <section className="py-12 sm:py-16 md:py-20">
      <div className="container px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass-card p-4 sm:p-6 md:p-8 rounded-2xl"
        >
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div className="text-center md:text-left order-2 md:order-1">
              <h2 className="display text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 neon-text-violet">Sync Your Drip</h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-4 sm:mb-6">
                From rack to render—create your avatar and take it on-chain with our Genesis-exclusive avatar studio.
              </p>
              <Link 
                to={createPageUrl("DripSync")} 
                className="w-full sm:w-auto btn-neon-primary inline-flex items-center justify-center px-6 py-3 rounded-full min-h-[44px] text-sm sm:text-base"
              >
                Enter DripSync Closet <Sparkles className="ml-2 w-4 h-4" />
              </Link>
            </div>
            
            <div className="order-1 md:order-2 relative group">
              <div className="w-full h-80 sm:h-96 rounded-xl overflow-hidden neon-border bg-gradient-to-br from-purple-900/20 to-blue-900/20 relative">
                {/* Desktop iframe */}
                <iframe
                  src="https://skrtlifeio.readyplayer.me/avatar?frameApi&quickStart"
                  allow="camera *; microphone *; clipboard-read; clipboard-write; fullscreen *"
                  className="w-full h-full border-0 hidden md:block"
                  loading="lazy"
                  title="Ready Player Me Avatar Creator"
                />
                
                {/* Mobile View: Static image with a launch button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm md:hidden">
                  <img src="https://images.unsplash.com/photo-1639747534195-2bd82a2f3922?q=80&w=800&auto=format&fit=crop" alt="Avatar Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="absolute bottom-6 btn-neon-secondary text-base">
                        <Play className="w-5 h-5 mr-2" />
                        Create Your Avatar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[80vh] p-0 bg-transparent border-0">
                       <iframe
                          src="https://skrtlifeio.readyplayer.me/avatar?frameApi&quickStart"
                          title="Ready Player Me Avatar Creator"
                          className="w-full h-full border-0 rounded-lg"
                          allow="camera *; microphone *; clipboard-write"
                        />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}