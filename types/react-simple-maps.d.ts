// Local type declarations for react-simple-maps
// This file ensures TypeScript can compile the WorldMap component without
// requiring the @types/react-simple-maps devDependency (which Hostinger's
// production npm install skips).

declare module 'react-simple-maps' {
  import { ReactNode, CSSProperties, MouseEvent } from 'react'

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: Record<string, unknown>
    style?: CSSProperties
    children?: ReactNode
    [key: string]: unknown
  }

  interface ZoomableGroupProps {
    zoom?: number
    center?: [number, number]
    children?: ReactNode
    [key: string]: unknown
  }

  interface GeographiesProps {
    geography: string | object
    children: (props: { geographies: Geography[] }) => ReactNode
    [key: string]: unknown
  }

  interface Geography {
    rsmKey: string
    [key: string]: unknown
  }

  interface GeographyProps {
    geography: Geography
    key?: string
    style?: {
      default?: CSSProperties & { outline?: string }
      hover?: CSSProperties & { outline?: string }
      pressed?: CSSProperties & { outline?: string }
    }
    [key: string]: unknown
  }

  interface MarkerProps {
    coordinates: [number, number]
    key?: string | number
    onMouseEnter?: (event: MouseEvent<SVGGElement>) => void
    onMouseLeave?: (event: MouseEvent<SVGGElement>) => void
    children?: ReactNode
    [key: string]: unknown
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element
  export function Geographies(props: GeographiesProps): JSX.Element
  export function Geography(props: GeographyProps): JSX.Element
  export function Marker(props: MarkerProps): JSX.Element
}
