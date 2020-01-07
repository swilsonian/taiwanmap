import numpy as np
 
# # For example the contents of "taoyuanfit.csv":
# # Landmark data: image vertical/horizontal (px), latitude/longitude
# 1677,2861,24.991962,121.322634
# 1597,524,24.992282,121.304856
# 2385,1348,24.986873,121.311122
# 764,1342,24.998116,121.311411
datafile = "tpefit.csv"
points = np.loadtxt(datafile, delimiter=",", comments="#")
imgwidth, imgheight = 5007, 3974
 
# Points on the image, scaled to range 0 to 1
px, py = points[:, 1]/imgwidth, (imgheight-points[:, 0])/imgheight
# Points on the map
gx, gy = points[:, 3], points[:, 2]
# Do the fitting
lx, ly = np.polyfit(px, gx, 1), np.polyfit(py, gy, 1)
 
# Fitting parameters give map boundaries, results in this case
west = lx[1]          # 121.300983
east = lx[1] + lx[0]  # 121.331141
north = ly[1]+ly[0]   #  25.003429
south = ly[1]         #  24.981204

print(north, east, south,west)