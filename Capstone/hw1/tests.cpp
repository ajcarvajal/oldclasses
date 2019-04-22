#define CATCH_CONFIG_MAIN
#include "catch.hpp"
#include "hw1.h"
#include <climits>
#include <algorithm>

template<typename T>
std::vector<T> sortedCopy(std::vector<T> &original, int begin, int end) {
    std::vector<T> copy = original;
    std::sort(copy.begin()+begin, copy.begin()+end);
    return copy;
}
template<typename T>
std::vector<T> sortedCopy(std::vector<T> &original) {
    return sortedCopy(original, 0, original.size());
}


TEST_CASE("data is correctly sorted") {
    std::vector<int> a = {-10, 9, 0, 2, 1, 3};
    auto b = sortedCopy(a);
    hw1::quicksort(a);
    REQUIRE(a == b);
    SECTION("correctly sorts range of sorted numbers") {
        hw1::quicksort(a);
        REQUIRE(a==b);
    }
} 
TEST_CASE("correctly sorts large datasets of random numbers") {
    std::vector<double> a(100);
    for (auto i : a)
    {
        i = std::rand();
    }
    auto b = sortedCopy(a);
    hw1::quicksort(a);
    REQUIRE(a == b);
} 
TEST_CASE("correctly sorts large values") {
    std::vector<int> a = {INT_MAX, 0, 2, INT_MIN, -427085};
    auto b = sortedCopy(a);
    hw1::quicksort(a);
    REQUIRE(a == b);
}
TEST_CASE("correctly sorts empty datasets") {
    std::vector<int> a;
    auto b = sortedCopy(a);
    hw1::quicksort(a, 0, 0);
    REQUIRE(a == b);
    
}
TEST_CASE("correctly sorts datasets of size 1") {
    std::vector<int> a = {1};
    auto b = sortedCopy(a);
    hw1::quicksort(a);
    REQUIRE(a == b);
}
TEST_CASE("correctly sorts subrange of container") {
    std::vector<int> a = {1, 10, -100, 0, 2, 2, 9};

    SECTION("sorting first half of container") {
        auto b = sortedCopy(a, 0, 4);
        hw1::quicksort(a, 0, 3);
        REQUIRE(a == b);
    }
    SECTION("sorting second half of container") {
        auto b = sortedCopy(a,4, 7);
        hw1::quicksort(a, 4, a.size()-1);
        REQUIRE(a == b);
    }
} 
TEST_CASE("handles out of bounds exceptions") {
    std::vector<int> original = {3, 2, 1};
    auto b = sortedCopy(original);
    SECTION("fixes invalid upper range") {
        auto a = original;
        hw1::quicksort(a, 0, 4);
        REQUIRE(a == b);
    }
    SECTION("fixes invalid lower range") {
        auto a = original;
        hw1::quicksort(a, -1, 3);
        REQUIRE(a == b);
    }
    SECTION("fixes both invalid upper and lower range") {
        auto a = original;
        hw1::quicksort(a,-1,5);
        REQUIRE(a==b);
    }
} 