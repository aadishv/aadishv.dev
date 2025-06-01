---
date: "2025-05-15"
title: "Jetson Code Walkthrough"
---

Following is a description of all code that runs on the Jetson side.

# camera.py

This file is responsible for handling camera input, processing image and depth data, and providing a flexible interface for real-time parameter tuning. It is designed to work with Intel RealSense cameras and leverages several libraries, including pyrealsense2, OpenCV, NumPy, and JSON.

---

## Library Imports and Setup

### Handling RealSense Library Import

**Purpose:**
_Ensure the RealSense library is imported correctly and the camera pipeline can be initialized, regardless of installation quirks._

- The code attempts to import the RealSense library in two different ways to maximize compatibility.
- It tests basic functionality by initializing a pipeline and an alignment object.
- If any import or initialization fails, it prints an error and exits, ensuring that the rest of the code only runs if the camera is available.

### Importing Supporting Libraries

**Purpose:**
_Bring in essential libraries for image processing, numerical operations, file handling, and configuration management._

- OpenCV is used for image manipulation and color space conversions.
- NumPy is used for efficient numerical operations and array management.
- JSON and OS are used for configuration and file existence checks.

---

## Camera Class

### Camera Initialization

**Purpose:**
_Set up the RealSense camera pipeline and configure the streams for depth and color data._

- The camera is configured to stream both depth and color at a specific resolution and frame rate.
- The color stream uses the BGR format, which is compatible with OpenCV.

### Starting the Camera

**Purpose:**
_Begin streaming from the camera and retrieve important calibration data._

- The pipeline is started, and the depth scale (conversion from raw depth units to meters) is obtained.
- If starting fails, an error is printed and the method returns failure.

### Frame Acquisition

**Purpose:**
_Retrieve the latest set of synchronized depth and color frames from the camera._

- The method waits for new frames and returns them for further processing.
- If frame acquisition fails, it returns None.

### Stopping the Camera

**Purpose:**
_Gracefully stop the camera pipeline when finished._

- The pipeline is stopped, and a message is printed to confirm.

---

## Processing Class

### Initialization and Calibration

**Purpose:**
_Prepare for image and depth processing by loading or generating mapping data and setting up color correction parameters._

- The class retrieves camera intrinsics and extrinsics for both depth and color streams.
- It attempts to load mapping arrays from files to speed up startup. If the files are missing or invalid, it regenerates them.
- The mapping arrays are used to align depth data to the color image.

### Generating and Saving Mapping Arrays

**Purpose:**
_Create lookup tables that map color image pixels to corresponding depth pixels, accounting for camera calibration._

- For each pixel in the color image, the code computes where it maps in the depth image using camera calibration data.
- The mapping arrays are saved to disk for future use, reducing startup time on subsequent runs.

### Image Processing

**Purpose:**
_Apply HSV-based color correction to the input image using tunable parameters._

- The image is converted from BGR to HSV color space.
- Hue, saturation, and value are adjusted according to the current parameters.
- The image is converted back to BGR for further use.

### Frame Processing

**Purpose:**
_Align depth data to the color image and apply color correction._

- Raw depth and color frames are extracted and converted to NumPy arrays.
- Depth data is converted to meters and slightly adjusted for accuracy.
- The mapping arrays are used to remap the depth data so it aligns with the color image.
- The color image is processed using the current HSV parameters.
- Both the corrected color image and aligned depth map are returned.

---

## CameraWorker Class

### Initialization

**Purpose:**
_Set up the camera, processing pipeline, and configuration management for real-time operation._

- The camera is started and checked for successful initialization.
- The processing class is initialized with calibration data and mapping arrays.
- HSV parameters are loaded from a JSON configuration file.
- Initial frames are set up as empty arrays with the correct shapes.

### HSV Parameter Management

**Purpose:**
_Allow real-time tuning of color correction parameters via a JSON file._

- The method reads the JSON file and updates the HSV parameters in the processing class.
- If the file is missing or invalid, it prints a warning and continues with the current parameters.

### Worker Loop

**Purpose:**
_Continuously capture and process frames, periodically updating color correction parameters._

- The loop increments a counter and updates HSV parameters at a set interval.
- It retrieves new frames from the camera and processes them.
- If frame acquisition or processing fails, it prints a warning and continues.
- The loop ensures the camera is stopped when finished.

### Cleanup

**Purpose:**
_Provide a method to stop the camera pipeline from outside the worker loop._

- The camera is stopped to release resources.

---

**This file is essential for integrating the RealSense camera into our system, handling all aspects of camera initialization, calibration, real-time image and depth processing, and dynamic parameter tuning.**

# dashboard_server.py

This file provides a web server interface for interacting with the robot's camera and system data. It uses Flask to serve live video streams, handle configuration updates, and stream logs and results to a web dashboard. The server is designed to be accessible from any device on the network and supports cross-origin requests.

---

## Library Imports and Setup

### Importing Libraries

**Purpose:**
_Bring in all necessary libraries for web serving, image processing, data handling, and system operations._

- Flask is used to create the web server and define HTTP endpoints.
- Flask-CORS is used to allow cross-origin requests, making the dashboard accessible from different devices.
- OpenCV and NumPy are used for image processing and manipulation.
- JSON is used for configuration and data serialization.
- Logging, OS, and sys are used for server configuration and control.
- Time is used for controlling streaming rates.

---

## GStreamer Pipeline Function

### Camera Pipeline String Generation

**Purpose:**
_Provide a utility to generate a GStreamer pipeline string for camera capture, specifically for NVIDIA Jetson platforms._

- The function returns a formatted string that sets up a camera pipeline with specified parameters like resolution, framerate, and flip method.
- This is useful for systems that use GStreamer-compatible cameras, but is not directly used in the main server logic.

---

## DashboardServer Class

### Initialization

**Purpose:**
_Set up the Flask application, enable CORS, and define all HTTP routes._

- The Flask app is initialized with a custom name.
- CORS is enabled for all routes, allowing the dashboard to be accessed from any origin.
- The `_setup_routes` method is called to define all endpoints.

---

## Route Setup

### Video Streaming Endpoints

**Purpose:**
_Serve live video streams of color and depth images over HTTP in MJPEG format._

- The `/color.mjpg` and `/depth.mjpg` endpoints stream color and depth video, respectively.
- Frames are fetched from the camera, processed, and encoded as JPEG images.
- For depth images, the data is normalized and color-mapped for visualization.
- Frames are resized for efficient streaming and sent as a multipart MJPEG stream.

```python
yield (b'--frame\r\n'
       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
```

### Server-Sent Events (SSE) for Results

**Purpose:**
_Stream the most recent result data to the dashboard in real time._

- The `/events` endpoint uses SSE to push JSON-encoded result data to connected clients at a regular interval.
- This allows the dashboard to display live updates without polling.

### HSV Configuration Update Endpoint

**Purpose:**
_Allow the dashboard to update HSV color correction parameters in real time._

- The `/update_hsv` endpoint accepts POST requests with new HSV values in JSON format.
- The server validates the input, ensures all required keys are present, and writes the new configuration to a JSON file.
- Proper error handling is included for missing keys, invalid types, and file write errors.

### Terminal Log Streaming

**Purpose:**
_Stream log messages from the robot to the dashboard for real-time monitoring._

- The `/terminal` endpoint streams all log messages, including past logs, using SSE.
- The `/terminal2` endpoint streams only new log messages, excluding past logs.
- Both endpoints use a generator to yield new log lines as they are added.

### Index Redirect

**Purpose:**
_Redirect the root URL to the main dashboard page._

- The `/` endpoint redirects to a specific dashboard URL, making it easy to access the main interface.

---

## Server Run Method

### Running the Flask Server

**Purpose:**
_Start the Flask web server with custom logging and environment settings._

- The server is configured to suppress the default Flask banner and reduce log verbosity.
- It listens on all network interfaces at port 5000, allowing access from other devices on the network.
- Threaded mode is enabled for handling multiple simultaneous connections.

---

**This file enables real-time interaction with the robot's camera and system data through a web dashboard, supporting live video, configuration updates, and log streaming.**

# inference.py

**This file manages running neural network inference for object detection using NVIDIA TensorRT, CUDA, and PyTorch. It handles both single-image and batched inference, including preprocessing, running the model, and postprocessing with non-maximum suppression (NMS) to produce usable detection results.**

---

## Library Imports and Setup

### Importing Libraries

**Purpose:**
_Bring in all necessary libraries for deep learning inference, image processing, and GPU management._

- PyCUDA and TensorRT are used for efficient GPU-based inference.
- PyTorch and TorchVision are used for tensor operations and NMS.
- OpenCV and NumPy are used for image manipulation and array handling.
- The engine path is imported from a constants file.

---

## InferenceEngine Class

### Initialization

**Purpose:**
_Set up the TensorRT engine, allocate GPU buffers, and prepare the CUDA context for inference._

- The engine is loaded from a serialized file.
- CUDA device and context are initialized for GPU operations.
- Input and output buffers are allocated for efficient data transfer between CPU and GPU.
- The engine context is created for running inference.

### Buffer Allocation

**Purpose:**
_Allocate pagelocked host memory and device memory for all engine bindings._

- For each binding (input/output), the code determines the required size and data type.
- Host and device memory are allocated and tracked for later use.

### Preprocessing

**Purpose:**
_Prepare input images for inference by resizing, normalizing, and reordering channels._

- Images are resized to the expected input shape.
- Color channels are converted from BGR to RGB.
- Pixel values are normalized to the [0, 1] range.
- The image is transposed to match the model's expected input format (NCHW).

### Inference Execution

**Purpose:**
_Run the model on the GPU and retrieve the output._

- Input data is copied to the GPU.
- The engine executes asynchronously.
- Output data is copied back from the GPU to the host.
- The CUDA stream is synchronized to ensure all operations are complete.

### Cleanup

**Purpose:**
_Release all GPU resources and contexts to prevent memory leaks._

- Streams and device memory are freed.
- TensorRT objects are deleted.
- The CUDA context is popped and released.

### Non-Maximum Suppression (NMS)

**Purpose:**
_Filter and refine raw model outputs to produce final object detections._

- The model outputs are converted to PyTorch tensors.
- Objectness and class confidence scores are combined.
- Detections below a confidence threshold are filtered out.
- Bounding boxes are converted from center format to corner format.
- TorchVision's NMS is applied to remove overlapping detections.
- The top detections are formatted into a list of dictionaries with coordinates, class, and confidence.

### Main Inference Method

**Purpose:**
_Run the full inference pipeline on a single image and return detections._

- The image is preprocessed and copied to the input buffer.
- Inference is executed and the output is reshaped.
- NMS is applied to produce the final detection results.

---

## BatchedInferenceEngine Class

### Initialization and Buffer Allocation

**Purpose:**
_Set up the engine and buffers for batched inference (processing two images at once)._

- Similar to the single-image engine, but input and output shapes are set for batches.

### Batched Preprocessing

**Purpose:**
_Prepare two images for batched inference._

- Each image is preprocessed individually.
- The two preprocessed images are stacked into a batch.

### Batched Inference and NMS

**Purpose:**
_Run inference on a batch and apply NMS to each image's results._

- The batch is copied to the input buffer and inference is run.
- The output is reshaped and split for each image.
- NMS is applied separately to each image's detections.

---

## InferenceWorker Class

### Initialization

**Purpose:**
_Set up the inference engine and prepare to process images from the camera._

- The worker holds a reference to the camera and initializes the inference engine.
- It prepares a list to store the latest detections.

### Worker Loop

**Purpose:**
_Continuously process images from the camera and update detections._

- The CUDA context is pushed to ensure GPU operations are valid in the current thread.
- The latest color image from the camera is retrieved.
- If the image is missing, a black image is used as a fallback.
- The image is passed through the inference engine and detections are updated.
- The loop sleeps briefly to control processing rate.
- On exit, the CUDA context is popped and resources are cleaned up.

---

**This file provides a complete, GPU-accelerated object detection pipeline, handling everything from image preprocessing to postprocessing, and is designed for efficient real-time operation on NVIDIA hardware.**

# poseconv.py

**This file provides a function to convert a detected object's position from camera image coordinates and depth to real-world coordinates in the robot's reference frame. It uses camera calibration parameters and the robot's current pose to perform this transformation.**

---

## Constants and Calibration

### Camera and Conversion Parameters

**Purpose:**
_Define the necessary constants for projecting image coordinates into the real world._

- The focal length and image center are specified in pixels, based on camera calibration.
- The camera's height above the robot's origin is given in meters.
- A conversion factor is provided to translate meters to inches, matching the robot's coordinate system.

---

## locate_detection Function

### Function Overview

**Purpose:**
_Transform a detection from image coordinates and depth to world coordinates, accounting for the robot's current position and orientation._

- The function takes the robot's current position (in inches), heading (in radians), and a detection dictionary containing image coordinates and depth.
- It returns a dictionary with the object's position in the world frame (in inches), including its height above the robot's base plane.

### Step 1: Back-Projection to Camera Frame

**Purpose:**
_Convert the detection's image coordinates and depth into 3D coordinates relative to the camera._

- The detection's depth and pixel coordinates are used to compute the object's position in the camera's coordinate system.
- The formulas use the focal length and image center to translate from pixels to meters.

### Step 2: Rotation to World Axes

**Purpose:**
_Rotate the camera-relative coordinates into the world frame, based on the robot's heading._

- A rotation matrix is constructed using the robot's heading angle.
- The camera-relative vector is rotated to align with the world axes.

### Step 3: Translation and Unit Conversion

**Purpose:**
_Translate the rotated coordinates by the robot's current position and convert from meters to inches._

- The rotated X and Y coordinates are scaled from meters to inches.
- The robot's current X and Y positions are added to get the final world coordinates.

### Step 4: Height Calculation

**Purpose:**
_Compute the object's height above the robot's base plane._

- The Z coordinate is adjusted by subtracting the camera's height and converting to inches.

### Return Value

**Purpose:**
_Provide the final world coordinates of the detected object._

- The function returns a dictionary with the object's X, Y, and Z positions in inches, suitable for use in navigation or manipulation tasks.

---

**This file is essential for translating camera-based detections into actionable world coordinates, enabling the robot to interact with its environment based on vision data.**

# post.py

**This file handles the post-processing of object detections, depth estimation, and system information gathering. It transforms raw detection results into world coordinates, applies filtering and adjustments, and packages the data for use by other parts of the robot system or for transmission to external systems.**

---

## Constants and Imports

### Importing Dependencies

**Purpose:**
_Bring in all necessary modules and constants for processing detections and system data._

- NumPy is used for numerical operations and array handling.
- The `copy` module is used for deep copying data structures to avoid side effects.
- Constants and utility functions are imported for measurement and pose conversion.
- JSON is used for formatting output data.

---

## FakeDetection Class

### Placeholder for Localization

**Purpose:**
_Provide a simple object with a pose attribute for compatibility with other code that expects a detection-like object._

- The class has a `pose` attribute initialized to (0, 0, 0).

---

## Processing Class

### Initialization

**Purpose:**
_Set up the processing pipeline with references to the main application, localization, and camera calibration data._

- Stores references to the app, localization, and focal length.
- Initializes detection storage and retrieves the camera's depth scale.

---

### Depth Estimation for Detections

**Purpose:**
_Estimate the depth of a detected object by analyzing the corresponding region in the depth image._

- The function extracts a region of the depth image based on the detection's bounding box.
- It flattens the region and computes the 10th percentile of nonzero depth values to estimate object depth.
- If an error occurs, it returns -1.

---

### Jetson System Information

**Purpose:**
_Gather system information such as CPU temperature, GPU temperature, and system uptime from the Jetson device._

- Reads system files to obtain CPU and GPU temperatures.
- Reads the system uptime from `/proc/uptime`.
- Handles exceptions gracefully if files are missing or unreadable.

---

### Data Conversion for External Systems

**Purpose:**
_Convert processed data into a format compatible with another system (e.g., V5 robot controller)._

- Deep copies the input data to avoid modifying the original.
- Constructs a new dictionary with pose, filtered detections, and a flag.
- Adjusts the heading angle as required by the target system.
- Serializes the result to a compact JSON string.

---

### Main Update Method

**Purpose:**
_Process new detections, estimate their depths, transform their coordinates, and package all relevant data._

- Increments an internal counter.
- Retrieves the latest depth image and raw detections.
- Adjusts detection coordinates and bounding box sizes as needed.
- Estimates depth for each detection and filters out low-confidence detections.
- Converts detection coordinates from image space to world coordinates using the robot's pose.
- Updates the localization pose.
- Checks a specific row in the depth image for proximity warnings and sets a flag if necessary.
- Gathers system information and builds the final output dictionary.
- Converts the output to the external system format (for side effects or validation).
- Returns the output dictionary.

---

**This file is crucial for transforming raw vision data into actionable information, including world-frame object positions, system health metrics, and safety flags, enabling the robot to make informed decisions based on its perception and state.**

# main.py

**This file is the entry point for the robot's vision and dashboard system. It coordinates camera input, inference, post-processing, communication with external controllers, and serves a web dashboard. It manages the lifecycle of all major components and supports both simulation and serial communication modes.**

---

## App Class

### Initialization

**Purpose:**
_Set up all major subsystems and shared state for the application._

- Instantiates the camera worker, inference worker, and initializes storage for results and logs.
- Prepares for either simulation or serial communication with an external controller.

---

### Simulator Service

**Purpose:**
_Continuously process detections and update results in simulation mode._

- Creates a `Processing` object for post-processing.
- In a loop, updates the most recent result using a fixed pose.
- Maintains a consistent update rate (30 Hz) by adjusting sleep time based on processing duration.

---

### Serial Communication Service

**Purpose:**
_Handle communication with an external controller (e.g., V5 robot) over a serial port._

- Opens a serial connection to a specified port and baud rate.
- On the first message, initializes the `Processing` object with the received pose.
- For subsequent messages, updates the pose and processes detections.
- Converts the result to the required format and sends it back over serial.
- Logs incoming lines for monitoring.
- Handles serial errors by attempting to reconnect after a delay.

---

### Cleanup and Context Management

**Purpose:**
_Provide methods to cleanly shut down the camera and other resources._

- The `close` method stops the camera.
- Implements context manager methods to ensure cleanup on exit.

---

## Main Execution Block

### Mode Selection

**Purpose:**
_Allow the program to run in either simulation or serial mode based on command-line arguments._

- Defaults to simulation mode.
- Switches to serial mode if the first argument is `'ser'`.

---

### Thread Management

**Purpose:**
_Run all major services in parallel using threads and handle graceful shutdown._

- Creates threads for the camera worker, inference worker, either the simulator or serial service, and the dashboard server.
- Sets up signal handlers for SIGINT and SIGTERM to trigger shutdown.
- Registers cleanup with `atexit`.
- Starts all threads and waits for a shutdown event.
- Joins all threads with a timeout to ensure proper cleanup.

---

**This file orchestrates the entire vision and dashboard system, ensuring that all components run concurrently and communicate effectively, while providing robust lifecycle and error management.**
