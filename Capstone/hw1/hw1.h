#ifndef HW1_H
#define HW1_H
#include <algorithm>
#include <vector>

namespace hw1 {

//quicksort
//noexcept
template <typename T>
void quicksort(std::vector<T>& data, int low, int high) {
    if (low < 0 || high > data.size() - 1) { //check for out of range errors
        quicksort(data);
    } else if (low < high) {
        int pivot = partition(data, low, high);
        quicksort(data, low, pivot - 1);
        quicksort(data, pivot + 1, high);
    }
}
//quicksort override
//corrects input when provided only a vector
//assumes user wants entire range sorted
template <typename T>
void quicksort(std::vector<T>& data) {
    quicksort(data, 0, data.size() - 1);
}
template <typename T>
int partition(std::vector<T>& data, int low, int high) {
    int pivot = data[high];
    int i = low - 1;
    for (int j = low; j <= high - 1; ++j) {
        if (data[j] <= pivot) {
            i++;
            std::swap(data[i], data[j]);
        }
    }
    if (data[high] < data[i + 1]) {
        std::swap(data[i + 1], data[high]);
    }
    return i + 1;
}
}  // namespace hw1

#endif  //HW1_H