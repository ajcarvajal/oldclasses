// contigsum_test.cpp
// Glenn G. Chappell
// 8 Oct 2015
//
// For CS 411/611 Fall 2015
// Test program for function contigSum
// Used in Assignment 3, Exercise A

// Includes for code to be tested
#include "contigsum.hpp"  // For function contigSum
#include "contigsum.hpp"  // Double inclusion test

// Includes for testing package & code common to all test programs
#include <iostream>     // for std::cout, std::endl, std::cin
#include <string>       // for std::string
#include <stdexcept>    // for std::runtime_error

// Additional includes for this test program
#include <vector>       // for std::vector
#include <deque>        // for std::deque


// ************************************************************************
// Testing Package:
//     Class Tester - For Tracking Tests
// ************************************************************************


// class Tester
// For extremely simple unit testing.
// Keeps track of number of tests and number of passes.
// Use test (with success/failure parameter) to do a test.
// Get results with numTests, numPassed, numFailed, allPassed.
// Restart testing with reset.
// Invariants:
//     countTests_ == number of tests (calls to test) since last reset.
//     countPasses_ == number of times function test called with true param
//      since last reset.
//     0 <= countPasses_ <= countTests_.
//     tolerance_ >= 0.
class Tester {

// ***** Tester: ctors, dctor, op= *****
public:

    // Default ctor
    // Sets countTests_, countPasses_ to zero, tolerance_ to given value
    // Pre: None.
    // Post:
    //     numTests == 0, countPasses == 0, tolerance_ == abs(theTolerance)
    // Does not throw (No-Throw Guarantee)
    Tester(double theTolerance = 0.0000001)
        :countTests_(0),
         countPasses_(0),
         tolerance_(theTolerance >= 0 ? theTolerance : -theTolerance)
    {}

    // Compiler-generated copy ctor, copy op=, dctor are used

// ***** Tester: general public functions *****
public:

    // test
    // Handles single test, param indicates pass/fail
    // Pre: None.
    // Post:
    //     countTests_ incremented
    //     countPasses_ incremented if (success)
    //     Message indicating test name (if given)
    //      and pass/fail printed to cout
    // Does not throw (No-Throw Guarantee)
    //  - Assuming exceptions have not been turned on for cout.
    void test(bool success,
              const std::string & testName = "")
    {
        ++countTests_;
        if (success) ++countPasses_;

        std::cout << "    ";
        if (testName != "")
        {
            std::cout << "Test: "
                      << testName
                      << " - ";
        }
        std::cout << (success ? "passed" : "********** FAILED **********")
                  << std::endl;
    }

    // ftest
    // Does single floating-point test.
    // Tests passes iff difference of first two values is <= tolerance.
    // Pre: None.
    // Post:
    //     countTests_ incremented
    //     countPasses_ incremented if (abs(val1-val2) <= tolerance_)
    //     Message indicating test name (if given)
    //      and pass/fail printed to cout
    // Does not throw (No-Throw Guarantee)
    void ftest(double val1,
               double val2,
               const std::string & testName = "")
    { test(val1-val2 <= tolerance_ && val2-val1 <= tolerance_, testName); }

    // reset
    // Resets *this to default constructed state
    // Pre: None.
    // Post:
    //     countTests_ == 0, countPasses_ == 0
    // Does not throw (No-Throw Guarantee)
    void reset()
    {
        countTests_ = 0;
        countPasses_ = 0;
    }

    // numTests
    // Returns the number of tests that have been done since last reset
    // Pre: None.
    // Post:
    //     return == countTests_
    // Does not throw (No-Throw Guarantee)
    int numTests() const
    { return countTests_; }

    // numPassed
    // Returns the number of tests that have passed since last reset
    // Pre: None.
    // Post:
    //     return == countPasses_
    // Does not throw (No-Throw Guarantee)
    int numPassed() const
    { return countPasses_; }

    // numFailed
    // Returns the number of tests that have not passed since last reset
    // Pre: None.
    // Post:
    //     return + countPasses_ == numTests_
    // Does not throw (No-Throw Guarantee)
    int numFailed() const
    { return countTests_ - countPasses_; }

    // allPassed
    // Returns true if all tests since last reset have passed
    // Pre: None.
    // Post:
    //     return == (countPasses_ == countTests_)
    // Does not throw (No-Throw Guarantee)
    bool allPassed() const
    { return countPasses_ == countTests_; }

    // setTolerance
    // Sets tolerance_ to given value
    // Pre: None.
    // Post:
    //     tolerance_ = abs(theTolerance)
    // Does not throw (No-Throw Guarantee)
    void setTolerance(double theTolerance)
    { tolerance_ = (theTolerance >= 0 ? theTolerance : -theTolerance); }

// ***** Tester: data members *****
private:

    int countTests_;    // Number of tests done since last reset
    int countPasses_;   // Number of tests passed since last reset
    double tolerance_;  // Tolerance for floating-point near-equality tests

};  // end class Tester


// ************************************************************************
// Testing Package:
//     Class TypeCheck - Helper Class for Type Checking
// ************************************************************************


// class TypeCheck
// This class exists in order to have static member function check, which
// takes a parameter of a given type, by reference. Objects of type
// TypeCheck<T> cannot be created.
// Usage:
//     TypeCheck<MyType>::check(x)
//     returns true if the type of x is (MyType) or (const MyType),
//     otherwise false.
// Invariants: None.
// Requirements on Types: None.
template<typename T>
class TypeCheck {

private:

    // Uncopyable class. Do not define copy ctor, copy assn.
    TypeCheck(const TypeCheck &);
    TypeCheck<T> & operator=(const TypeCheck &);

    // Compiler-generated dctor is used (but irrelevant).

public:

    // check
    // The function and function template below simulate a single function
    // that takes a single parameter, and returns true iff the parameter has
    // type T or (const T).

    // check (reference-to-const T)
    // Pre: None.
    // Post:
    //     Return is true.
    // Does not throw (No-Throw Guarantee)
    static bool check(const T & param)
    { return true; }

    // check (reference-to-const non-T)
    // Pre: None.
    // Post:
    //     Return is false.
    // Requirements on types: None.
    // Does not throw (No-Throw Guarantee)
    template <typename OtherType>
    static bool check(const OtherType & param)
    { return false; }

};  // End class TypeCheck


// ************************************************************************
// Testing Package:
//     Class Counter - Helper Class for Counting Calls & Objects, Throwing
// ************************************************************************


// class Counter
// Item type for counting ctor, dctor, op= calls, counting existing
//  objects, and possibly throwing on copy. Has operator< (which always
//  returns false), allowing it to be the value type of a sorted container.
// If static member copyThrow_ is set, then copy ctor and copy assn throw
//  std::runtime_error. Exception object's "what" member is set to "C" by
//  the copy ctor and "A" by copy assn.
// Increments static data member ctorCount_ on default construction and
//  successful copy construction. Increments static data member assnCount_
//  on successful copy assignment. Increments static data member
//  dctorCount_ on destruction.
// Increments static data member existing_ on construction, and decrements
//  it on destruction.
// Static data member maxExisting_ is highest value of existing_ since last
//  reset, or start of program if reset has never been called.
// Invariants:
//     Counter::existing_ is number of existing objects of this class.
//     Counter::ctorCount_ is number of successful ctor calls since
//      most recent call to reset, or start of program if reset has never
//      been called.
//     Counter::dctorCount_ is (similarly) number of dctor calls.
//     Counter::assnCount_ is (similarly) number of copy assn calls.
//     Counter::maxExisting_ is (similarly) highest value existing_ has
//      assumed.
class Counter {

// ***** Counter: Ctors, dctor, op= *****
public:

    // Default ctor
    // Pre: None.
    // Post:
    //     (ctorCount_ has been incremented.)
    //     (existing_ has been incremented.)
    // Does not throw (No-Throw Guarantee)
    Counter()
    {
        ++existing_;
        if (existing_ > maxExisting_)
            maxExisting_ = existing_;
        ++ctorCount_;
    }

    // Copy ctor
    // Throws std::runtime_error if copyThrow_.
    // Pre: None.
    // Post:
    //     (ctorCount_ has been incremented.)
    //     (existing_ has been incremented.)
    // May throw std::runtime_error
    // Strong Guarantee
    Counter(const Counter & other)
    {
        if (copyThrow_)
            throw std::runtime_error("C");
        ++existing_;
        if (existing_ > maxExisting_)
            maxExisting_ = existing_;
        ++ctorCount_;
    }

    // Copy assignment
    // Throws std::runtime_error if copyThrow_.
    // Pre: None.
    // Post:
    //     Return value is *this.
    //     (assnCount_ has been incremented.)
    // May throw std::runtime_error
    // Strong Guarantee
    Counter & operator=(const Counter & rhs)
    {
        if (copyThrow_)
            throw std::runtime_error("A");
        ++assnCount_;
        return *this;
    }

    // Dctor
    // Pre: None.
    // Post:
    //     (dctorCount_ has been incremented.)
    //     (existing_ has been decremented.)
    // Does not throw (No-Throw Guarantee)
    ~Counter()
    {
        --existing_;
        ++dctorCount_;
    }

// ***** Counter: Functions dealing with count *****
public:

    // reset
    // Pre: None.
    // Post:
    //     maxExisting_ == existing_.
    //     ctorCount_ == 0.
    //     dctorCount_ == 0.
    //     assnCount_ == 0.
    //     copyThrow_ == shouldThrow.
    // Does not throw (No-Throw Guarantee)
    static void reset(bool shouldThrow = false)
    {
        maxExisting_ = existing_;
        ctorCount_ = 0;
        dctorCount_ = 0;
        assnCount_ = 0;
        copyThrow_ = shouldThrow;
    }

    // getExisting
    // Pre: None.
    // Post:
    //     return == existing_.
    // Does not throw (No-Throw Guarantee)
    static int getExisting()
    { return existing_; }

    // getMaxExisting
    // Pre: None.
    // Post:
    //     return == maxExisting_.
    // Does not throw (No-Throw Guarantee)
    static int getMaxExisting()
    { return maxExisting_; }

    // getCtorCount
    // Pre: None.
    // Post:
    //     return == ctorCount_.
    // Does not throw (No-Throw Guarantee)
    static int getCtorCount()
    { return ctorCount_; }

    // getDctorCount
    // Pre: None.
    // Post:
    //     return == dctorCount_.
    // Does not throw (No-Throw Guarantee)
    static int getDctorCount()
    { return dctorCount_; }

    // getAssnCount
    // Pre: None.
    // Post:
    //     return == assnCount_.
    // Does not throw (No-Throw Guarantee)
    static int getAssnCount()
    { return assnCount_; }

    // setCopyThrow
    // Pre: None.
    // Post:
    //     copyThrow_ == shouldThrow
    // Does not throw (No-Throw Guarantee)
    static void setCopyThrow(bool shouldThrow)
    { copyThrow_ = shouldThrow; }

// ***** Counter: Data Members *****
private:

    static int existing_;     // # of existing objects
    static int maxExisting_;  // Max # of existing objects
    static int ctorCount_;    // # of successful (non-throwing) ctor calls
    static int dctorCount_;   // # of dctor calls
    static int assnCount_;    // # of successful (non-throwing) copy = calls
    static bool copyThrow_;   // true if copy operations (ctor, =) throw

};  // End class Counter

// Definition of static data member of class Counter
int Counter::existing_ = 0;
int Counter::maxExisting_ = 0;
int Counter::ctorCount_ = 0;
int Counter::dctorCount_ = 0;
int Counter::assnCount_ = 0;
bool Counter::copyThrow_ = false;


// operator< (Counter)
// Dummy-ish operator<, forming a strict weak order for Counter class
// Returns false (which is legal for a strict weak order; all objects of
//  type Counter are equivalent).
// Pre: None.
// Post:
//     Return value == false.
// Does not throw (No-Throw Guarantee)
bool operator<(const Counter & a,
               const Counter & b)
{ return false; }


// ************************************************************************
// Helper Functions/Classes/Types for This Test Program
// ************************************************************************


// NONE


// ************************************************************************
// Test Suite Functions
// ************************************************************************


// test_contigSum_small
// Test suite for function contigSum: small examples
// Pre: None.
// Post:
//     Pass/fail status of tests have been registered with t.
//     Appropriate messages have been printed to cout.
// Does not throw (No-Throw Guarantee)
void test_contigSum_small(Tester & t)
{
    std::cout << "Test Suite: function contigSum - small examples"
              << std::endl;


    {
    // Empty sequence
    std::vector<int> v;
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 0, "Empty sequence");
    }

    {
    // Singleton, positive
    const int DATASIZE = 1;
    int data[DATASIZE] = { 5 };
    std::vector<int> v(data, data+DATASIZE);
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 5, "Size 1, positive");
    }

    {
    // Singleton, negative
    const int DATASIZE = 1;
    int data[DATASIZE] = { -3 };
    std::vector<int> v(data, data+DATASIZE);
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 0, "Size 1, negative");
    }

    {
    // Singleton, zero
    const int DATASIZE = 1;
    int data[DATASIZE] = { 0 };
    std::vector<int> v(data, data+DATASIZE);
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 0, "Size 1, zero");
    }

    {
    // Size 2, pos pos
    const int DATASIZE = 2;
    int data[DATASIZE] = { 5, 3 };
    std::vector<int> v(data, data+DATASIZE);
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 8, "Size 2, pos pos");
    }

    {
    // Size 2, pos neg
    const int DATASIZE = 2;
    int data[DATASIZE] = { 5, -4 };
    std::vector<int> v(data, data+DATASIZE);
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 5, "Size 2, pos neg");
    }

    {
    // Size 2, neg pos
    const int DATASIZE = 2;
    int data[DATASIZE] = { -5, 3 };
    std::vector<int> v(data, data+DATASIZE);
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 3, "Size 2, neg pos");
    }

    {
    // Size 2, neg neg
    const int DATASIZE = 2;
    int data[DATASIZE] = { -5, -6 };
    std::vector<int> v(data, data+DATASIZE);
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 0, "Size 2, neg neg");
    }

    {
    // Size 3, #1
    const int DATASIZE = 3;
    int data[DATASIZE] = { 6, -5, 2 };
    std::vector<int> v(data, data+DATASIZE);
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 6, "Size 3, #1");
    }

    {
    // Size 3, #2
    const int DATASIZE = 3;
    int data[DATASIZE] = { 1, -5, 7 };
    std::vector<int> v(data, data+DATASIZE);
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 7, "Size 3, #2");
    }

    {
    // Size 3, #3
    const int DATASIZE = 3;
    int data[DATASIZE] = { 6, -5, 7 };
    std::vector<int> v(data, data+DATASIZE);
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 8, "Size 3, #3");
    }

    {
    // Size 20, #1
    const int DATASIZE = 20;
    int data[DATASIZE] = { 6, -5, 0, 7, 11, -6, -1, 9, 12, -7,
                           5, 8, 2, 4, 10, -4, 3, 1, -2, -3 };
    std::vector<int> v(data, data+DATASIZE);
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 55, "Size 20, #1");
    }

    {
    // Size 20, #2
    const int DATASIZE = 20;
    int data[DATASIZE] = { 5, -2, 1, 12, 10, -1, 3, 4, 8, 11,
                           6, -5, -7, -3, 9, 7, 0, -4, -6, 2 };
    std::vector<int> v(data, data+DATASIZE);
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 58, "Size 20, #2");
    }

    {
    // Size 20, #3
    const int DATASIZE = 20;
    int data[DATASIZE] = { 7, -1, 8, 0, 5, 1, 10, 2, -7, 3,
                           -5, 11, 12, -4, 9, 6, 4, -3, -2, -6 };
    std::vector<int> v(data, data+DATASIZE);
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(contigSum(vc.begin(), vc.end()) == 61, "Size 20, #3");
    }
}


// test_contigSum_large
// Test suite for function contigSum: large examples
// Pre: None.
// Post:
//     Pass/fail status of tests have been registered with t.
//     Appropriate messages have been printed to cout.
// Does not throw (No-Throw Guarantee)
void test_contigSum_large(Tester & t)
{
    std::cout << "Test Suite: function contigSum - large examples"
              << std::endl;

    {
    // Large #1
    std::vector<int> v;
    const std::vector<int> & vc(v);    // Const ref to above
    const int N = 100000;
    for (int i = 0; i < N; ++i)
    {
        v.push_back(2);
        v.push_back(-3);
    }
    for (int i = 0; i < N; ++i)
    {
        v.push_back(5);
        v.push_back(-4);
        v.push_back(5);
    }
    for (int i = 0; i < N; ++i)
    {
        v.push_back(-2);
        v.push_back(1);
    }
    t.test(contigSum(vc.begin(), vc.end()) == 6*N, "Large #1");
    }

    {
    // Large #2
    std::vector<int> v;
    const std::vector<int> & vc(v);    // Const ref to above
    const int N = 100000;
    for (int i = 0; i < N; ++i)
    {
        v.push_back(2);
        v.push_back(-3);
    }
    for (int i = 0; i < N; ++i)
    {
        v.push_back(6);
        v.push_back(-4);
    }
    for (int i = 0; i < N; ++i)
    {
        v.push_back(-2);
        v.push_back(1);
    }
    t.test(contigSum(vc.begin(), vc.end()) == 2*N+4, "Large #2");
    }

    {
    // Large #3
    std::vector<int> v;
    const std::vector<int> & vc(v);    // Const ref to above
    const int N = 100000;
    for (int i = 0; i < N; ++i)
    {
        v.push_back(5);
    }
    for (int i = 0; i < N; ++i)
    {
        v.push_back(-6);
    }
    for (int i = 0; i < N; ++i)
    {
        v.push_back(7);
    }
    t.test(contigSum(vc.begin(), vc.end()) == 7*N, "Large #3");
    }

    {
    // Large #4
    std::vector<int> v;
    const std::vector<int> & vc(v);    // Const ref to above
    const int N = 100000;
    for (int i = 0; i < N; ++i)
    {
        v.push_back(8);
    }
    for (int i = 0; i < N; ++i)
    {
        v.push_back(-6);
    }
    for (int i = 0; i < N; ++i)
    {
        v.push_back(7);
    }
    t.test(contigSum(vc.begin(), vc.end()) == 9*N, "Large #4");
    }
}


// test_contigSum_types
// Test suite for function contigSum: type checking
// Pre: None.
// Post:
//     Pass/fail status of tests have been registered with t.
//     Appropriate messages have been printed to cout.
// Does not throw (No-Throw Guarantee)
void test_contigSum_types(Tester & t)
{
    std::cout << "Test Suite: function contigSum - type checking"
              << std::endl;

    {
    // Return type
    std::vector<int> v;
    const std::vector<int> & vc(v);    // Const ref to above
    t.test(TypeCheck<int>::check(contigSum(vc.begin(), vc.end())),
        "Return type is int");
    }

    {
    // Unusual iterators
    std::deque<int> v;
    const std::deque<int> & vc(v);    // Const ref to above
    const int N = 100;
    for (int i = 0; i < N; ++i)
    {
        v.push_back(2);
        v.push_back(-3);
    }
    for (int i = 0; i < N; ++i)
    {
        v.push_back(5);
        v.push_back(-4);
        v.push_back(5);
    }
    for (int i = 0; i < N; ++i)
    {
        v.push_back(-2);
        v.push_back(1);
    }
    t.test(contigSum(vc.rbegin(), vc.rend()) == 6*N, "Unusual iterators");
    }
}


// test_contigSum
// Test suite for function contigSum
// Uses other test-suite functions
// Pre: None.
// Post:
//     Pass/fail status of tests have been registered with t.
//     Appropriate messages have been printed to cout.
// Does not throw (No-Throw Guarantee)
void test_contigSum(Tester & t)
{
    // Do all the test suites
    std::cout << "TEST SUITES FOR FUNCION contigSum" << std::endl;
    test_contigSum_small(t);
    test_contigSum_large(t);
    test_contigSum_types(t);
}


// ************************************************************************
// Main program
// ************************************************************************


// main
// Runs function contigSum test suite, prints results to cout.
int main()
{
    Tester t;
    test_contigSum(t);

    std::cout << std::endl;
    if (t.allPassed())
    {
        std::cout << "All tests successful"
                  << std::endl;
    }
    else
    {
        std::cout << "Tests ********** UNSUCCESSFUL **********"
                  << std::endl;
    }
    std::cout << std::endl;

    // Wait for user
    std::cout << "Press ENTER to quit ";
    while (std::cin.get() != '\n') ;

    return 0;
}
