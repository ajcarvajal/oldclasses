#ifndef BUILD_HPP
#define BUILD_HPP
#include <math.h>
#include <vector>
#include <iostream>
using namespace std;
//checks if given subset contains a collision: crossing bridges and/or duplicate cities
//returns: sum of tolls for valid bridges
template <typename T>
int evaluateToll(const std::vector<T> &subset, const int size) {
    int toll = 0;
    for (int i = 0; i < size; ++i) {
        for (int j = i+1; j < size; ++j) {
            if ((subset[i][0] >= subset[j][0] && subset[i][1] <= subset[j][1]) ||
                (subset[i][0] <= subset[j][0] && subset[i][1] >= subset[j][1])) {
                return 0;
            }
        }
        toll += subset[i][2]; //no collisions found
    }
    return toll;
}

//generates all subsets of bridges and stores them in a vector
//each subset is checked for collisions
//returns: largest toll of all valid bridge subsets
template <typename T>
int build(int west, int east, const std::vector<T> & bridges) {
    int n = bridges.size();
    int max_toll = 0;
    int subset_size = 0;

    std::vector<T> subset(n);
    //generate subset
    for (int i = 0; i < pow(2, n); ++i) {
        for (int b = 0; b < n; ++b) {
            if ((1 << b) & i) {
                subset[subset_size] = bridges[b];
                subset_size++;
            }
        }
        auto current_toll = evaluateToll(subset, subset_size);
        if (current_toll > max_toll) {
            max_toll =  current_toll;
        }
        subset_size = 0;
    }
    return max_toll;
}

#endif //BUILD_HPP