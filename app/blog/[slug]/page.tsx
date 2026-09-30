import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { fetchBlogBySlug } from '@/lib/actions/blogs';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Blog Not Found | Yakda',
    };
  }

  // Extract a plain text description from content
  const description = blog.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';

  return {
    title: `${blog.title} | Yakda Blog`,
    description,
    openGraph: {
      title: `${blog.title} | Yakda Blog`,
      description,
      url: `https://yakdastationery.com/blog/${slug}`,
      images: blog.image ? [{ url: blog.image }] : [],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    }
  };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog || !blog.published) {
    notFound();
  }

  // Basic JSON-LD schema for Article
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    image: blog.image ? [blog.image] : [],
    datePublished: blog.created_at,
    dateModified: blog.updated_at || blog.created_at,
    author: {
      '@type': 'Person',
      name: blog.author || 'Yakda Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Yakda UAE',
      logo: {
        '@type': 'ImageObject',
        url: 'https://yakdastationery.com/images/logo.png',
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col pt-[104px] md:pt-[128px]">
        {/* Hero Section */}
        <div className="relative w-full h-[40vh] md:h-[50vh] min-h-[300px] bg-[#1A2A4E]">
          {blog.image && (
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              className="object-cover opacity-40 mix-blend-overlay"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A2A4E] via-[#1A2A4E]/60 to-transparent"></div>
          
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-[800px] mx-auto w-full px-margin-mobile pb-12 md:pb-16 text-center">
              <div className="flex items-center justify-center gap-3 text-white/80 text-xs md:text-sm font-semibold mb-6 uppercase tracking-widest">
                <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                <span>•</span>
                {blog.created_at && (
                  <span>{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                )}
                {blog.author && (
                  <>
                    <span>•</span>
                    <span>By {blog.author}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight md:leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                {blog.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <main className="flex-1 max-w-[800px] mx-auto w-full px-margin-mobile py-12 md:py-20">
          <article 
            className="blog-content max-w-none text-gray-800 leading-relaxed text-lg font-medium"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
          <style dangerouslySetInnerHTML={{__html: `
            .blog-content h1, .blog-content h2, .blog-content h3 {
              color: #1A2A4E;
              font-weight: 900;
              margin-top: 2.5rem;
              margin-bottom: 1rem;
              line-height: 1.3;
              font-family: Georgia, serif;
            }
            .blog-content h2 { font-size: 1.875rem; }
            .blog-content h3 { font-size: 1.5rem; }
            .blog-content p {
              margin-bottom: 1.5rem;
              color: #4b5563;
            }
            .blog-content a {
              color: #F08080;
              text-decoration: underline;
              font-weight: 600;
              transition: color 0.2s ease;
            }
            .blog-content a:hover {
              color: #E57A7A;
            }
            .blog-content img {
              border-radius: 1rem;
              box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
              margin: 3rem auto;
              width: 100%;
              object-fit: cover;
            }
            .blog-content ul, .blog-content ol {
              margin-bottom: 1.25rem;
              padding-left: 1.5rem;
            }
            .blog-content ul { list-style-type: disc; }
            .blog-content ol { list-style-type: decimal; }
            .blog-content li { margin-bottom: 0.5rem; }
            .blog-content blockquote {
              border-left: 4px solid #16A2D4;
              padding-left: 1rem;
              font-style: italic;
              color: #4b5563;
              margin: 1.5rem 0;
            }
          `}} />

          {/* Footer of the article */}
          <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1A2A4E] text-white flex items-center justify-center font-bold text-xl">
                {(blog.author || 'Y')[0].toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-[#1A2A4E]">{blog.author || 'Yakda Team'}</div>
                <div className="text-xs text-gray-500">Premium Stationery Experts</div>
              </div>
            </div>

            <Link href="/blog" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#1A2A4E] font-bold text-sm rounded-xl transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to all articles
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
