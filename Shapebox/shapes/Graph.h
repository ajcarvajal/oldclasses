#pragma once

#include "Shape.h"

class Graph : public Shape
{
public:
  Graph(unsigned short);
  virtual std::string toPostScript() const override;
  virtual double width() const override;
  virtual double height() const override;
private:
  const unsigned short _nodes;
};
