disp("question 37")

A = [5 11 -6 -7 12; -7 -3 -4 6 -9; 11 5 6 -9 -3; -3 4 -7 2 7];
rref(A)
disp("after reducing this matrix we can see that it does not span R4, because")
disp("there are only 3 pivots")