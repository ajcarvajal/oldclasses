#include "Layered.h"
#include <sstream>

Layered::Layered(std::vector<std::unique_ptr<Shape>> & shapes)
{
  for (auto & shape: shapes)
  {
    _shapes.push_back(std::move(shape));
  }
}

std::string Layered::toPostScript() const
{
  std::ostringstream os;

  for (auto & shape : _shapes)
  {
    os<< "gsave %<Layered>" << std::endl
      << shape->toPostScript()
      << "grestore %</Layered>" << std::endl;
  }
  
  return os.str();
}

double Layered::width() const
{
  double width = 0;
  for (auto & shape : _shapes)
  {
    if (shape->width() > width) width = shape->width();
  }
  return width;
}

double Layered::height() const
{
  double height = 0;
  for (auto & shape : _shapes)
  {
    if (shape->height() > height) height = shape->height();
  }
  return height;
}
