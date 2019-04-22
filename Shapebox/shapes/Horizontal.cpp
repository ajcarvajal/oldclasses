#include "Horizontal.h"
#include <sstream>

Horizontal::Horizontal(std::vector<std::unique_ptr<Shape>> & shapes)
{
  for (auto & shape: shapes)
  {
    _shapes.push_back(std::move(shape));
  }
}

std::string Horizontal::toPostScript() const
{
  std::ostringstream os;

  os << "gsave %<horizontal> \n";
  os << -width() / 2 << " 0  translate \n";  //center the horizontal shape 
  for (int i = 0; i < _shapes.size(); ++i)
  {
    os << _shapes[i]->toPostScript();

    if (i != _shapes.size() - 1)
      os  << (_shapes[i]->width() / 2) + (_shapes[i + 1]->width() / 2) 
          << " 0 translate \n";
  }
  os << "grestore %</horizontal> \n";

  return os.str();
}

double Horizontal::width() const
{
  double width = 0;
  for (auto & shape : _shapes)
  {
    width += shape->width();
  }
  return width;
}

double Horizontal::height() const
{
  double height = 0;
  for (auto & shape : _shapes)
  {
    if (shape->height() > height) height = shape->height();
  }
  return height;
}

