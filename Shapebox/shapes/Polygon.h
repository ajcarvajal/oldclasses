#pragma once

#include "Shape.h"

class Polygon : public Shape
{
public:
  Polygon(unsigned short, double);
  virtual std::string toPostScript() const override;
  virtual double width() const override;
  virtual double height() const override;
private:
  const unsigned short _sides;
  const double _sideLength;
};