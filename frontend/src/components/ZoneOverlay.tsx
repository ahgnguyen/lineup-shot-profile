// frontend/src/components/ZoneOverlay.tsx

import { ZONE_SHAPES, WEDGE_CLIP_ID, WEDGE_CLIP_PATH, type ZoneId } from '../court/zones'

interface ZoneOverlayProps {
  selectedZone: ZoneId | null
  onZoneClick: (zoneId: ZoneId, clientX: number, clientY: number) => void
}

export function ZoneOverlay({ selectedZone, onZoneClick }: ZoneOverlayProps) {
  return (
    <g className="zone-overlay">
      <defs>
        <clipPath id={WEDGE_CLIP_ID}>
          <path d={WEDGE_CLIP_PATH} clipRule="evenodd" />
        </clipPath>
      </defs>

      {ZONE_SHAPES.map((zone) => {
        const className = `zone-shape${selectedZone === zone.id ? ' selected' : ''}`
        const handleClick = (e: React.MouseEvent) => onZoneClick(zone.id, e.clientX, e.clientY)

        if (zone.kind === 'rect' && zone.rect) {
          return <rect key={zone.id} className={className} {...zone.rect} onClick={handleClick} />
        }
        if (zone.kind === 'circle' && zone.circle) {
          return <circle key={zone.id} className={className} {...zone.circle} onClick={handleClick} />
        }
        return (
          <path
            key={zone.id}
            className={className}
            d={zone.d}
            clipPath={zone.clipped ? `url(#${WEDGE_CLIP_ID})` : undefined}
            onClick={handleClick}
          />
        )
      })}
    </g>
  )
}
