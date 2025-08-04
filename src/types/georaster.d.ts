declare module 'georaster' {
  export interface Georaster {
    width: number;
    height: number;
    pixelValuesAtCoordinate(x: number, y: number): number | number[] | null;
  }

  export function getImage(arrayBuffer: ArrayBuffer): Promise<Georaster>;
}

declare module 'georaster-layer-for-leaflet' {
  import { Layer } from 'leaflet';
  import { Georaster } from 'georaster';

  export interface GeoRasterLayerOptions {
    georaster: Georaster;
    opacity?: number;
    pixelValuesToColorFn?: (values: number[]) => string | null;
    resolution?: number;
  }

  export default class GeoRasterLayer extends Layer {
    constructor(options: GeoRasterLayerOptions);
  }
}