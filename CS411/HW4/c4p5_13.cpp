#include <iostream>
using std::cout;
using std::endl;
#include <vector>
using std::vector;

/* chapter 4.5 #13
You need to search for a given number in an n × n matrix in which every
row and every column is sorted in increasing order. Can you design a O(n)
algorithm for this problem? [Laa10] */

//implementation of code outlined here: https://www.geeksforgeeks.org/?p=11337


int matrixSearch(vector<vector<int>> input, size_t size, int key)
{
    int i = 0, j = size-1;
    while( i < size && j >= 0)
    {
        if(input[i][j] == key) return j+(i*10);
        if(input[i][j] > key) j--;
        else i++;
    }
}

int main()
{
    vector<vector<int>> input(10, vector<int>(10));
    int count = 0;
    for (int i = 0; i < 10; ++i)
    {
        for (int j = 0; j < 10; ++j)
        {
            input[i][j] = count;
            count++;
        }
    }
    cout<<matrixSearch(input, 10, 16)<<endl;
    return 0;
}
