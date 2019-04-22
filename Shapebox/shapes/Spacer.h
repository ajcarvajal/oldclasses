#pragma once

#include "Rectangle.h"

class Spacer : public Rectangle
{
public:
  Spacer(double, double);
  virtual std::string toPostScript() const override;
};