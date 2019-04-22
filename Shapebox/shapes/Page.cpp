#include "Page.h"
#include <sstream>

Page::Page(std::unique_ptr<Shape> shape)
  : _shape(std::move(shape))
{}

std::string Page::toPostScript() const 
{
  std::ostringstream os;

  os 
  << "%!PS-Adobe-3.0" << std::endl << std::endl
  << _shape->toPostScript() << std::endl
  << "showpage" << std::endl
  << "%EOF" << std::endl;

  return os.str();
}

double Page::width() const
{
  return _shape->width();
}

double Page::height() const
{
  return _shape->height();
}