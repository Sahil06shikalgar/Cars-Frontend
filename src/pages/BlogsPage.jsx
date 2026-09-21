import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore.jsx'
import { timeAgo } from '../store/data.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { AppBar } from '../components/AppBar.jsx'
import { Badge, Chip, EmptyState } from '../components/ui.jsx'
import { NewspaperIcon, ClockIcon, TrendingUpIcon, ArrowUpRightIcon } from '../components/icons.jsx'
import { WhatsAppShareButton } from '../components/WhatsApp.jsx'

function BlogCard({ blog, author, wide = false }) {
  const [coverOk, setCoverOk] = useState(true)
  return (
    <article className={`blog-card ${wide ? 'blog-card--banner' : ''}`.trim()}>
      <Link className="blog-card__media" to={`/blogs/${blog.slug}`} aria-hidden="true" tabIndex={-1}>
        {blog.coverUrl && coverOk ? (
          <img
            className="blog-card__cover"
            src={blog.coverUrl}
            alt=""
            loading="lazy"
            draggable={false}
            onError={() => setCoverOk(false)}
          />
        ) : (
          <span className="blog-card__fallback">
            <NewspaperIcon size={26} />
          </span>
        )}
      </Link>
      <div className="blog-card__body">
        <div className="blog-card__meta">
          <Badge tone="orange">{blog.category}</Badge>
          <span className="muted" style={{ fontSize: 12 }}>
            <ClockIcon size={12} /> {blog.readMinutes} min read
          </span>
        </div>
        <Link className="blog-card__title" to={`/blogs/${blog.slug}`}>
          {blog.title} <ArrowUpRightIcon size={14} className="blog-card__arrow" />
        </Link>
        <p className="blog-card__excerpt">{blog.excerpt}</p>
        <div className="blog-card__foot">
          <span className="blog-card__user">
            {author ? author.name : 'Diecet Editorial'} · {timeAgo(blog.ts)} ago
          </span>
          <span className="blog-card__views">
            <TrendingUpIcon size={12} /> {blog.views.toLocaleString('en')} reads
          </span>
        </div>
        <WhatsAppShareButton title={blog.title} label="Share" className="btn--sm" />
      </div>
    </article>
  )
}

export function BlogsPage() {
  const { state, collectorById } = useStore()
  const [category, setCategory] = useState('All')
  const pageRef = useRef(null)
  useScrollReveal(pageRef, [category])

  const categories = useMemo(
    () => [...new Set(state.blogs.map((b) => b.category))].sort(),
    [state.blogs]
  )

  const filtered = useMemo(
    () =>
      state.blogs
        .filter((b) => category === 'All' || b.category === category)
        .slice()
        .sort((a, b) => Number(b.featured) - Number(a.featured) || b.ts - a.ts),
    [state.blogs, category]
  )

  const [featured, ...rest] = filtered

  return (
    <>
      <AppBar
        eyebrow="Diecet Gardage"
        title="Blogs"
        actions={
          <Link className="appbar__action appbar__action--primary" to="/feed">
            <NewspaperIcon size={15} /> Explore
          </Link>
        }
      />

      <div className="page" ref={pageRef}>
        <div className="section__head" style={{ alignItems: 'flex-end' }}>
          <div>
            <h2 className="h-section">Stories, guides &amp; news</h2>
            <p className="muted" style={{ fontSize: 13, letterSpacing: 0, textTransform: 'none' }}>
              Collecting tips, rarity deep-dives and community headlines.
            </p>
          </div>
        </div>

        {categories.length ? (
          <div className="row gap wrap" role="group" aria-label="Filter articles by category">
            <Chip active={category === 'All'} onClick={() => setCategory('All')}>All</Chip>
            {categories.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>{c}</Chip>
            ))}
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState
            icon={<NewspaperIcon size={28} />}
            title="No articles yet"
            text="Check back soon — the editorial team is writing."
          />
        ) : (
          <div className="blog-grid" data-reveal="stagger">
            {featured ? (
              <BlogCard
                blog={featured}
                author={featured.author || collectorById(featured.authorId)}
                wide
              />
            ) : null}
            {rest.map((b) => (
              <BlogCard key={b.slug} blog={b} author={b.author || collectorById(b.authorId)} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default BlogsPage