import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { fetchPublishedBlogs } from '@/lib/actions/blogs';

export const metadata: Metadata = {
  title: 'Yakda Blog | Stationery & Office Supplies Insights',
  description: 'Read the latest insights, tips, and news about stationery, office supplies, and executive furniture from the Yakda team.',
  openGraph: {
    title: 'Yakda Blog | Stationery & Office Supplies Insights',
    description: 'Read the latest insights, tips, and news about stationery, office supplies, and executive furniture from the Yakda team.',
    url: 'https://yakdastationery.com/blog',
  }
};

export default async function BlogListingPage() {
  const blogs = await fetchPublishedBlogs();

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Hero Banner Edge-to-Edge */}
      <div className="w-full bg-[#FFF7F5] relative overflow-hidden pt-[128px] pb-10 md:pt-[144px] md:pb-14 border-b border-[#FADBD8]/40">
        {/* Decorative background shapes mimicking the pastel circles */}
        <div className="absolute top-0 right-0 w-[50vw] md:w-[40vw] h-[150%] bg-[#FCE8E6] rounded-l-[100px] opacity-80 transform -translate-y-[10%] translate-x-[10%]"></div>
        <div className="absolute bottom-[-10%] right-[5%] w-[300px] h-[300px] bg-[#FADBD8] rounded-full blur-3xl opacity-60"></div>
        
        {/* Line art leaf placeholder on the left */}
        <div className="absolute top-[30%] left-[-2%] opacity-20 hidden md:block">
          <svg width="150" height="200" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10,100 C10,100 40,80 60,110 C80,140 30,140 10,100 Z" stroke="#E57A7A" strokeWidth="2" strokeLinecap="round"/>
            <path d="M60,110 C60,110 80,60 50,40 C20,20 0,60 10,100" stroke="#E57A7A" strokeWidth="2" strokeLinecap="round"/>
            <path d="M50,40 C50,40 60,10 80,10 C100,10 90,50 80,60" stroke="#E57A7A" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="max-w-[1280px] mx-auto px-margin-mobile relative z-10 flex items-center justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-4 mb-4 md:mb-6">
              <div className="w-12 h-[2px] bg-[#F08080]"></div>
              <span className="text-[#F08080] font-bold text-xs md:text-sm tracking-[0.2em] uppercase">The Yakda Journal</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1A2A4E] mb-4 md:mb-6 tracking-tight leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              The Yakda Journal
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md font-medium">
              Insights, guides, and updates from the world of premium stationery and office supplies.
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-margin-mobile pt-8 pb-16 md:pt-10 md:pb-20">
        {/* Blog Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[24px] border border-gray-100 shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-gray-300 mb-4">article</span>
            <h3 className="text-xl font-bold text-[#1A2A4E] mb-2">No articles yet</h3>
            <p className="text-gray-500">Check back soon for new insights and updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {blogs.map((blog) => {
              // Generate a random pastel color for the badge just for aesthetics like in the screenshot
              const colors = ['bg-[#FCE8E6] text-[#E57A7A]', 'bg-[#E0F2F1] text-[#00897B]', 'bg-[#F3E5F5] text-[#8E24AA]', 'bg-[#E8F5E9] text-[#43A047]'];
              const badgeColor = colors[blog.id.charCodeAt(0) % colors.length] || colors[0];

              return (
                <Link href={`/blog/${blog.slug}`} key={blog.id} className="group flex flex-col bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Blog Image */}
                  <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
                    {blog.image ? (
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#1A2A4E]/5 group-hover:scale-105 transition-transform duration-500">
                        <span className="material-symbols-outlined text-[48px] text-[#1A2A4E]/20">image</span>
                      </div>
                    )}
                  </div>

                  {/* Blog Content */}
                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        {blog.created_at ? new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                      </div>
                      <span className={`px-3 py-1 ${badgeColor} text-[10px] font-bold rounded-full`}>
                        {blog.author ? blog.author : 'Article'}
                      </span>
                    </div>
                    
                    <h2 className="text-xl md:text-[22px] font-bold text-[#1A2A4E] mb-3 line-clamp-2 group-hover:text-[#F08080] transition-colors leading-snug" style={{ fontFamily: 'Georgia, serif' }}>
                      {blog.title}
                    </h2>
                    
                    {/* Extract a short preview from content */}
                    <p className="text-gray-500 text-sm line-clamp-2 md:line-clamp-3 mb-6 flex-1 leading-relaxed">
                      {blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                    </p>

                    <div className="flex items-center gap-1 text-[#F08080] font-bold text-sm group-hover:gap-2 transition-all">
                      Read Article <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
