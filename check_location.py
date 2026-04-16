import geopandas as gpd
from pathlib import Path
from shapely.geometry import Point
from shapely.ops import unary_union


def load_geofence_data(geofence_folder="geofence-data"):
    """
    Load all geopackages and shapefiles from the geofence-data folder
    and prepare them into a single polygon.
    
    Args:
        geofence_folder: Path to the folder containing geospatial files
    
    Returns:
        Polygon: Combined polygon from all loaded geometries
    """
    global _geofence_polygon
    
    folder_path = Path(geofence_folder)

    whole_london = gpd.read_file(folder_path / "gla-boundary.zip")

    
    # Load all .gpkg and .shp files
    geometries = []
    for extension in ["*.gpkg", "*.shp"]:
        for file_path in folder_path.glob(extension):
            gdf = gpd.read_file(file_path)
            geometries.extend(gdf.geometry.tolist())
    
    # Combine all geometries into a single polygon
    hole_polygon = unary_union(geometries)

    _geofence_polygon = whole_london.geometry[0].difference(hole_polygon)
    return _geofence_polygon


def is_point_in_geofence(latitude, longitude, polygon):
    """
    Check if a coordinate point lies within the geofence polygon.
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
    
    Returns:
        bool: True if point is within geofence, False otherwise
    """
    if _geofence_polygon is None:
        raise ValueError("Call load_geofence_data() first.")
    
    point = Point(longitude, latitude)
    
    print(f"Checking point: {point}") 

    return polygon.contains(point)