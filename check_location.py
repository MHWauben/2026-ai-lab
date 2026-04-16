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
    geometries = []
    
    # Load all .gpkg and .shp files
    for file_path in folder_path.glob("*.gpkg"):
        gpkg_gdf = gpd.read_file(file_path)
        geometries.extend(gpkg_gdf.geometry.tolist())

    # Not working for some reason, skip for now!
    # for file_path in folder_path.glob("*.shp"):
    #     breakpoint()
    #     shp_gdf = gpd.read_file(file_path)
    #     geometries.extend(shp_gdf.geometry.tolist())
    
    # Combine all geometries into a single polygon
    _geofence_polygon = unary_union(geometries)
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