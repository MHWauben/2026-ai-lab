export interface Location {
	lat: number;
	lng: number;
}

export interface GeoPolygon {
	type: 'Polygon';
	coordinates: number[][][];
}
