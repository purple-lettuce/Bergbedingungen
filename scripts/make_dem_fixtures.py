#!/usr/bin/env python3
"""Erzeugt die kleinen GeoTIFF-Testdateien für scripts/test_dem_tiff.html und scripts/test_dem.html (RI12) in scripts/fixtures/dem/.

Die Dateien sind mit GDAL (rasterio) und tifffile geschrieben, also unabhängig vom Reader in js/dem_tiff.js. Sie sind klein und im Repository
abgelegt; dieses Skript wird nur gebraucht, um sie neu zu erzeugen (pip install rasterio tifffile numpy imagecodecs).

Pixelwert an Spalte c, Zeile r: value(c, r) = 1000 + 2c + 3r + ((7c + 13r) mod 5). Die Tests rechnen dieselbe Formel nach.
"""
import os
import numpy as np
import rasterio
from rasterio.transform import from_origin
import tifffile

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures", "dem")
N = 64                      # Pixel je Kante
LON0, LAT1 = 12.0, 48.0     # obere linke Ecke der Kachel (Kachel N47 E012)
PIX = 1.0 / N


def grid(dtype):
    r, c = np.mgrid[0:N, 0:N]
    return (1000 + 2 * c + 3 * r + ((7 * c + 13 * r) % 5)).astype(dtype)


def write(name, dtype, driver_opts, nodata=None, area_or_point=None, driver="GTiff"):
    path = os.path.join(OUT, name)
    profile = dict(driver=driver, width=N, height=N, count=1, dtype=dtype, crs="EPSG:4326", transform=from_origin(LON0, LAT1, PIX, PIX), nodata=nodata)
    profile.update(driver_opts)
    with rasterio.open(path, "w", **profile) as dst:
        data = grid(dtype)
        if nodata is not None:
            data[5, 5] = nodata          # ein NoData-Pixel an Spalte 5, Zeile 5
        dst.write(data, 1)
        if area_or_point:
            dst.update_tags(AREA_OR_POINT=area_or_point)
    print(name, os.path.getsize(path), "Bytes")


def main():
    os.makedirs(OUT, exist_ok=True)
    # wie die Copernicus-Kacheln: gekachelt, Deflate, Gleitkomma-Predictor
    write("cog_float32_deflate_p3.tif", "float32", dict(tiled=True, blockxsize=16, blockysize=16, compress="deflate", predictor=3))
    # gestreift, unkomprimiert (wie ein einfaches GeoTIFF ohne Kachelung)
    write("strips_float32_none.tif", "float32", dict(tiled=False, blockysize=4, compress="none"))
    # Ganzzahl mit horizontalem Predictor, Pixelmitte als Bezug (Raster "Point"), NoData
    write("tiled_int16_deflate_p2_point.tif", "int16", dict(tiled=True, blockxsize=16, blockysize=16, compress="deflate", predictor=2), nodata=-32768, area_or_point="Point")
    # nicht unterstützte Fälle: LZW und BigTIFF
    write("lzw_float32.tif", "float32", dict(tiled=True, blockxsize=16, blockysize=16, compress="lzw"))
    write("bigtiff_float32.tif", "float32", dict(tiled=False, compress="none", BIGTIFF="YES"))
    # Big-Endian (GDAL schreibt nur Little-Endian), ohne Georeferenz; nur für den Pixelzugriff
    be = os.path.join(OUT, "be_float32_none.tif")
    tifffile.imwrite(be, grid("float32"), byteorder=">", compression=None, rowsperstrip=8)
    print("be_float32_none.tif", os.path.getsize(be), "Bytes")


if __name__ == "__main__":
    main()
