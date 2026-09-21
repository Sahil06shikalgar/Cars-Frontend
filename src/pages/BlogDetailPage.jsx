import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore.jsx'
import { timeAgo } from '../store/data.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { AppBar } from '../components/AppBar.jsx'
import { Avatar, Badge, EmptyState } from '../components/ui.jsx'
import { NewspaperIcon, ClockIcon, TrendingUpIcon } from '../components/icons.jsx'
import { WhatsAppShareButton } from '../components/WhatsApp.jsx'

export function BlogDetailPage() {
  const { slug } = useParams()
  const { state, collectorById, refreshBlog } = useStore()
  const pageRef = useRef(null)
  useScrollReveal(pageRef, [slug])
  const [coverOk, setCoverOk] = useState(true)

  const blog = state.blogs.find((b) => b.slug === slug)

  // Deep link or a stale list: pull the full article once, which also bumps
  // the read counter server-side.
  useEffect(() => {
    if (!blog) refreshBlog(slug)
  }, [blog, slug, refreshBlog])

  if (!blog) {
    return (
      <>
        <AppBar eyebrow="Diecet Gardage" title="Article" back="/blogs" />
        <div className="page">
          <EmptyState
            icon={<NewspaperIcon size={28} />}
            title="Article loading"
            text="Grabbing the full story from the writing desk…"
            action={<Link className="btn btn--ghost" to="/blogs">All articles</Link>}
          />
        </div>
      </>
    )
  }

  const author = collectorById(blog.authorId) || blog.author

  return (
    <>
      <AppBar eyebrow={blog.category} title={blog.title} back="/blogs" />

      <div className="page blog-article" ref={pageRef}>
        <div className="blog-article__head" data-reveal>
          <div className="blog-article__badges">
            <Badge tone="orange">{blog.category}</Badge>
            {blog.featured ? <Badge tone="gold">Featured</Badge> : null}
          </div>
          <h1 className="blog-article__title">{blog.title}</h1>
          <p className="blog-article__excerpt">{blog.excerpt}</p>
          <div className="blog-article__meta">
            {author ? <Avatar user={author} size={34} /> : null}
            <span className="blog-article__by">
              <b>{author ? author.name : 'Diecet Editorial'}</b>
              <span className="muted">
                {timeAgo(blog.ts)} ago · {blog.readMinutes} min read ·{' '}
                <TrendingUpIcon size={12} /> {blog.views.toLocaleString('en')} reads
              </span>
            </span>
            <WhatsAppShareButton title={blog.title} label="Share on WhatsApp" />
          </div>
        </div>

        {blog.coverUrl && coverOk ? (
          <img
            className="blog-article__cover"
            src={blog.coverUrl}
            alt=""
            loading="lazy"
            draggable={false}
            onError={() => setCoverOk(false)}
          />
        ) : null}

        <div className="blog-article__body" data-reveal>
          {blog.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {blog.tags?.length ? (
          <div className="blog-article__tags" data-reveal>
            {blog.tags.map((t) => <span key={t} className="badge badge--neutral">#{t}</span>)}
          </div>
        ) : null}

        <div className="row gap wrap" data-reveal>
          <Link className="btn btn--ghost" to="/blogs">All articles</Link>
          <span className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, whiteSpace: 'nowrap' }}>
            <ClockIcon size={14} /> Read in {blog.readMinutes} min
          </span>
        </div>
      </div>
    </>
  )
}

export default BlogDetailPage