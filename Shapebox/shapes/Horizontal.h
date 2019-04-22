#pragma once

#include "Shape.h"
#include <vector>
#include <memory>

class Horizontal : public Shape
{
public:
  Horizontal(std::vector<std::unique_ptr<Shape>> &);
  virtual std::string toPostScript() const override;
  virtual double width() const override;
  virtual double height() const override;
private:
  std::vector<std::unique_ptr<Shape>> _shapes;
};
