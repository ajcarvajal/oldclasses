#include "Spacer.h"

Spacer::Spacer(double width, double height)
  : Rectangle(width, height)
{}

std::string Spacer::toPostScript() const
{
  return "";
}
