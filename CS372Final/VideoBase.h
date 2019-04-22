#pragma once

class VideoBase {
public:
	VideoBase() {};
	virtual ~VideoBase() = default;
	virtual void play() = 0;
};
