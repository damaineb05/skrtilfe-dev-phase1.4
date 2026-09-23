import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ArrowRight, Check } from 'lucide-react';
import { format } from 'date-fns';

const BlogPostCard = ({ post, isFeatured }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="h-full"
  >
    <Link to={createPageUrl(`BlogPostDetail?id=${post.id}`)} className="h-full">
      <div className={`glass-card rounded-2xl h-full flex flex-col group overflow-hidden hover:border-blue-400/30 transition-all ${isFeatured ? 'md:flex-row' : ''}`}>
        <div className={`relative ${isFeatured ? 'md:w-1/2' : 'aspect-video'} w-full shrink-0`}>
          <img 
            src={post.featured_image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80'} 
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-blue-500/90 text-white border-none font-medium backdrop-blur-sm px-3 py-1">
              {post.category}
            </Badge>
          </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex-grow">
            <h3 className={`font-semibold text-white group-hover:text-blue-300 transition-colors ${isFeatured ? 'text-2xl md:text-3xl mb-3' : 'text-xl mb-2'}`}>
              {post.title}
            </h3>
            <p className={`text-white/60 text-sm leading-relaxed ${isFeatured ? 'line-clamp-3' : 'line-clamp-2'}`}>
              {post.excerpt}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
            <span>{format(new Date(post.created_date), 'MMMM d, yyyy')}</span>
            <span className="flex items-center gap-1 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Read More <ArrowRight className="w-3 h-3"/>
            </span>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    await base44.entities.Newsletter.create({ email: newsletterEmail, signup_source: 'homepage' });
    setNewsletterLoading(false);
    setNewsletterDone(true);
  };

  const categories = ['All', 'News', 'Drops', 'Behind The Scenes', 'Community', 'Tech'];

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      try {
        const data = await base44.entities.BlogPost.filter({ status: 'published' }, '-created_date');
        setPosts(data);
        setFilteredPosts(data);
      } catch (error) {
        console.error("Failed to load blog posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);
  
  useEffect(() => {
    let tempPosts = [...posts];
    if (activeCategory !== 'All') {
      tempPosts = tempPosts.filter(p => p.category === activeCategory);
    }
    if (searchTerm) {
      tempPosts = tempPosts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredPosts(tempPosts);
  }, [searchTerm, activeCategory, posts]);

  const featuredPost = filteredPosts.find(p => p.is_featured) || filteredPosts[0];
  const otherPosts = filteredPosts.filter(p => p.id !== featuredPost?.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#050810]">
      <style>{`
        .glass-card {
          background: rgba(15,20,35,0.6);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(100,150,255,0.15);
        }
      `}</style>
      
      <div className="container py-16 px-4">
        {/* Header */}
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-blue-300/60 text-sm uppercase tracking-widest mb-4">Insights & Updates</p>
            <h1 className="text-5xl font-bold text-white mb-4">
              The Journal
            </h1>
            <p className="text-lg text-white/60 max-w-2xl leading-relaxed">
              News, insights, and stories from the Skrtlife community. Stay updated on the latest drops, features, and innovations.
            </p>
          </motion.div>
        </header>

        {/* Filters and Search */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-auto md:flex-grow max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input 
                placeholder="Search articles..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white/5 border-white/10 text-white rounded-lg h-11 pl-10 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map(cat => (
                <Button 
                  key={cat} 
                  variant={activeCategory === cat ? "default" : "ghost"}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-xl px-5 py-2 transition-all ${
                    activeCategory === cat 
                      ? 'bg-white text-black font-semibold' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 ledger-accent animate-spin mx-auto"/>
            <p className="mt-4 ledger-text-muted">Loading articles...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold ledger-text-primary mb-2">Featured Article</h2>
                  <div className="w-16 h-0.5 ledger-bg-primary"></div>
                </div>
                <BlogPostCard post={featuredPost} isFeatured={true} />
              </motion.div>
            )}
            
            {otherPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold ledger-text-primary mb-2">Latest Articles</h2>
                  <div className="w-16 h-0.5 ledger-bg-primary"></div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                    >
                      <BlogPostCard post={post} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {!featuredPost && otherPosts.length === 0 && (
              <motion.div 
                className="text-center py-20 ledger-card border-2 border-dashed ledger-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Search className="w-16 h-16 ledger-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-bold ledger-text-primary mb-2">No Articles Found</h3>
                <p className="ledger-text-secondary mb-6">Try a different search term or category.</p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('All');
                  }}
                  className="ledger-btn-secondary"
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </div>
        )}

        {/* Newsletter Signup Section */}
        <motion.div 
          className="mt-16 pt-12 border-t ledger-border"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold ledger-text-primary mb-4">Stay in the Loop</h3>
            <p className="ledger-text-secondary mb-6">
              Get the latest updates on new drops, exclusive content, and community highlights delivered to your inbox.
            </p>
            {newsletterDone ? (
              <div className="flex items-center justify-center gap-2 text-green-400 font-bold py-4">
                <Check className="w-5 h-5" /> You're subscribed!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white flex-1 h-12"
                />
                <Button type="submit" disabled={newsletterLoading} className="bg-white text-black hover:bg-gray-100 h-12 px-8 font-semibold">
                  {newsletterLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
                </Button>
              </form>
            )}
            <p className="text-xs text-white/30 mt-3">No spam. Unsubscribe at any time.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}