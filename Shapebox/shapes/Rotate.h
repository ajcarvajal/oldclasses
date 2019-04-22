#pragma once

#include "Shape.h"
#include <memory>

class Rotate : public Shape
{
public:
  Rotate(std::unique_ptr<Shape>, double);
  virtual double width() const override;
  virtual double height() const override;
  virtual std::string toPostScript() const override;
private:
  const std::unique_ptr<Shape> _shape;
  const double _angle;
};