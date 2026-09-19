import { ModelThumb } from './ModelThumb.jsx'
import { Rarity } from './ui.jsx'
import { money, modelScore } from '../store/data.js'
import { EditIcon, TrashIcon } from './icons.jsx'

export function ModelCard({ model, onOpen, onSell, onEdit, onDelete }) {
  return (
    <div
      className="model-card"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() }
      }}
    >
      <div className="model-card__media">
        <ModelThumb name={model.name} brand={model.brand} scale={model.scale} photo={model.photoUrl} className="model-card__thumb" />
        {model.rarity ? <Rarity tier={model.rarity} className="model-card__rarity" /> : null}
        <span className="model-card__score">{modelScore(model)}</span>
      </div>
      <div className="model-card__body">
        <span className="model-card__name">{model.name}</span>
        <span className="model-card__meta">{model.brand} · {model.year} · {model.scale}</span>
        <div className="model-card__foot">
          <span className="model-card__value">{money(model.value)}</span>
          <div className="row" style={{ gap: 4 }}>
            {onEdit ? (
              <button type="button" className="model-card__icon" title="Edit model" aria-label={`Edit ${model.name}`} onClick={(e) => { e.stopPropagation(); onEdit() }}>
                <EditIcon size={15} />
              </button>
            ) : null}
            {onDelete ? (
              <button type="button" className="model-card__icon model-card__icon--danger" title="Remove model" aria-label={`Remove ${model.name}`} onClick={(e) => { e.stopPropagation(); onDelete() }}>
                <TrashIcon size={15} />
              </button>
            ) : null}
            <button
              type="button"
              className="model-card__sell"
              onClick={(e) => { e.stopPropagation(); onSell?.() }}
            >
              {model.listed ? 'Listed' : 'Sell'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
