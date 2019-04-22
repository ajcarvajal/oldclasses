disp("___Question 40___")

b = [4; -4; -4; -7]
A = [3 4 -7 0; 5 -8 7 4; 6 -8 6 4; 9 -7 -2 0]

rref([A,b]) %reduce augmented matrix to see if system is consistent

disp("The reduced system shows us that we have at least one solution,")
disp("therefore b is in the range of transformations of Ax.\n")

disp("Next find an x that creates the transformation b")
x = sym(A) \ sym(b)