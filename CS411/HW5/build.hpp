#ifndef BUILD_H_INCLUDED
#define BUILD_H_INCLUDED

#include <vector>
using std::vector;
#include <algorithm>
using std::sort;
using std::max;

using Bridge = vector<int>;

int build(int w, int e, const std::vector<Bridge> & bridges);

#endif