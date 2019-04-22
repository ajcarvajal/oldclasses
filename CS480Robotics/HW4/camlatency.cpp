/*
    Robotics Video Latency Homework
    Fall 2018
    Aj Carvajal

    finds a estimate of a cameras video latency when interacting with opencv.

    for my tests, I put a laptop and a monitor face to face in a dark room
    onscreen pixels -> camera -> onscreen pixels

    equipment used:
    video input: Lenovo X1 Carbon 2016 integrated webcam
                 resolution: 1280x720
                 framerate: 30 fps
    displays: Lenovo laptop screen (60 Hz refresh rate)
              Samsung monitor (60 Hz refresh rate)

    running the program for about a minute gave me an average latency of 197.322 milliseconds (0.197322 seconds), or 6 frames

*/
#include <iostream>
using std::cout;
using std::endl;
#include <chrono>
using namespace std::chrono;
#include <math.h>
using std::ceil;
#include <opencv2/opencv.hpp>


int main()
{
    const int camera_number=0; // /dev/video#, might be 0 for your hardware
    cv::VideoCapture cap(camera_number);
    const double cam_fps = cap.get(CV_CAP_PROP_FPS);

    cv::Mat frame;
    cv::Mat frameGS;
    cv::Scalar brightness;

    auto timestamp = high_resolution_clock::now();
    auto start_time = timestamp; //for computing average latency
    int64_t delta_time;
    float dt_seconds;

    //for reporting average latency
    float total_latency = 0;
    int test_cases = 0;

    double lastframe_frames = 0;
    double delta_frames;

    bool lastframe_black = true;
    bool camera_sees_black = false;
    const int threshold = 75;
    
    //resize output window
    char window[] = "Video - press ESC to quit"; //cv functions take char arrays
    cvNamedWindow(window, CV_WINDOW_NORMAL);
    cvResizeWindow(window, 1920,1080);

    if (!cap.isOpened()) {
        std::cerr<<"Cannot open video stream "<<camera_number<<"\n";
        return 1;
    }

    //show initial black screen
    cap>>frame;
    frame.setTo(cv::Scalar(0,0,0));
    cv::imshow(window, frame);

    while (true) {
        cap>>frame;
        if (frame.empty()) break;

        //convert image to grayscale and find average brightness
        cvtColor(frame, frameGS, CV_BGR2GRAY);
        brightness = cv::mean(frameGS);

        camera_sees_black = brightness[0] < threshold;

        if(lastframe_black != camera_sees_black) {
            //find difference in seconds
            delta_time = duration_cast<milliseconds>(high_resolution_clock::now() - timestamp).count();
            dt_seconds = (float)delta_time / 1000;
            cout<<"seconds since last black frame: " << dt_seconds << endl;

            //find difference in frames
            cout<<"frames since last black frame: " <<ceil(dt_seconds * cam_fps)<<endl;

            //update stats
            total_latency += dt_seconds;
            test_cases++;

            //reset counters
            lastframe_black = camera_sees_black;
            timestamp = high_resolution_clock::now();

            if(camera_sees_black)
                frame.setTo(cv::Scalar(255,255,255));
            else 
                frame.setTo(cv::Scalar(0,0,0));
            
            cv::imshow(window,frame);
        }
        // Wait one millisecond for a keyboard press
        int c = cv::waitKey(1);
        if (c==27 || c=='q') break; // escape key
    } 

    //report results
    cout<<"average latency(seconds): "<<total_latency / test_cases<<endl;
    cout<<"average latency(frames): "<<ceil(total_latency * cam_fps) / test_cases<<endl;

    return 0;
}
