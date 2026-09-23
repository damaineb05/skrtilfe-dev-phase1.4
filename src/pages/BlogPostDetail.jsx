import React, { useState, useEffect } from "react";
import { BlogPost } from "@/entities/BlogPost";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactMarkdown from "react-markdown";
import { Loader2, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BlogPostDetailPage() {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      const slug = new URLSearchParams(window.location.search).get("slug");
      if (!slug) {
        setError("No post slug provided.");
        setIsLoading(false);
        return;
      }

      try {
        const results = await BlogPost.filter({ slug: slug, status: "published" });
        if (results.length > 0) {
          setPost(results[0]);
        } else {
          setError("Post not found.");
        }
      } catch (err) {
        setError("Failed to fetch post.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12 text-center">
        <p className="text-red-500">{error}</p>
        <Link to={createPageUrl("Blog")} className="text-green-400 hover:underline mt-4 inline-block">
          &larr; Back to Blog
        </Link>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0F1E] to-[#050810]">
      <div className="container py-12 px-4">
        <article className="max-w-4xl mx-auto">
          <header className="mb-10">
            <Link to={createPageUrl("Blog")} className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all posts
            </Link>
            <div className="flex items-center gap-4 mb-4">
                <Badge className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-3 py-1">{post.category}</Badge>
                <p className="text-sm text-white/50">{new Date(post.created_date).toLocaleDateString()}</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
            <p className="text-lg text-white/60 leading-relaxed">{post.excerpt}</p>
          </header>
          
          <div className="aspect-video rounded-2xl overflow-hidden mb-10 border border-white/10">
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-invert prose-lg max-w-none 
              prose-headings:text-white prose-headings:font-semibold 
              prose-a:text-blue-400 hover:prose-a:text-blue-300
              prose-strong:text-white
              prose-blockquote:border-l-blue-400 prose-blockquote:text-white/70
              prose-code:bg-white/5 prose-code:text-blue-300 prose-code:px-2 prose-code:py-1 prose-code:rounded
              prose-img:rounded-xl prose-img:border prose-img:border-white/10
              prose-p:text-white/70 prose-p:leading-relaxed
              ">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}