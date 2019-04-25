import skimage
from skimage import io
from skimage import data, exposure
from skimage.feature import hog
import matplotlib.pyplot as plt

# https://scikit-image.org/docs/dev/auto_examples/features_detection/plot_hog.html

filename="trio.jpg"
image = io.imread(filename)

fd, hog_image = hog(image, orientations=8, pixels_per_cell=(16, 16),
                    cells_per_block=(1, 1), visualize=True, multichannel=True)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(8, 4), sharex=True, sharey=True)

ax1.axis('off')
ax1.imshow(image, cmap=plt.cm.gray)
ax1.set_title('Input image')

# Rescale histogram for better display
hog_image_rescaled = exposure.rescale_intensity(hog_image, in_range=(0, 10))

ax2.axis('off')
ax2.imshow(hog_image_rescaled, cmap=plt.cm.gray)
ax2.set_title('Histogram of Oriented Gradients')
plt.show()

'''
pip install scikit-image
pip install python-scipy
pip install scipy
pip install opencv-python
pip install matplotlib
pip install imutils
'''