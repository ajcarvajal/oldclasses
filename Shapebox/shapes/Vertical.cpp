#include "Vertical.h"
#include <sstream>

Vertical::Vertical(std::vector<std::unique_ptr<Shape>> & shapes)
{
  for (auto & shape: shapes)
  {
    _shapes.push_back(std::move(shape));
  }
}

std::string Vertical::toPostScript() const
{
  std::ostringstream os;

  os << "gsave %<vertical>\n";
  os << " 0 " << -height() / 2 << " translate\n"; //center object
  for (int i = 0; i < _shapes.size(); ++i)
  {
    os << _shapes[i]->toPostScript();

    if (i != _shapes.size() - 1)
      os << " 0 " << (_shapes[i]->height() / 2) + (_shapes[i + 1]->height() / 2) << " translate\n";
  }
  os << "grestore %</vertical> \n";

  return os.str();
}

double Vertical::width() const
{
  double width = 0;
  for (auto & shape : _shapes)
  {
    if (shape->width() > width) width = shape->width();
  }
  return width;
}

double Vertical::height() const
{
  double height = 0;
  for (auto & shape : _shapes)
  {
    height += shape->height();
  }
  return height;
}
