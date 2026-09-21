import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore.jsx'
import { timeAgo } from '../store/data.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { AppBar } from '../components/AppBar.jsx'
import { Avatar, Chip, EmptyState } from '../components/ui.jsx'
import { NewspaperIcon, ClockIcon, TrendingUpIcon, ArrowUpRightIcon } from '../components/icons.jsx'
import { WhatsAppShareButton } from '../components/WhatsApp.jsx'

function BlogCard({ blog, author, wide = false }) {
  const [coverOk, setCoverOk] = useState(true)
  const name = author ? author.name : 'Diecet Editorial'
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
            <NewspaperIcon size={28} />
          </span>
        )}
        <span className="blog-card__cat">{blog.category}</span>
        {wide ? <span className="blog-card__ribbon">Featured</span> : null}
      </Link>
      <div className="blog-card__body">
        <Link className="blog-card__title" to={`/blogs/${blog.slug}`}>
          {blog.title} <ArrowUpRightIcon size={15} className="blog-card__arrow" />
        </Link>
        <p className="blog-card__excerpt">{blog.excerpt}</p>
        <div className="blog-card__foot">
          <span className="blog-card__author">
            {author ? <Avatar user={author} size={30} /> : null}
            <span className="blog-card__by">
              <b>{name}</b>
              <em>{timeAgo(blog.ts)} ago</em>
            </span>
          </span>
          <span className="blog-card__foot-end">
            <span className="blog-card__views">
              <ClockIcon size={12} /> {blog.readMinutes} min
            </span>
            <span className="blog-card__views">
              <TrendingUpIcon size={12} /> {blog.views.toLocaleString('en')}
            </span>
            <WhatsAppShareButton
              title={blog.title}
              label="Share on WhatsApp"
              iconOnly
              className="wa-share-mini"
            />
          </span>
        </div>
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
        <section className="blog-masthead" data-reveal>
          <div>
            <span className="eyebrow">Diecet Editorial</span>
            <h1 className="blog-masthead__title">The Collectors’ Journal</h1>
            <p className="blog-masthead__sub">
              Rarity deep-dives, buying guides and community headlines from the world of diecast collecting.
            </p>
          </div>
          <div className="blog-masthead__stats">
            <span className="blog-masthead__stat"><b>{state.blogs.length}</b> Articles</span>
            <span className="blog-masthead__stat"><b>{categories.length}</b> Topics</span>
          </div>
        </section>

        {categories.length ? (
          <div className="blog-filters" role="group" aria-label="Filter articles by category">
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
          <>
            <div className="section__head">
              <h2 className="h-section">Latest stories</h2>
            </div>
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
          </>
        )}
      </div>
    </>
  )
}

export default BlogsPage