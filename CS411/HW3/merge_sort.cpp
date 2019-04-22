// merge_sort.cpp
// Glenn G. Chappell
// 9 Oct 2015
//
// For CS 411/611 Fall 2015
// Merge Sort using Iterators

#include <iostream>
using std::cout;
using std::endl;
using std::cin;
#include <vector>
using std::vector;
#include <cstddef>
using std::size_t;
#include <algorithm>
using std::copy;
#include <iterator>
using std::distance;
using std::advance;
#include <type_traits>
using std::remove_reference;


// stableMerge
// Merge two halves of a sequence, each sorted, into a single sorted
// sequence in the same location. Merge is done in a stable manner.
// Requirements on Types:
//     FDIter is a forward iterator type.
//     The value type of FDIter has default ctor, dctor, copy=,
//      operator<.
//     operator< is a total order on the value type of FDIter.
// Pre:
//     [first, middle) and [middle, last) are valid ranges, each sorted
//      by <.
// Post:
//     [first, last) contains the same items as it did initially, but
//      now sorted by < (in a stable manner).
template <typename FDIter>
void stableMerge(FDIter first, FDIter middle, FDIter last)
{
    // ** C++03:
    //typedef typename iterator_traits<FDIter>::value_type Value;
    // ** C++11:
    using Value = typename remove_reference<decltype(*first)>::type;
    // ** Is this really better?

    vector<Value> buffer(distance(first, last));
                                // Buffer for temporary copy of data
    FDIter in1 = first;         // Read location in 1st half
    FDIter in2 = middle;        // Read location in 2nd half
    auto out = buffer.begin();  // Write location in buffer
    // ** auto! That *is* better than vector<Value>::iterator

    // Merge two sorted lists into a single list in buff.
    while (in1 != middle && in2 != last)
    {
        if (*in2 < *in1)  // Must do comparison this way, to be stable.
            *out++ = *in2++;
            
        else
            *out++ = *in1++;
    }

    // Copy remainder of original sequence to buffer.
    // Only one of the following two copy calls will do anything, since
    //  the other is given an empty source range.
    copy(in1, middle, out);
    copy(in2, last, out);

    // Copy buffer contents back to original sequence location.
    copy(buffer.begin(), buffer.end(), first);
}


// mergeSort
// Sorts a sequence, using Merge Sort.
// Recursive.
// Requirements on Types:
//     FDIter is a forward iterator type.
//     The value type of FDIter has default ctor, dctor, copy=,
//      operator<.
//     operator< is a total order on the value type of FDIter.
// Pre:
//     [first, last) is a valid range.
// Post:
//     [first, last) contains the same items as it did initially,
//      but now sorted by < (in a stable manner).
template <typename FDIter>
void mergeSort(FDIter first, FDIter last)
{
    // Compute size of sequence
    size_t size = distance(first, last);

    // BASE CASE
    if (size <= 1)
        return;

    // RECURSIVE CASE
    FDIter middle = first;
    advance(middle, size/2);  // middle is iterator to middle of range

    // Recursively sort the two lists
    mergeSort(first, middle);
    mergeSort(middle, last);

    // And merge them
    stableMerge(first, middle, last);
}


// Main program
// Demonstrates use of function mergeSort.
int main()
{
    // Set up data to sort
    vector<int> v { 5, 3, 2, 8, 5, 9, 10, 4, 6, 1, -4 };

    // Print unaltered data
    cout << "Before:" << endl;
    for (const auto & val : v)
        cout << val << " ";
    cout << endl;
    cout << endl;

    // Do a sort
    mergeSort(v.begin(), v.end());

    // Print results
    cout << "After:" << endl;
    for (const auto & val : v)
        cout << val << " ";
    cout << endl;
    cout << endl;

    // Wait for user
    cout << "Press ENTER to quit ";
    while (cin.get() != '\n') ;

    return 0;
}
