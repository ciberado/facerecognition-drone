# -*- coding: utf-8 -*-

'''
Post: https://towardsdatascience.com/facial-mapping-landmarks-with-dlib-python-160abcf7d672

Model: wget https://github.com/italojs/facial-landmarks-recognition-/blob/master/shape_predictor_68_face_landmarks.dat

pip install numpy opencv-python dlib imutils
'''

from imutils import face_utils
import dlib
import cv2
 
# Vamos inicializar um detector de faces (HOG) para então
# let's go code an faces detector(HOG) and after detect the 
# landmarks on this detected face

# p = our pre-treined model directory, on my case, it's on the same script's diretory.
p = "/tmp/shape_predictor_68_face_landmarks.dat"
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(p)

filename="trio-small.jpg"
image = cv2.imread(filename, cv2.IMREAD_COLOR )
cv2.imshow("Input", image)

# Converting the image to gray scale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
# Get faces into webcam's image
rects = detector(gray, 0)

# For each detected face, find the landmark.
for (i, rect) in enumerate(rects):
    # Make the prediction and transfom it to numpy array
    shape = predictor(gray, rect)
    shape = face_utils.shape_to_np(shape)

    # Draw on our image, all the finded cordinate points (x,y) 
    for (x, y) in shape:
        cv2.circle(image, (x, y), 2, (0, 255, 0), -1)

# Show the image
cv2.imshow("Output", image)
cv2.waitKey()
