#pragma once

#include "Shape.h"
#include <memory>

class Page : public Shape
{
public:
  Page(std::unique_ptr<Shape>);
  virtual std::string toPostScript() const override;
  virtual double width() const override;
  virtual double height() const override;
private:
  const std::unique_ptr<Shape> _shape;
};